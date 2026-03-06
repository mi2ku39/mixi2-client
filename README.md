# tsdown-starter

A starter for creating a TypeScript package.

## Development

- Install dependencies:

```bash
npm install
```

- Run the unit tests:

```bash
npm run test
```

- Build the library:

```bash
npm run build
```

## Generate type definitions from `mixi2-api`

Initialize submodules and run the generation script:

```bash
git submodule update --init --recursive
npm run generate:mixi2-types
```

The script searches known OpenAPI schema locations under `mixi2-api/` and writes generated TypeScript definitions to `src/generated/mixi2-api.ts`.
