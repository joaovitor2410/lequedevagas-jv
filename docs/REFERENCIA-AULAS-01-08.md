> Referência histórica das aulas 01 a 08. A instalação e os caminhos abaixo descrevem aquela etapa, não a aplicação atual. O Prisma foi removido conforme a aula 11. Para executar, use o [README atual](../README.md).

# Leque de Vagas

Projeto de referência do curso **Introdução ao Next.js** (NickDev). Um mural de
vagas de tecnologia para quem está migrando de carreira.

Este repositório está **no estado esperado depois dos desafios das aulas 01 a
08**. Ele existe para você comparar com o seu: abrir um arquivo, ver como ficou
aqui e entender por quê. Não é para clonar e entregar — o que vale nota é o
seu, com os seus dados e as suas decisões.

## Rodar

Precisa de Node 20 ou mais novo (conferido com o 24).

```bash
npm ci                     # instala, e o postinstall roda o prisma generate
cp .env.example .env       # deixe só a linha do DATABASE_URL
npx prisma migrate dev     # monta o prisma/dev.db a partir das migrations
npx prisma db seed         # 3 pessoas de laboratório, senha "leque1234"
```

Crie o `.env.local` com um `AUTH_SECRET` novo — ele é o que cifra o cookie de
login, e quem o tem fabrica o login de qualquer pessoa:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# .env.local
AUTH_SECRET="o texto que o comando acima imprimiu"
AUTH_TRUST_HOST=true       # só para o npm start na sua máquina
```

```bash
npm run dev
```

Abre em <http://localhost:3000>. Entre como `ana@exemplo.com` (publica pela
Aurora Tech), `bruno@exemplo.com` (Nuvem Rosa) ou `carla@exemplo.com`
(candidata) — veja a tabela em [`PERMISSOES.md`](PERMISSOES.md).

O `dev.db`, o `.env` e o `.env.local` **não vão para o Git**. O `npm run build`
e o `npm run dev` também **buscam dados pela rede**, do próprio repositório no
GitHub (veja `lib/api.ts`): sem internet, o build não passa.

**No Windows, pare o `npm run dev` antes de qualquer comando do Prisma.** Com o
servidor aberto, o `prisma generate` falha com `EPERM: operation not permitted,
rename … query_engine-windows.dll.node`: a migration é aplicada e o cliente,
não. Pare o dev, rode `npx prisma generate` e suba de novo.

## Onde os dados vivem

Em dois lugares, e só o `lib/api.ts` sabe disso — as regras estão no
[`DADOS.md`](DADOS.md):

- **O que o time publica** mora em `dados/vagas.json` e `dados/empresas.json`,
  buscados do GitHub. Uma vaga nova ali aparece no site **no pior caso pouco
  mais de um minuto depois do push** (`revalidate: 60`); uma empresa, em até
  uma hora (`revalidate: 3600`).
- **O que se escreve pelo site** — vagas publicadas, perfis editados,
  candidaturas e contas — mora num banco SQLite, o `prisma/dev.db`. Ele
  **sobrevive ao restart** do servidor (na aula 05 era um array em memória, e
  sumia). Mas ele existe **só na sua máquina**: o site publicado na Vercel não
  tem esse arquivo. Colocar o backend no ar é a aula 09.

## O que tem aqui, aula por aula

**Aula 01 — fundamentos.** O componente como peça reutilizável, JSX, rota por
pasta. `app/layout.tsx`, `components/Cabecalho.tsx`, `app/page.tsx`,
`app/sobre/page.tsx`.

**Aula 02 — roteamento com App Router.** Rota dinâmica com `[id]` e `params`
que chega como Promise. `layout` aninhado em `app/vagas/`, `loading`, `error` e
`not-found` — e o `not-found` da raiz, que é outro. Route group
`(institucional)`. Navegação com `Link`, e `usePathname` no `MenuLink`.

**Aula 03 — a página que responde.** A fronteira entre servidor e navegador, e
`useState`. As páginas continuam de servidor; só os pedaços com memória levam
`"use client"`: `DescricaoDaVaga`, `BotaoCopiarLink`, `AbasDaEmpresa`,
`MuralDeVagas` (o estado no pai comum) e `Filtros` (nenhum estado: recebe e
avisa).

**Aula 04 — o dado sai de dentro do projeto.** `dados/*.json` buscados por
rede, `lib/api.ts` como o único arquivo com `fetch`, `revalidate` e `tags`,
`generateStaticParams`, `generateMetadata`, `<Suspense>` em volta de quem busca
e esqueletos do tamanho do conteúdo real.

**Aula 05 — cada frente ganha um verbo (Server Actions).**

| Onde | O que ensina |
| --- | --- |
| `app/**/acoes.ts` | `"use server"` na primeira linha; `safeParse` antes de tudo; revalidar antes de sair; `redirect` fora de `try` |
| `lib/esquemas.ts` | os esquemas do Zod juntos, com mensagens em português — e o checkbox com `.optional().transform()` |
| `lib/formulario.ts` | `porCampo` (um erro por campo) e `valoresDe` (o formulário volta preenchido) |
| `lib/tipos.ts` | o tipo `Estado`, que toda ação devolve, e o `ESTADO_INICIAL` |
| `components/BotaoDeEnviar.tsx` | `useFormStatus` — num componente **filho** do `<form>`, senão mente |
| `app/vagas/nova/` | a vaga nasce de uma tela, com o id gerado no servidor |
| `app/empresas/[slug]/editar/` | `useActionState`, estado de sucesso sem redirect, e o slug preso com `.bind` |
| `components/FormularioDeCandidatura.tsx` | de `onSubmit` para `action` — funciona sem JavaScript; a lista com `getAll` |

**Aula 06 — o dado para de sumir (banco).**

| Onde | O que ensina |
| --- | --- |
| `prisma/schema.prisma` | Vaga, Empresa e Candidatura — a primeira relação do projeto |
| `prisma/migrations/` | o histórico versionado, uma migration por aula |
| `lib/prisma.ts` | o cliente único, que sobrevive ao hot reload |
| `lib/api.ts` | o array virou banco **e nenhuma página mudou**; `count()` em vez de `.length`; arquivar é `update` |
| `app/api/vagas/route.ts`, `app/api/empresas/[slug]/route.ts` | Route Handlers: um endereço para quem **não** é a sua tela |

**Aula 07 — cada coisa tem dono (autenticação e autorização).**

| Onde | O que ensina |
| --- | --- |
| `auth.ts`, `app/api/auth/[...nextauth]/` | Auth.js 5 com Credentials e bcrypt; o crachá guarda só o id |
| `proxy.ts` | o atalho: quem nem entrou volta para `/entrar` — não é a tranca |
| `lib/sessao.ts` | `usuarioAtual()`: o cookie diz o id, o banco diz o resto, com `cache` do React |
| `lib/permissoes.ts` | as regras, puras, chamadas pela tela **e** pela ação ([`PERMISSOES.md`](PERMISSOES.md)) |
| `app/entrar/`, `app/cadastro/` | o login com uma frase só para e-mail e senha errados; o cadastro com papel fixo |
| `app/painel/` | a única página que lê a sessão para desenhar: suas vagas (com o Arquivar) ou suas candidaturas |

**Aula 08 — cada frente zera a sua tela (Tailwind e acessibilidade).**

| Onde | O que ensina |
| --- | --- |
| `app/globals.css` | Tailwind 4 configurado no CSS: `@import`, `@theme` com os tokens e `@layer base`. Sem `tailwind.config.js` |
| `components/ui/Botao.tsx` | o design system: quem usa escolhe a **variante**, não as classes |
| `components/ui/Campo.tsx`, `AreaDeTexto.tsx` | rótulo, entrada e erro ligados por `useId`, `aria-invalid` e `aria-describedby` |
| `components/MenuLink.tsx` | o estilo lê o atributo: `aria-[current=page]:` no lugar do ternário de classe |
| `components/Filtros.tsx` | chips com `aria-pressed` e `aria-pressed:` |
| `components/AbasDaEmpresa.tsx` | abas no padrão do WAI-ARIA, com setas, foco e `aria-selected:` |
| `components/DescricaoDaVaga.tsx` | `aria-expanded` e `aria-controls`; a seta gira por `group-aria-expanded:` |
| `components/FormularioDeCandidatura.tsx` | `fieldset` e `legend`, e o erro ligado ao **grupo** |
| `components/MuralDeVagas.tsx` | o número com `aria-live="polite"`, e duas colunas a partir de `sm:` |
| `**/loading.tsx`, `*Esqueleto.tsx` | `motion-safe:animate-pulse`: só pisca para quem não pediu menos movimento |

## O que o build mostra

```
┌ ○ /                                1m      1y
├ ○ /_not-found
├ ƒ /api/auth/[...nextauth]
├ ƒ /api/empresas/[slug]
├ ƒ /api/vagas
├ ○ /cadastro
├ ○ /empresas                        1m      1y
├   /empresas/[slug]                 ● cinco empresas
├ ƒ /empresas/[slug]/editar
├ ○ /entrar
├ ƒ /painel
├ ○ /privacidade
├ ○ /sobre
├ ○ /termos
├ ○ /vagas                           1m      1y
├   /vagas/[id]                      ● uma por vaga
└ ƒ /vagas/nova
ƒ Proxy (Middleware)
```

**Só três páginas são `ƒ`, e as três já eram de uma pessoa só:** o painel, o
publicar e o editar da empresa. Mural, vaga e empresa são iguais para todo
mundo e continuam pré-gerados. Se a sua tabela tiver mais `ƒ`, alguém está
lendo a sessão ou um cookie onde não precisava — no layout, por exemplo.

## O design do projeto

As cores moram em `app/globals.css`, no `@theme`, com nome de função. Nenhum
componente escreve cor à mão — nem hexadecimal, nem `zinc-400`: se faltar uma,
ela vira token aqui, com os dois valores e o contraste conferido.

| token          | para que serve                         | claro     | escuro    |
| -------------- | -------------------------------------- | --------- | --------- |
| `fundo`        | o fundo da página                      | `#ffffff` | `#09090b` |
| `superficie`   | cartão, campo, esqueleto               | `#f4f4f5` | `#18181b` |
| `borda`        | a borda que só separa                  | `#e4e4e7` | `#27272a` |
| `borda-campo`  | a borda que precisa ser vista (3 : 1)  | `#71717a` | `#71717a` |
| `principal`    | o texto                                | `#18181b` | `#fafafa` |
| `suave`        | o texto secundário                     | `#52525b` | `#a1a1aa` |
| `sucesso`      | o "aceita iniciante", o "salvo"        | `#166534` | `#bbf7d0` |
| `sucesso-fundo`| o fundo do selo de sucesso             | `#dcfce7` | `#14532d` |
| `erro`         | erro de campo, botão de perigo         | `#be123c` | `#fda4af` |
| `foco`         | o anel de foco                         | `#6d28d9` | `#a78bfa` |

