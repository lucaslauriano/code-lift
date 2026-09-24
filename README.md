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

## Rodando

Antes de qualquer coisa, uma vez:

```bash
cp .env.example .env
```

E edite duas linhas do `.env` — o app avisa no boot enquanto a senha for o placeholder:

```
JWT_SECRET=            # openssl rand -hex 32
SEED_USER_PASSWORD=    # a senha com que você vai entrar
```

### Tudo em container

```bash
docker compose up
```

Sobe Postgres, API e web. Na primeira vez aplica as migrations, cria o usuário e sincroniza as
questões. Abra **http://localhost:3010** e entre com `SEED_USER_EMAIL` / `SEED_USER_PASSWORD`.

### Dia a dia

Só o banco em container, o resto local com hot reload:

```bash
pnpm install
pnpm db:up               # Postgres em :5434
pnpm db:migrate
pnpm db:seed             # cria o usuário
pnpm content:sync        # sincroniza as questões
pnpm dev                 # web em :3010, api em :3334 (docs em /docs)
```

> As portas não são as convencionais (3000/3333/5432) porque esta máquina já as usava. Todas vêm
> do `.env`, então mude à vontade.

## Comandos

```
pnpm dev · pnpm build · pnpm test · pnpm typecheck · pnpm lint
pnpm content:validate · pnpm content:sync · pnpm db:up · pnpm db:migrate · pnpm db:seed
pnpm test:e2e            # Playwright; exige os servidores já no ar
```

## Notas de implementação

- A transpilação TS→JS acontece no worker com **sucrase** (leve, síncrono, sem WASM). Se algum dia
  precisarmos de _bundling_ de verdade (imports entre arquivos, npm no browser), o upgrade natural é
  `esbuild-wasm`.
- Os casos de teste ocultos são enviados ao browser no Submit. Eles são ocultos na UI, não secretos —
  é o preço inevitável de nunca executar código do usuário no servidor.
