# Habito

Simple habit tracker CLI.

## Quick Start

```bash
npm install
```

## Commands

```bash
npm run dev -- add --name "Drink water"
npm run dev -- list
npm run dev -- done --id <habitId> --date 2026-03-10
npm run dev -- stats
npm run dev -- delete --id <habitId>
```

Build and run the compiled CLI:

```bash
npm run build
npm run start -- list
```

Note: the `--` after `npm run dev` or `npm run start` forwards the rest of the arguments to the CLI.

Data is stored at `~/.habito/habito-data.json`.
