# Leque de Vagas · equipe jv-e-abraao

Mural de vagas de entrada em tecnologia. Empresas publicam oportunidades; candidatas filtram, se candidatam e acompanham suas candidaturas. Projeto da disciplina [Introdução ao Next.js · NickDev, 2026.2](https://aulas.umlequedetecnologia.com.br/cursos/introducao-nextjs), atualizado conforme os materiais publicados das aulas 01 a 11.

- **Endereço informado pela equipe:** [lequevagas.vercel.app](https://lequevagas.vercel.app/). Em 24/11/2026 respondeu `404 · DEPLOYMENT_NOT_FOUND`; a publicação precisa ser recuperada antes da entrega.
- **Dados compartilhados:** equipe `jv-e-abraao`, definida em `lib/configuracao.ts`. [Catálogo na API](https://aulas.umlequedetecnologia.com.br/api/leque-de-vagas/equipe/jv-e-abraao/vagas) · [Documentação interativa](https://aulas.umlequedetecnologia.com.br/api/leque-de-vagas/docs).
- **Requisitos e pendências:** [auditoria da disciplina](docs/AUDITORIA-DISCIPLINA.md) · [validação desta revisão](docs/VALIDACAO.md) · [execução e publicação](docs/PASSO_A_PASSO.md).

## A equipe

Divisão informada pelos integrantes nesta revisão:

| Pessoa | Frente | Responsabilidade |
| --- | --- | --- |
| João Victor Azevedo | 1 · Vagas | Contrato da vaga, card, detalhe, publicação, edição, exclusão e desarquivamento |
| João Victor Azevedo | 2 · Empresas | Lista e perfil da empresa, abas e painel da empresa |
| Abraao Nerys | 3 · Conta e candidatura | Login, cadastro, sessão, candidatura e exclusão da própria conta |
| Abraao Nerys | 4 · Busca e números | Mural, filtros na URL, contagens, arquivamento e desistência |

O briefing prevê quatro integrantes, um por frente, e descreve uma exceção para três. A divisão em dupla acima registra a situação real; a combinação dessa exceção com a disciplina ainda precisa ser confirmada pela equipe.

## Rodar na sua máquina

Node **22.18+**, recomendado Node **24** (`.nvmrc`), npm e acesso à internet.

```bash
npm ci
npm run configurar
npm run dev
```

Abra <http://localhost:3000>. `configurar` cria `.env.local` com um `AUTH_SECRET` aleatório e preserva o segredo existente. Não imprime o valor. O exemplo está em `.env.example`; na Vercel, configure um segredo próprio em **Settings → Environment Variables**.

| Conta de laboratório | Senha | Papel |
| --- | --- | --- |
| ana@exemplo.com | leque1234 | Empresa · Aurora Tech |
| bruno@exemplo.com | leque1234 | Empresa · Nuvem Rosa |
| carla@exemplo.com | leque1234 | Candidata |

O cadastro público cria candidatas. Use dados fictícios e senha exclusiva do exercício: a API didática permite acesso direto a quem conhece o endereço da equipe.

## O produto e as regras

- Mural só com vagas abertas, na ordem da API, da mais recente para a mais antiga.
- Busca por título ou empresa, sem distinguir acentos ou maiúsculas; filtros de área, senioridade e aceitação de iniciantes. A URL mantém todas as escolhas, inclusive após recarregar ou compartilhar.
- Conta de empresa publica somente pela empresa da sessão. Empresa e autoria não vêm do formulário.
- Só a autora edita, arquiva, desarquiva ou apaga a vaga. Edição mantém id, empresa, autora, data e situação. Exclusão também remove as candidaturas e pede confirmação.
- Arquivamento mantém histórico e detalhe acessível, tira a vaga do mural e permite desarquivar pelo painel.
- Só candidata envia candidatura; nome, e-mail e id vêm da conta. A API recusa duplicação e vaga arquivada.
- Só a dona da candidatura pode desistir. A exclusão da própria conta usa exclusivamente o id da sessão, remove as candidaturas e encerra a sessão. A API recusa contas que ainda tenham vagas.
- Perfil de empresa só pode ser editado por uma conta vinculada a ela. O slug permanece fixo.

As regras estão em [lib/permissoes.ts](lib/permissoes.ts), usadas pelas telas pessoais e conferidas novamente nas Server Actions. A tabela completa está em [PERMISSOES.md](PERMISSOES.md). O proxy antecipa o redirecionamento de visitantes nas páginas protegidas; a autorização é da ação.

## Decisões técnicas

Este é o registro técnico da implementação. Cada integrante deve revisar as escolhas com as próprias palavras para a defesa.

1. **API acessada pelo servidor e autorização nas ações.** A API do curso valida dados, mas não autentica quem pede. Um `fetch` direto do navegador permitiria contornar as permissões do site. Por isso componentes interativos recebem dados por props e submetem Server Actions, que consultam sessão e autoria atuais.
2. **Um formulário e um esquema para publicar e editar.** `components/FormularioDeVaga.tsx` recebe ação, valores iniciais e rótulos. O PUT envia os campos editáveis completos; o PATCH muda apenas `arquivada`. A empresa da edição vem da vaga original. Isso evita duplicar regras e impede alterar campos de identidade.
3. **Filtros na URL, dentro de Suspense.** `useSearchParams` é a fonte de verdade; a lista e as contagens são derivadas. A History API integrada ao Next permite compartilhar filtros sem nova consulta a cada letra. A digitação substitui a entrada atual; escolhas de filtro entram no histórico. O mural permanece pré-gerado, mas a lista filtrável depende da hidratação no navegador. Com o limite didático de 40 vagas, a filtragem local é suficiente; um catálogo maior pediria filtros e paginação no servidor.
4. **Cache público de 60 segundos e leituras pessoais sem cache compartilhado.** `updateTag` expira dados após a escrita confirmada. A autorização relê a vaga e a candidatura sem cache, evitando decidir com autoria ou situação antigas. Recusas não invalidam o cache; falhas de conexão e 5xx chegam ao `error.tsx`, com `retry`.
5. **Números calculados pela API.** A home e o bloco de números pedem `/numeros`, em vez de baixar todas as vagas só para contar. O painel mantém uma consulta de candidaturas por vaga; é simples para o tamanho limitado deste exercício.

O layout compartilhado reutiliza o cabeçalho em todas as páginas: componente é uma função que descreve uma parte da interface e pode ser usada sem copiar sua implementação. As pastas `[id]` e `[slug]` permitem que o mesmo arquivo atenda recursos diferentes; o servidor resolve `await params` e decide entre dado e `notFound()`.

O menu usa igualdade exata de URL: o link **Vagas** fica ativo em `/vagas`, e não no detalhe ou nos formulários, que são destinos diferentes. Não há leitura da sessão no layout público.

## O que quebrou no caminho

Problemas encontrados e corrigidos nesta revisão:

- O leitor HTTP aceitava dois argumentos, mas os painéis passavam três. O TypeScript falhava e a consulta de autorização ignorava o pedido de leitura fresca. O parâmetro de cache passou a funcionar, com testes de regressão.
- O 404 do catálogo virava lista vazia. Agora detalhe ausente vira ausência, e endpoint de catálogo ausente vira falha de configuração.
- A documentação dizia `lequedevagas-jv`, mas o código usava `jv-e-abraao`. O identificador do código foi preservado e a documentação foi corrigida.
- O checkbox podia perder o valor após uma recusa do formulário no React 19. A chave do formulário acompanha os valores devolvidos pela ação, preservando também as habilidades da candidatura.
- Qualquer erro do Auth.js era apresentado como senha incorreta. Somente `CredentialsSignin` recebe essa mensagem; indisponibilidade continua chegando à tela de erro.
- O botão de copiar confirmava antes de a cópia terminar. Agora espera a operação e apresenta uma orientação quando o navegador a recusa.
- O npm apontou vulnerabilidades em Next.js e dependências transitivas. O lockfile foi atualizado com correções compatíveis; a versão instalada é Next.js 16.4.6 e a auditoria terminou sem vulnerabilidades.
- O domínio informado responde `DEPLOYMENT_NOT_FOUND`. Esse problema é da associação/publicação na Vercel e não foi corrigido por mudanças locais de código.

## O design do projeto

Tailwind 4 configurado em `app/globals.css`, com tokens semânticos. `Botao`, `Campo` e `AreaDeTexto` concentram variantes, rótulos e associação dos erros. Tema pelo sistema, sem cookie; foco visível, abas com setas e estados em atributos ARIA.

| Token | Uso | Claro | Escuro |
| --- | --- | --- | --- |
| `fundo` | Fundo da página | `#ffffff` | `#09090b` |
| `superficie` | Campos e esqueletos | `#f4f4f5` | `#18181b` |
| `borda` | Separadores | `#e4e4e7` | `#27272a` |
| `borda-campo` | Limite dos controles | `#71717a` | `#71717a` |
| `principal` | Texto principal | `#18181b` | `#fafafa` |
| `suave` | Texto secundário | `#52525b` | `#a1a1aa` |
| `sucesso` | Sucesso e selo de iniciante | `#166534` | `#bbf7d0` |
| `sucesso-fundo` | Fundo de sucesso | `#dcfce7` | `#14532d` |
| `erro` | Erros e ações destrutivas | `#be123c` | `#fda4af` |
| `foco` | Anel de foco | `#6d28d9` | `#a78bfa` |

A revisão atual não produziu novos prints nem mediu o axe no navegador. As provas visuais por frente continuam na lista de evidências da [auditoria](docs/AUDITORIA-DISCIPLINA.md).

## Rotas

| Arquivo | URL | Renderização |
| --- | --- | --- |
| `app/page.tsx` | `/` | Estática, revalida em 60 s |
| `app/vagas/page.tsx` | `/vagas` | Estática, Suspense para números e mural |
| `app/vagas/[id]/page.tsx` | `/vagas/{id}` | SSG e revalidação |
| `app/vagas/nova/page.tsx` | `/vagas/nova` | Dinâmica, protegida |
| `app/vagas/[id]/editar/page.tsx` | `/vagas/{id}/editar` | Dinâmica, protegida e com autoria |
| `app/empresas/page.tsx` | `/empresas` | Estática, revalida em 60 s |
| `app/empresas/[slug]/page.tsx` | `/empresas/{slug}` | SSG e revalidação |
| `app/empresas/[slug]/editar/page.tsx` | `/empresas/{slug}/editar` | Dinâmica, protegida |
| `app/entrar/page.tsx` | `/entrar` | Estática |
| `app/cadastro/page.tsx` | `/cadastro` | Estática |
| `app/painel/page.tsx` | `/painel` | Dinâmica, protegida |
| `app/sobre/page.tsx` | `/sobre` | Estática |
| `app/(institucional)/termos/page.tsx` | `/termos` | Estática, sem prefixo do grupo |
| `app/(institucional)/privacidade/page.tsx` | `/privacidade` | Estática, sem prefixo do grupo |
| `app/api/vagas/route.ts` | `/api/vagas` | Route Handler GET |
| `app/api/empresas/[slug]/route.ts` | `/api/empresas/{slug}` | Route Handler GET |
| `app/api/auth/[...nextauth]/route.ts` | `/api/auth/*` | Auth.js |

Resumo do build verificado em 24/11/2026: `○` nas páginas públicas, `●` nos detalhes de vagas e empresas, `ƒ` no painel e nos formulários pessoais, além dos Route Handlers e proxy. A [validação](docs/VALIDACAO.md) registra a saída.

## Verificar e apresentar

```bash
npm run typecheck
npm run lint
npm test
npm run verificar:api
npm run build
npm start
```

Os testes usam respostas HTTP simuladas e não gravam na API. O comando `verificar:api` faz apenas GETs. O build depende da API real para pré-gerar os detalhes. Os mocks de módulos dos testes usam a opção experimental do Node; ela não participa da aplicação.

A defesa deve acontecer no link publicado. O [passo a passo](docs/PASSO_A_PASSO.md) inclui a matriz de papéis, os três estados dos formulários e a recuperação do domínio da Vercel.

## O que ficou de fora

- Recuperar/publicar o deployment na conta da Vercel e repetir as provas no domínio publicado.
- Prints e gravações dos estados especiais, teclado, 390 px e axe nos dois temas.
- PRs por frente, review cruzado, histórico de contribuições e ensaio individual: são evidências da equipe, não substituídas por esta atualização local.
- A importação dos JSON não foi executada, pois substitui vagas compartilhadas. `npm run dados:importar` mostra o destino; o comando com `--confirmar-substituicao` só deve ser usado quando a equipe quiser essa substituição.
- Favoritos, paginação, upload, mensagens e processo seletivo não fazem parte do escopo obrigatório atual. Anúncios antigos sobre aulas futuras foram substituídos pelos cards e pelo briefing atualizados.

O Prisma e seus arquivos foram removidos conforme a aula 11. A [referência histórica das aulas 01 a 08](docs/REFERENCIA-AULAS-01-08.md) permanece só para estudo; os dados atuais vêm exclusivamente da API.

Material didático: NickDev / Um Leque de Tecnologia. As fontes específicas e a correspondência entre requisito e código estão na [auditoria da disciplina](docs/AUDITORIA-DISCIPLINA.md).