**Quem escolhe o tema é o sistema da pessoa** (`prefers-color-scheme`), sem
JavaScript e sem cookie — um tema guardado em cookie faria o layout ler
`cookies()`, e o site inteiro viraria `ƒ`.

**Por que `borda` e `borda-campo` são dois tokens.** A borda que só separa (o
cartão, a aba fechada) pode ser fraca. A do campo é o que diz "aqui se digita",
e a WCAG pede 3 : 1 para ela (critério 1.4.11).

Conferido com o axe (`wcag2a`, `wcag2aa`, `wcag21aa`, `best-practice`): zero
problemas nos dois temas, a 1280 e a 390 px, em `/`, `/vagas`, `/vagas/[id]`,
`/empresas`, `/empresas/[slug]`, `/entrar`, `/cadastro`, `/sobre`, `/termos`,
no 404, e logado em `/painel`, `/vagas/nova` e `/empresas/[slug]/editar`.
Nenhuma página rola para o lado a 390 px.

## O que NÃO tem, de propósito

Se você achar que está faltando, provavelmente está — mas numa aula seguinte.

- **O backend no ar.** O banco é um arquivo na sua máquina; o site publicado
  não o enxerga. Aula 09.
- **Editar e apagar vaga**, com carregamento e erro em todo formulário. Aula 10.
- **Validação no cliente.** Hoje quem valida é só o servidor — e ele é quem
  vale. React Hook Form em cima dos mesmos esquemas vem depois.
