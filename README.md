# code-lift

Plataforma pessoal de treino para entrevistas de engenharia frontend, no estilo do GreatFrontEnd.
Monolito: um repositório, um `docker compose up`.

## Stack

| Camada             | O que é                                                               |
| ------------------ | --------------------------------------------------------------------- |
| `apps/web`         | Next.js 16 (App Router), Tailwind 4, shadcn/ui, Monaco                |
| `apps/api`         | NestJS 12, Prisma 7, PostgreSQL 16, Swagger em `/docs`                |
| `packages/shared`  | Enums e schemas zod — a fonte de verdade dos contratos                |
| `packages/runner`  | Motor de execução: transpile (sucrase), harness de testes, Web Worker |
| `packages/content` | As questões, como arquivo versionado no git                           |
| `packages/ui`      | Componentes shadcn/ui compartilhados                                  |
| `packages/config`  | tsconfig, ESLint e Prettier compartilhados                            |

## Regras de arquitetura

1. **Código do usuário nunca roda no servidor.** Algoritmos e JS functions rodam em Web Worker;
   UI coding roda em iframe sandboxed. O backend só recebe o resultado.
2. **Conteúdo é arquivo, não banco.** `packages/content` é a fonte; o Postgres guarda apenas
   metadados sincronizados e os dados do usuário.
3. **Uma questão só entra no banco se a solução de referência passar em todos os próprios casos.**

## Começando

```bash
cp .env.example .env     # ajuste SEED_USER_PASSWORD e JWT_SECRET
pnpm install
pnpm db:up               # sobe só o Postgres em container
pnpm db:migrate
pnpm db:seed             # cria o usuário e sincroniza o conteúdo
pnpm dev                 # web em :3000, api em :3333
```

Tudo em container (o caminho do "critério de pronto"):

```bash
docker compose up
```

## Comandos

```
pnpm dev · pnpm build · pnpm test · pnpm typecheck · pnpm lint
pnpm content:validate · pnpm content:sync · pnpm db:migrate · pnpm db:seed
pnpm test:e2e
```

## Notas de implementação

- A transpilação TS→JS acontece no worker com **sucrase** (leve, síncrono, sem WASM). Se algum dia
  precisarmos de _bundling_ de verdade (imports entre arquivos, npm no browser), o upgrade natural é
  `esbuild-wasm`.
- Os casos de teste ocultos são enviados ao browser no Submit. Eles são ocultos na UI, não secretos —
  é o preço inevitável de nunca executar código do usuário no servidor.
