# Validação da revisão · 24/11/2026

Escopo: requisitos atuais das aulas 01 a 11, cards, desafios e briefing da disciplina. Equipe preservada: **jv-e-abraao**. João Victor Azevedo: frentes 1 e 2; Abraao Nerys: frentes 3 e 4.

Ambiente da verificação: Node 24.22.0, npm 11.19.1, Next.js **16.4.6**, React 19.2.7 e Auth.js 5.0.0-beta.32. Next 16.3.4 foi atualizado por correções de segurança compatíveis; o lockfile registra as versões usadas.

## Comandos executados

| Verificação | Resultado |
| --- | --- |
| `npm run typecheck` | Aprovado |
| `npm run lint` | Aprovado; zero erros e zero avisos |
| `npm test` | **36 testes aprovados**, zero falhas |
| `npm run verificar:api` | GETs reais de vagas, empresas e números: **200** |
| `npm run build` | Aprovado; **31 páginas geradas**, sem warnings de build |
| `npm audit --json` | **0 vulnerabilidades** |
| `git diff --check` | Aprovado |
| Ambiente no Git | Apenas `.env.example`; segredo local não encontrado nos arquivos versionados |
| Histórico de `.env` e `.env.local` | Nenhum commit retornado pela consulta desses dois caminhos |
| Banco antigo | Sem dependências, schema, seed, migrations ou pasta Prisma |
| JSON local | 12 vagas, 5 empresas, 6 áreas, 3 senioridades; slugs compatíveis; descrições de pelo menos 300 caracteres |

Os testes de ações usam mocks de módulos do Node. No Node 24 utilizado, o runner informa que o recurso é experimental e que `namedExports` está depreciado; isso se limita ao teste e não aparece no lint, no build ou na aplicação. A configuração foi mantida compatível com o mínimo Node 22.18 indicado no projeto.

## O que os testes exercitam

- Cache público e leituras pessoais/autorização com `no-store`.
- 404 de detalhe, catálogo indisponível, 401, 409, 422, 503 e falha de conexão.
- PUT completo, PATCH só de situação, DELETE com resposta 204 sem corpo e ids codificados.
- Autoria em editar, apagar, arquivar e desarquivar, incluindo visitante, candidata e outra empresa.
- Injeção de empresa, autora, id, data e situação na edição: campos protegidos não são enviados no PUT.
- Publicação e candidatura com identidade da sessão, ignorando valores adulterados no formulário.
- Desistência da própria candidatura e recusa quando a sessão muda para outra pessoa.
- Exclusão da conta exclusivamente pelo id da sessão; 409 mantém sessão; sucesso invalida candidaturas e encerra a sessão.
- Recusas preservam campos e checkbox; nenhuma invalidação de cache antes de sucesso.
- Esquemas com limites do backend e cadastro sem papel controlado pelo formulário.
- Busca por título/empresa sem acento ou maiúscula; filtros combinados de área, senioridade e iniciante, incluindo `false`.
- Login distingue credenciais inválidas de falha técnica, preserva redirect e não devolve senha.

Todas as escritas desses testes usam respostas simuladas. Nenhuma vaga, empresa, conta ou candidatura compartilhada foi criada, editada, arquivada ou apagada nesta revisão.

## Verificação HTTP da aplicação de produção

Foi iniciado `npm start` em porta local isolada. A verificação usou HTTP e sessões locais independentes, com as três contas didáticas. As credenciais públicas do laboratório foram usadas somente no login; cookies não foram impressos nem persistidos em arquivo.

| Fluxo | Resultado observado na resposta HTTP |
| --- | --- |
| Home, vagas, empresas, sobre, entrar e cadastro | 200 e título principal esperado |
| Visitante em painel, publicar, editar vaga e editar empresa | Redirecionado para `/entrar` |
| `GET /api/vagas` | Lista JSON válida |
| `GET /api/empresas/nao-existe` | 404 |
| Login Ana | Painel com seção de arquivadas e exclusão da própria conta |
| Ana em `/vagas/1/editar` | Campos preenchidos, salvar e apagar disponíveis |
| Bruno em `/vagas/1/editar` | Mensagem de recusa de autoria |
| Bruno no perfil da Aurora Tech | Mensagem de recusa |
| Login Carla | Painel de candidaturas próprias |
| Carla em `/vagas/nova` | Publicação recusada |

Essas verificações confirmam respostas de servidor e o fluxo de sessão. Não substituem execução de JavaScript, interação com o diálogo de confirmação, medição de acessibilidade ou inspeção visual em navegador.

## Saída do build

Saída observada, com as listas de ids de detalhe resumidas:

```text
▲ Next.js 16.4.6 (Turbopack)
- Environments: .env.local
✓ Compiled successfully
✓ Generating static pages (31/31)

Route (app)                     Revalidate  Expire
○ /                             1m          1y
○ /_not-found
ƒ /api/auth/[...nextauth]
ƒ /api/empresas/[slug]
ƒ /api/vagas
○ /cadastro
○ /empresas                      1m          1y
● /empresas/{slug}               1m          1y
ƒ /empresas/[slug]/editar
○ /entrar
ƒ /painel
○ /privacidade
○ /sobre
○ /termos
○ /vagas                         1m          1y
● /vagas/{id}                    1m          1y
ƒ /vagas/[id]/editar
ƒ /vagas/nova
ƒ Proxy (Middleware)
```

As quatro páginas pessoais são dinâmicas. Mural, início e detalhes públicos mantiveram pré-geração. O grupo `(institucional)` não aparece nas URLs. O catálogo filtrável usa `useSearchParams` dentro de Suspense.

## Limites e pendências reais

- O navegador automatizado não ficou disponível nesta sessão. Não foram produzidos novos prints, medições axe, provas de teclado ou validação visual a 390 px.
- Os fluxos de escrita foram testados com respostas simuladas, sem alterar os dados da API. Cadastro real, exclusões reais e os três estados visuais dos formulários precisam da prova da equipe com dados descartáveis.
- O domínio `https://lequevagas.vercel.app/` respondeu **404**, cabeçalho `x-vercel-error: DEPLOYMENT_NOT_FOUND`. O usuário confirmou que esse endereço precisa ser recuperado.
- A integração Vercel foi localizada e oferecida, mas ainda não estava conectada. Não houve publicação, alteração de domínio ou configuração de conta.
- A atualização consolidada é registrada no histórico da `main` do [repositório da equipe](https://github.com/joaovitor2410/lequedevagas-jv). O envio ao GitHub não comprova publicação na Vercel. PRs, contribuições e reviews por frente continuam sendo evidências acadêmicas da participação real da dupla.
- A importação dos JSON não foi executada, pois substitui as vagas da equipe. O diagnóstico informativo não grava dados.
- A divisão em dupla foi documentada como informada; a exceção em relação ao briefing ainda precisa de confirmação com a disciplina.

O [passo a passo](PASSO_A_PASSO.md) orienta execução, provas e recuperação da Vercel. A [auditoria por aula](AUDITORIA-DISCIPLINA.md) relaciona requisitos, implementação, fontes e evidências ainda necessárias. O registro anterior de 17/11 descrevia outra equipe de API e não foi usado como prova de funcionamento desta revisão.