- **Botão de tema.** Ficou nos extras da aula 08, pelo motivo do cookie acima.

## Detalhes que costumam pegar

**Instale com a versão escrita.** `npm i prisma` hoje traz uma versão
candidata de outra geração; `npm i next-auth` traz o 4, com outra API. Aqui:
`prisma@6.19.3`, `@prisma/client@6.19.3`, `next-auth@5.0.0-beta.32`,
`bcryptjs@3.0.3`, `zod@4.6.7`, `tailwindcss@4.3.3` — todas com `-E`.

**`"use server"` é a primeira linha do arquivo.** Depois de um `import` ela não
vale, e o erro fala de "Functions cannot be passed directly to Client
Components", sem mencionar a diretiva.

**A ação do `useActionState` recebe dois parâmetros**: `(estadoAnterior,
dados)`. Com um só, ela recebe o estado no lugar do `FormData`, e todo campo
vira `undefined` sem erro nenhum.

**O `redirect` lança.** Por isso ele vai fora de `try`, e por isso o `catch` da
ação `entrar` termina em `throw erro`: o login que deu certo sai por ali.

**Gravar no banco não avisa o cache.** Toda ação que escreve chama
`revalidatePath` para **cada** rota que mostra aquele dado. `revalidateTag("vagas")`
não resolveria: ele busca o JSON de novo, e o que mudou foi o banco.

