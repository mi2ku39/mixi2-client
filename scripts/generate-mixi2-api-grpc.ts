import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, extname, relative, resolve, delimiter } from 'node:path'
import process from 'node:process'
import { tmpdir } from 'node:os'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const rootDir = process.cwd()
const submoduleDir = resolve(rootDir, 'mixi2-api')
const protoRootDir = resolve(submoduleDir, 'proto')
const generatedDir = resolve(rootDir, 'src/generated/mixi2-api-grpc')
const outputFile = resolve(rootDir, 'src/generated/mixi2-api-grpc.ts')
const binDir = resolve(rootDir, 'node_modules/.bin')
const bufCliPath = resolve(
  rootDir,
  'node_modules/.bin',
  process.platform === 'win32' ? 'buf.cmd' : 'buf',
)
const tsProtoPluginPath = resolve(
  rootDir,
  'node_modules/.bin',
  process.platform === 'win32' ? 'protoc-gen-ts_proto.cmd' : 'protoc-gen-ts_proto',
)

function toPosixPath(path: string): string {
  return path.split('\\').join('/')
}

function createModuleImportName(modulePath: string): string {
  const normalizedPath = modulePath.replace(/^mixi2-api-grpc\//u, '')
  const baseName = `module_${normalizedPath.replace(/[^a-zA-Z0-9]/gu, '_')}`
  if (/^[0-9]/u.test(baseName)) {
    return `_${baseName}`
  }
  return baseName
}

type ModuleCategory = 'const' | 'model' | 'service'

interface ModuleEntry {
  category: ModuleCategory
  importName: string
  modulePath: string
  objectPath: string[]
}

interface ObjectTreeNode {
  children: Map<string, ObjectTreeNode>
  moduleImportName?: string
}

function createTreeNode(): ObjectTreeNode {
  return {
    children: new Map(),
  }
}

function classifyModulePath(modulePath: string): { category: ModuleCategory; objectPath: string[] } {
  const normalizedPath = modulePath.replace(/^mixi2-api-grpc\//u, '')
  const segments = normalizedPath.split('/')
  const categoryIndex = segments.findIndex(
    (segment) => segment === 'const' || segment === 'model' || segment === 'service',
  )

  if (categoryIndex === -1) {
    return {
      category: 'model',
      objectPath: segments,
    }
  }

  const category = segments[categoryIndex] as ModuleCategory
  return {
    category,
    objectPath: [...segments.slice(0, categoryIndex), ...segments.slice(categoryIndex + 1)],
  }
}

function insertIntoObjectTree(root: ObjectTreeNode, objectPath: string[], importName: string): void {
  let currentNode = root
  for (const segment of objectPath) {
    const existingNode = currentNode.children.get(segment)
    if (existingNode) {
      currentNode = existingNode
      continue
    }
    const nextNode = createTreeNode()
    currentNode.children.set(segment, nextNode)
    currentNode = nextNode
  }

  if (currentNode.moduleImportName) {
    throw new Error(
      `Duplicate module object path detected: ${objectPath.join('/')} (${currentNode.moduleImportName}, ${importName})`,
    )
  }
  currentNode.moduleImportName = importName
}

function renderObjectTree(node: ObjectTreeNode, indentLevel: number): string {
  if (node.children.size === 0) {
    return node.moduleImportName ?? '{}'
  }

  const indent = '  '.repeat(indentLevel)
  const childIndent = '  '.repeat(indentLevel + 1)
  const lines = ['{']

  if (node.moduleImportName) {
    lines.push(`${childIndent}"__module": ${node.moduleImportName},`)
  }

  const sortedChildren = [...node.children.entries()].sort(([a], [b]) => a.localeCompare(b))
  for (const [key, childNode] of sortedChildren) {
    lines.push(`${childIndent}${JSON.stringify(key)}: ${renderObjectTree(childNode, indentLevel + 1)},`)
  }

  lines.push(`${indent}}`)
  return lines.join('\n')
}

function createModuleEntries(modulePaths: string[]): ModuleEntry[] {
  const usedImportNames = new Map<string, number>()
  return modulePaths.map((modulePath) => {
    const baseImportName = createModuleImportName(modulePath)
    const duplicateCount = usedImportNames.get(baseImportName) ?? 0
    usedImportNames.set(baseImportName, duplicateCount + 1)
    const importName = duplicateCount === 0 ? baseImportName : `${baseImportName}_${duplicateCount + 1}`
    const { category, objectPath } = classifyModulePath(modulePath)
    return {
      category,
      importName,
      modulePath,
      objectPath,
    }
  })
}

function renderCategoryObject(moduleEntries: ModuleEntry[], category: ModuleCategory): string {
  const rootNode = createTreeNode()
  for (const moduleEntry of moduleEntries) {
    if (moduleEntry.category !== category) {
      continue
    }
    insertIntoObjectTree(rootNode, moduleEntry.objectPath, moduleEntry.importName)
  }
  return renderObjectTree(rootNode, 2)
}

async function collectProtoFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry): Promise<string[]> => {
      const absolutePath = resolve(dir, entry.name)
      if (entry.isDirectory()) {
        return collectProtoFiles(absolutePath)
      }
      if (!entry.isFile()) {
        return []
      }
      if (extname(entry.name) !== '.proto') {
        return []
      }
      return [absolutePath]
    }),
  )

  return files.flat()
}

