# Auditoria da disciplina · 24/11/2026

Fonte de escopo: [página da disciplina](https://aulas.umlequedetecnologia.com.br/cursos/introducao-nextjs), [briefing e rubrica atuais](https://aulas.umlequedetecnologia.com.br/material/introducao-nextjs/projeto/brief.html), [manual da API](https://aulas.umlequedetecnologia.com.br/material/introducao-nextjs/projeto/api.html) e [OpenAPI](https://aulas.umlequedetecnologia.com.br/api/leque-de-vagas/openapi.json).

Foram lidos os desafios das aulas 01 a 11 e consultados os materiais de implementação vinculados, com atenção especial aos cards e desafios 09, 10 e 11. A aula 11 está marcada para **25/11**, mas seu material já é público. A aula 12 consta como reposição e fechamento, sem atividade publicada. Nenhum conteúdo privado foi necessário.

## Correspondência entre conteúdo e projeto

| Aula / checkpoint | Requisito atual | Onde conferir | Situação |
| --- | --- | --- | --- |
| 01 · Fundamentos | Next 16+, TypeScript, componente compartilhado, home e sobre | `app/layout.tsx`, `components/Cabecalho.tsx`, `app/sobre/page.tsx` | Implementado |
| 02 · Rotas | `[id]`, `[slug]`, `await params`, Link, menu ativo, layout aninhado e route group | `app/vagas/`, `app/empresas/`, `app/(institucional)/`, `components/MenuLink.tsx` | Implementado |
| 02 · Estados especiais | loading, erro com tentar novamente, not-found local e global | `app/vagas/loading.tsx`, `app/vagas/[id]/{loading,error,not-found}.tsx`, `app/error.tsx`, `app/not-found.tsx` | Implementado; novos prints pendentes |
| 03 · Estado e fronteira | Descrição expansível, copiar link, abas, campos e contagens derivados; páginas no servidor | `components/DescricaoDaVaga.tsx`, `BotaoCopiarLink.tsx`, `AbasDaEmpresa.tsx`, `MuralDeVagas.tsx` | Implementado; candidatura evoluiu para Server Action |
| 04 · Leitura externa | API centralizada, cache, SSG, metadata e dois Suspense | `lib/api.ts`, `app/vagas/page.tsx`, `generateStaticParams`/`generateMetadata` dos detalhes | Build real verificado |
| 05 · Escrita | Server Actions, FormData/getAll, Zod, Estado comum, useActionState e useFormStatus | `lib/esquemas.ts`, `lib/formulario.ts`, `components/BotaoDeEnviar.tsx`, ações dos formulários | Implementado |
| 06 · Persistência e handlers | Dados persistem no backend; endpoints GET do próprio projeto | `lib/api.ts`, `app/api/vagas/route.ts`, `app/api/empresas/[slug]/route.ts` | API substituiu banco local nas aulas 09/11 |
| 07 · Autorização | Sessão só com id, identidade atual, papéis, autoria, proteção da ação e cadastro candidata | `auth.ts`, `lib/sessao.ts`, `lib/permissoes.ts`, `proxy.ts`, `PERMISSOES.md` | Testes de sessão trocada e id adulterado |
| 08 · Design | Tailwind 4, tokens claro/escuro, componentes de UI, foco, abas, ARIA, responsividade | `app/globals.css`, `components/ui/`, `components/Filtros.tsx`, `FormularioDeCandidatura.tsx` | Código revisado; axe/390 px/prints pendentes |
| 09 · API no ar | Equipe única, login, GET/POST/PUT/PATCH, erros de campo e updateTag | `lib/configuracao.ts`, `lib/api.ts`, ações | GETs reais 200; escritas testadas com respostas simuladas |
| 10 · CRUD da vaga | Formulário compartilhado, `/vagas/[id]/editar`, PUT, DELETE 204, confirmação e autoria | `components/FormularioDeVaga.tsx`, `BotaoDeApagar.tsx`, `app/vagas/[id]/editar/` | Implementado nesta revisão |
| 10 · Frente 1 | Arquivadas no painel e desarquivamento pela autora | `app/painel/page.tsx`, `app/vagas/acoes.ts` | Implementado nesta revisão |
| 10 · Frente 2 | Editar/apagar no painel; perfil com espera, recusa e falha | `app/painel/page.tsx`, `app/empresas/[slug]/editar/` | Implementado; provas visuais pendentes |
| 10 · Frente 3 | Apagar própria conta, recusa de conta com vagas e logout | `app/painel/acoes.ts`, `lib/api.ts` | Implementado e testado sem alterar contas reais |
| 10 · Frente 4 | Desistir somente da própria candidatura | `podeDesistir`, `desistir`, `buscarCandidatura` sem cache | Implementado e testado |
| Checkpoint 1 | Busca e filtros de área, senioridade e iniciante compartilháveis pela URL | `lib/filtros.ts`, `components/MuralDeVagas.tsx`, `Filtros.tsx` | Implementado nesta revisão |
| 11 · Limpeza | Remover Prisma, incluir lint, build sem erro, ambiente fora do Git | `package.json`, `eslint.config.mjs`, `.gitignore`, `.env.example` | Código removido; lint/build aprovados |
| 11 · Documentação | Equipe, links, decisões, problemas e divisão das frentes | `README.md`, `DADOS.md`, `PERMISSOES.md` | Atualizado; equipe deve revisar para a defesa |
| Checkpoint 3 | Vercel Ready, CRUD no link e deploy contínuo | Projeto na conta Vercel e repositório | Domínio com `DEPLOYMENT_NOT_FOUND`; recuperação pendente de acesso |
| Defesa | Provas por frente, PRs revisados e apresentação de 15 min | Evidências da equipe | Não substituídas por esta revisão local |

## Correções aplicadas

1. Corrigido o parâmetro de cache ignorado e o erro de compilação das consultas pessoais.
2. Diferenciado catálogo indisponível de detalhe inexistente.
3. Adicionados PUT e DELETE de vaga, exclusão de conta e candidatura, leitura de candidatura e consulta de arquivadas.
4. Reutilizados formulário e esquema da vaga; protegidos empresa, autoria, data, id e situação na edição.
5. Adicionadas regras de edição/exclusão e desistência, com leituras atuais antes da autorização.
6. Adicionadas ações e controles do painel para todas as quatro frentes do desafio 10.
7. Preservados textos, checkbox e habilidades após recusa; espera visível e ARIA nos formulários.
8. Completados filtros e URL, busca sem acentos, limpeza e histórico de filtros.
9. Home passa a consultar `/numeros`; copiar link só confirma depois da cópia.
10. Separada credencial inválida de falha técnica no login.
11. Removidos schema, seed e migrations locais; incluído ESLint conforme a aula 11.
12. Aplicadas correções compatíveis de dependências, com Next 16.4.6 e auditoria npm sem vulnerabilidades.
13. Corrigida a documentação para `jv-e-abraao` e registrados os integrantes e o endereço informado.

## Diferenças entre etapas antigas e o escopo atual

O material evolui junto do semestre. A memória da aula 05 foi substituída pelo banco da aula 06, que foi substituído pela API da aula 09; a aula 11 remove os arquivos antigos. O botão Arquivar saiu do mural na aula 07 e fica no painel. A candidatura deixou de pedir nome/e-mail e usa a sessão. Anúncios antigos sobre React Hook Form, upload e UI otimista em aulas futuras não correspondem aos cards finais 10/11; não foram tratados como funcionalidades obrigatórias.

A busca usa `useSearchParams` e a History API integrada ao Next dentro do Suspense existente. Isso atende ao link compartilhável sem tornar a rota pública inteira dinâmica. A lista filtrável exige JavaScript; os formulários de candidatura continuam com Server Action. A validação permanece no servidor, como nos cards atuais.

## O que depende da equipe ou de acesso externo

- **Vercel:** recuperar `https://lequevagas.vercel.app/`, que devolveu `x-vercel-error: DEPLOYMENT_NOT_FOUND`. Esse erro não identifica sozinho se o projeto foi removido, o domínio perdeu a associação ou o endereço está em outra conta. É necessário inspecionar a conta/projeto.
- **Divisão em dupla:** João Victor Azevedo, frentes 1 e 2; Abraao Nerys, frentes 3 e 4. O briefing pede quatro e descreve exceção para três. A autorização dessa organização não pode ser presumida nem inventada na documentação.
- **Conteúdo da equipe:** verificar se o catálogo remoto deve manter o estado atual ou receber `dados/*.json`. Importar substitui vagas, então não foi feito automaticamente.
- **Evidências acadêmicas:** cada integrante precisa explicar as próprias decisões, produzir os PRs exigidos e realizar as provas no link publicado. Não foram criados commits ou evidências em nome de outra pessoa.

## Evidências ainda necessárias

Use recursos fictícios criados para o ensaio; a confirmação no site não é autorização para apagar dados preexistentes de outras pessoas.

| Frente | Provas a registrar no link publicado |
| --- | --- |
| 1 · João Victor | Publicar, editar, arquivar, desarquivar e apagar vaga própria; candidata recusada em publicação; Bruno recusado na edição; id de arquivamento adulterado recusado |
| 2 · João Victor | Alterar perfil da empresa vinculada e conferir o nome nos cards; recusa no perfil alheio; cancelar/aprovar exclusão de vaga de teste; três estados do formulário |
| 3 · Abraao | Cadastro sempre candidata mesmo com papel injetado; e-mail repetido; candidatura com identidade da sessão; exclusão de conta de teste; recusa da exclusão de conta com vagas |
| 4 · Abraao | Copiar link com todos os filtros e abrir em outra aba; busca por “junior”; arquivar atualiza números; desistência própria; sessão trocada entre abas recusa desistência |
| Ambas | Prints de loading/erro/404; teclado; axe claro/escuro; largura 390 px; build e lint; roteiro de 15 minutos |

Para os formulários, ensaiar separadamente atraso, recusa 409/422 e falha 503, retirando os parâmetros temporários antes de build/commit. Instruções em [PASSO_A_PASSO.md](PASSO_A_PASSO.md).

## Fontes das aulas

- [Aula 01 · desafio](https://cdn.aulas.umlequedetecnologia.com.br/public/introducao-nextjs/aula-01-abertura-fundamentos/desafio.html).
- [Aula 02 · desafio](https://cdn.aulas.umlequedetecnologia.com.br/public/introducao-nextjs/aula-02-roteamento-app-router/desafio.html).
- [Aula 03 · desafio](https://cdn.aulas.umlequedetecnologia.com.br/public/introducao-nextjs/aula-03-server-client/desafio.html).
- [Aula 04 · desafio](https://cdn.aulas.umlequedetecnologia.com.br/public/introducao-nextjs/aula-04-data-fetching/desafio.html).
- [Aula 05 · desafio](https://cdn.aulas.umlequedetecnologia.com.br/public/introducao-nextjs/aula-05-server-actions/desafio.html).
- [Aula 06 · desafio](https://cdn.aulas.umlequedetecnologia.com.br/public/introducao-nextjs/aula-06-backend-no-nextjs/desafio.html).
- [Aula 07 · desafio](https://aulas.umlequedetecnologia.com.br/material/introducao-nextjs/aula-07-autenticacao-e-autorizacao/desafio.html).
- [Aula 08 · card](https://aulas.umlequedetecnologia.com.br/material/introducao-nextjs/aula-08-tailwind-e-acessibilidade/ticket.html) e [desafio](https://aulas.umlequedetecnologia.com.br/material/introducao-nextjs/aula-08-tailwind-e-acessibilidade/desafio.html).
- [Aula 09 · card](https://aulas.umlequedetecnologia.com.br/material/introducao-nextjs/aula-09-o-backend-no-ar/ticket.html) e [desafio](https://aulas.umlequedetecnologia.com.br/material/introducao-nextjs/aula-09-o-backend-no-ar/desafio.html).
- [Aula 10 · card](https://aulas.umlequedetecnologia.com.br/material/introducao-nextjs/aula-10-editar-e-apagar/ticket.html) e [desafio das quatro frentes](https://aulas.umlequedetecnologia.com.br/material/introducao-nextjs/aula-10-editar-e-apagar/desafio.html).
- [Aula 11 · card](https://aulas.umlequedetecnologia.com.br/material/introducao-nextjs/aula-11-pronto-para-a-defesa/ticket.html) e [desafio da defesa](https://aulas.umlequedetecnologia.com.br/material/introducao-nextjs/aula-11-pronto-para-a-defesa/desafio.html).