**A tela não é a tranca.** A página `/vagas/nova` confere o papel quando é
desenhada; a ação roda depois, com o cookie que chegar. A regra está nos dois
lugares, escrita uma vez só em `lib/permissoes.ts`.

**As vagas do `dados/vagas.json` não recebem candidatura pelo site.** A
candidatura é uma relação com a tabela `Vaga`, e essas vagas não estão nela. A
página delas avisa, e a ação recusa com mensagem. Mais em [`DADOS.md`](DADOS.md).

**Vaga arquivada ou que não existe responde 200, não 404.** A tela é a do
`not-found.tsx`, com `<meta name="robots" content="noindex">`. É porque
`/vagas/[id]` tem `loading.tsx`: a resposta começa a ser transmitida antes de o
`notFound()` rodar, e o status já foi enviado. Está na documentação do Next 16
(`loading.md`, "Status codes").

**`error.tsx` recebe `retry`, não `reset`.** O nome mudou no Next 16. Conferido
em `node_modules/next/dist/docs`, a documentação da versão instalada.

**`notFound()` e `error.tsx` não são a mesma coisa.** `notFound()` é para o que
**não existe**; o `error.tsx` é para o que **falhou**, e tentar de novo pode
funcionar.

**`id` é texto.** O que vem da URL é sempre texto: `"id": "1"`, e não `1`.

**Os dois JSON combinam na mão.** Todo `empresaSlug` de `dados/vagas.json` tem
que existir como `slug` em `dados/empresas.json`, escrito igual.

**`<Botao className="px-6">` não muda o padding.** Ficam `px-4` e `px-6`, e
ganha a ordem das regras no CSS, não a da string. `className` no `Botao` é só
para margem e posição; mudar a cara é variante nova.

## Estrutura

```
app/
├── layout.tsx                     moldura: cabeçalho e rodapé — não lê sessão
├── page.tsx                       /
├── not-found.tsx                  404 do site inteiro
├── globals.css                    @import, @theme (tokens) e @layer base
├── sobre/page.tsx
├── (institucional)/               route group: /termos e /privacidade
├── entrar/                        página, formulário e ação de login
├── cadastro/                      página, formulário e ação de criar conta
├── painel/                        ƒ — a área de quem entrou, e o sair
├── api/
│   ├── auth/[...nextauth]/        o Auth.js
│   ├── vagas/                     GET /api/vagas
│   └── empresas/[slug]/           GET /api/empresas/aurora-tech
├── vagas/
│   ├── layout.tsx · loading.tsx
│   ├── page.tsx                   /vagas — dois <Suspense>
│   ├── acoes.ts                   arquivar
│   ├── nova/                      ƒ — publicar (página, formulário, ação)
│   └── [id]/                      a vaga, e a ação da candidatura
└── empresas/
    ├── page.tsx                   /empresas
    └── [slug]/
        ├── page.tsx               /empresas/aurora-tech
        └── editar/                ƒ — editar o perfil
components/
├── ui/                            o design system: Botao, Campo, AreaDeTexto
└── ...                            as peças; só as com memória são de cliente
dados/                             vagas.json e empresas.json — o que o time publica
lib/
├── tipos.ts                       os tipos, o Estado e o ESTADO_INICIAL
├── api.ts                         a única porta para o JSON e para o banco
├── prisma.ts                      o cliente único
├── esquemas.ts                    os esquemas do Zod
├── formulario.ts                  porCampo e valoresDe
├── sessao.ts                      usuarioAtual()
└── permissoes.ts                  quem pode o quê
prisma/
├── schema.prisma                  o banco inteiro
├── migrations/                    uma por aula — vai para o Git
└── seed.mjs                       as pessoas de laboratório
auth.ts                            o Auth.js
proxy.ts                           o atalho para /entrar
DADOS.md · PERMISSOES.md           as decisões de equipe, por escrito
```

## Licença

Material didático do NickDev. Use para estudar, cite quando reaproveitar.