async function collectTypeScriptFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry): Promise<string[]> => {
      const absolutePath = resolve(dir, entry.name)
      if (entry.isDirectory()) {
        return collectTypeScriptFiles(absolutePath)
      }
      if (!entry.isFile()) {
        return []
      }
      if (extname(entry.name) !== '.ts') {
        return []
      }
      if (entry.name === 'index.ts') {
        return []
      }
      return [absolutePath]
    }),
  )

  return files.flat()
}

async function ensureGeneratorToolsAvailable(): Promise<void> {
  if (!existsSync(bufCliPath)) {
    throw new Error(
      [
        '`@bufbuild/buf` is not installed.',
        'Run `pnpm install` first and then retry `pnpm run generate:mixi2-grpc`.',
      ].join(' '),
    )
  }

  if (!existsSync(tsProtoPluginPath)) {
    throw new Error(
      [
        '`ts-proto` is not installed.',
        'Run `pnpm install` first and then retry `pnpm run generate:mixi2-grpc`.',
      ].join(' '),
    )
  }

  try {
    await execFileAsync(bufCliPath, ['--version'], {
      cwd: rootDir,
      maxBuffer: 1024 * 1024,
    })
  } catch {
    throw new Error('Failed to execute local buf CLI from @bufbuild/buf package.')
  }
}

async function generateGrpcImplementationFromProto(): Promise<void> {
  await mkdir(dirname(outputFile), { recursive: true })
  await rm(generatedDir, { recursive: true, force: true })
  await mkdir(generatedDir, { recursive: true })

  const templateDir = await mkdtemp(resolve(tmpdir(), 'mixi2-api-grpc-'))
  const templatePath = resolve(templateDir, 'buf.gen.yaml')
  const outputRelativePath = toPosixPath(relative(rootDir, generatedDir))
  const template = [
    'version: v2',
    'plugins:',
    '  - local: protoc-gen-ts_proto',
    `    out: ${outputRelativePath}`,
    '    opt:',
    '      - env=node',
    '      - esModuleInterop=true',
    '      - outputServices=grpc-js',
    '      - exportCommonSymbols=false',
    '      - outputEncodeMethods=true',
    '      - outputJsonMethods=true',
    '      - outputPartialMethods=true',
    '',
  ].join('\n')

  await writeFile(templatePath, template, 'utf8')

  const protoFiles = await collectProtoFiles(protoRootDir)
  if (protoFiles.length === 0) {
    throw new Error('No proto files found under mixi2-api/proto.')
  }

  const pathWithBin = [binDir, process.env.PATH].filter(Boolean).join(delimiter)

  try {
    await execFileAsync(bufCliPath, ['generate', protoRootDir, '--template', templatePath], {
      cwd: rootDir,
      env: {
        ...process.env,
        PATH: pathWithBin,
      },
      maxBuffer: 10 * 1024 * 1024,
    })
  } finally {
    await rm(templateDir, { recursive: true, force: true })
  }
}

async function writeBarrelFile(): Promise<number> {
  const generatedFiles = await collectTypeScriptFiles(generatedDir)
  if (generatedFiles.length === 0) {
    throw new Error('No TypeScript files were generated from proto files.')
  }

  const modulePaths = generatedFiles
    .map((absolutePath) => relative(dirname(outputFile), absolutePath))
    .map((path) => toPosixPath(path).replace(/\.ts$/u, ''))
    .sort((a, b) => a.localeCompare(b))
  const moduleEntries = createModuleEntries(modulePaths)
  const importLines = moduleEntries.map(
    (moduleEntry) => `import * as ${moduleEntry.importName} from './${moduleEntry.modulePath}'`,
  )

  const mixi2ApiGrpcObject = [
    'export const mixi2ApiGrpc = {',
    `  const: ${renderCategoryObject(moduleEntries, 'const')},`,
    `  model: ${renderCategoryObject(moduleEntries, 'model')},`,
    `  service: ${renderCategoryObject(moduleEntries, 'service')},`,
    '} as const',
    '',
  ].join('\n')

  const banner = [
    '/**',
    ' * This file is auto-generated from mixi2-api proto definitions.',
    ' * Do not edit this file directly.',
    ' */',
    '',
  ].join('\n')

  await writeFile(outputFile, `${banner}${importLines.join('\n')}\n\n${mixi2ApiGrpcObject}`, 'utf8')
  return generatedFiles.length
}

async function main(): Promise<void> {
  if (!existsSync(submoduleDir)) {
    throw new Error(
      'mixi2-api submodule directory is missing. Run `git submodule update --init --recursive` first.',
    )
  }
  if (!existsSync(protoRootDir)) {
    throw new Error(
      `Proto directory is missing: ${relative(rootDir, protoRootDir)}. Run \`git submodule update --init --recursive\` first.`,
    )
  }

  await ensureGeneratorToolsAvailable()
  await generateGrpcImplementationFromProto()
  const generatedCount = await writeBarrelFile()

  const relativeOutputPath = relative(rootDir, outputFile)
  const relativeGeneratedDir = relative(rootDir, generatedDir)
  console.log(
    `Generated ${generatedCount} TypeScript files in ${relativeGeneratedDir} and wrote barrel exports to ${relativeOutputPath}.`,
  )
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
