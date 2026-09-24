# code-lift

Plataforma pessoal de treino para entrevistas frontend (estilo GreatFrontEnd). Monolito: monorepo
pnpm, Next.js (`apps/web`) + NestJS (`apps/api`) + Postgres, um único deploy.

## Regras

- Código do usuário **nunca** roda no servidor. Só Web Worker (`packages/runner`) e iframe sandbox
  (Sandpack, fase 2). O backend só recebe o resultado.
- Conteúdo é arquivo em `packages/content`. O banco guarda só metadados sincronizados + dados do
  usuário.
- Uma questão só entra no banco se a solução de referência passar em **todos** os próprios casos.
- Toda tabela de usuário tem `userId`. Sem billing/premium/admin por enquanto.
- TS strict, sem `any`. Zod em `packages/shared` é a fonte de verdade dos contratos — a API valida
  com esses schemas e o web tipa as respostas com os mesmos.
- Antes de encerrar qualquer tarefa: `pnpm typecheck && pnpm lint && pnpm test && pnpm content:validate`.
- Conventional Commits, commits pequenos.

## Comandos

```
pnpm dev · pnpm build · pnpm test · pnpm typecheck · pnpm lint
pnpm content:validate · pnpm content:sync · pnpm db:up · pnpm db:migrate · pnpm db:seed
pnpm test:e2e
```

## Layout

`apps/web` · `apps/api` · `packages/shared` · `packages/db` · `packages/content` · `packages/runner`
· `packages/ui` · `packages/config`

## Onde está cada coisa

| O quê                 | Onde                                                                           |
| --------------------- | ------------------------------------------------------------------------------ |
| Contratos zod, enums  | `packages/shared/src/{enums,question,runner,api}.ts`                           |
| Motor de execução     | `packages/runner/src/` — `run.ts` é o pipeline, `client.ts` o lado main-thread |
| Bundle do worker      | gerado por `packages/runner/scripts/build-worker.mjs` em `src/generated/`      |
| Questões              | `packages/content/questions/<categoria>/<slug>/`                               |
| Validação de conteúdo | `packages/content/src/validate.ts`                                             |
| Schema do banco       | `packages/db/prisma/schema.prisma`                                             |
| Env da API            | `apps/api/src/config/env.ts` (zod, validado no boot)                           |
| Auth                  | `apps/api/src/auth/` — guard global, `@Public()` é a exceção                   |
| Shell do web          | `apps/web/src/app/(app)/layout.tsx`                                            |
| Cliente da API        | `apps/web/src/lib/api.ts` (browser) e `server-api.ts` (RSC)                    |
| Hooks de dados        | `apps/web/src/lib/queries.ts` (TanStack Query)                                 |
| Workspace             | `apps/web/src/components/workspace/` — `workspace.tsx` orquestra run/submit    |
| Estado do workspace   | `apps/web/src/lib/workspace-store.ts` (zustand, efêmero)                       |
| E2E de navegador      | `apps/web/e2e/` (`pnpm test:e2e`, exige os servidores no ar)                   |
| ADRs                  | `docs/adr/`                                                                    |

## Armadilhas já pagas

- **Prisma 7 precisa de driver adapter.** A URL não vai mais no `schema.prisma`. Construa o client
  sempre por `createPrismaClient` em `packages/db`.
- **`prisma generate` some depois de um `pnpm install`.** O gerador `prisma-client-js` escreve em
  `node_modules/@prisma/client`, que o pnpm re-linka sob outro hash quando peers mudam. Por isso o
  `postinstall` da raiz regenera.
- **`consistent-type-imports` está desligada em `apps/api`.** `import type` apaga a referência em
  runtime que o `emitDecoratorMetadata` do Nest usa para injeção — o autofix quebraria a DI.
- **Vitest precisa do transform SWC na API.** esbuild não emite metadata de decorator.
- **`@nestjs/cli` quebra no Node 22** (ciclo ESM numa dependência dele). Build é `tsc` direto.
- **Portas:** 3010 (web), 3334 (api), 5434 (postgres). As padrão estavam ocupadas nesta máquina.
- **O model do Monaco existe antes de o React ligar o listener de mudança.** Um `setValue`
  programático nessa janela atualiza o editor e mais nada — a tela fica certa e o run executa o
  starter. O helper `setEditorValue` nos testes reescreve até o rascunho persistido bater.
- **O documento não rola, por construção.** `html, body { height: 100%; overflow: hidden }` em
  `globals.css`. O shell é dono do scroll e cada painel rola sozinho. Telas fora do shell (login)
  precisam do próprio `overflow-y-auto`.
- **Todo container de scroll precisa de `relative`.** `overflow` sozinho **não** cria bloco de
  contenção, então qualquer descendente `absolute` — todo `sr-only`, por exemplo — se ancora no
  documento e o estica. A página inteira passa a rolar e o header e a sidebar somem junto.
- **`structuredClone` estoura em ~2000 de profundidade** — antes da recursão comum (~6000), ou seja,
  o harness era o limite mais apertado. `packages/runner/src/clone.ts` cai para um clone iterativo
  quando isso acontece, então listas e árvores degeneradas de 100k funcionam.
- **Não passe estrutura muito profunda para um matcher do Vitest.** Ele caminha o objeto para montar
  o diff e estoura. Asserte escalares.
- **Casos ocultos são ~800 kB** (dois inputs de 100k). Só são buscados no Submit e ficam em cache
  com `staleTime: Infinity`.
- **`API_INTERNAL_URL` ≠ `NEXT_PUBLIC_API_URL`.** O bundle do browser precisa do endereço visível do
  host; o servidor Next dentro do compose alcança a API pelo nome do serviço.
