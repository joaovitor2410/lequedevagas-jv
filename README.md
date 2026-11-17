# Leque de Vagas · Front Avançado

Mural de vagas de tecnologia baseado nas aulas 01 a 09 de **Introdução ao Next.js (NickDev)**. A interface usa Next.js 16, React 19, TypeScript e Tailwind 4; o Auth.js guarda a sessão, e a API do curso cuida das contas e da persistência.

**Equipe na API:** `lequedevagas-jv` · [Documentação interativa](https://aulas.umlequedetecnologia.com.br/api/leque-de-vagas/docs).

## Executar

Node **22.18+**, recomendado Node 24 (`.nvmrc`), e acesso à internet.

```bash
cd lequedevagas-jv
npm ci
npm run configurar
npm run dev
```

Abra <http://localhost:3000>. O comando `configurar` cria `.env.local` com um `AUTH_SECRET` aleatório e preserva um segredo já configurado. Não é necessário instalar um banco, criar `DATABASE_URL` ou rodar migrations/seed.

| Conta de laboratório | Senha | Papel |
| --- | --- | --- |
| ana@exemplo.com | leque1234 | Publica pela Aurora Tech |
| bruno@exemplo.com | leque1234 | Publica pela Nuvem Rosa |
| carla@exemplo.com | leque1234 | Candidata |

O cadastro público cria candidatas. A empresa e a autoria das operações vêm da sessão. Use somente dados fictícios e uma senha exclusiva deste exercício: a API didática permite operações diretas a quem conhece o endereço da equipe.

## O que está implementado

- Catálogo, busca, filtros de área e detalhe das vagas.
- Empresas, abas acessíveis e edição do perfil pela conta vinculada.
- Login, logout, cadastro e painel por papel.
- Publicação e arquivamento com autoria conferida na Server Action.
- Candidatura, recusa de duplicação e histórico no painel.
- Contagem fornecida pela API; atualização de vagas, empresas e candidaturas por `updateTag`.
- Tratamento de 404, mensagens de validação da API, carregamento e recuperação de falhas.
- Tema pelo sistema, campos com rótulos e erros associados, navegação por teclado.

Editar e excluir vagas fazem parte da aula 10, que não consta entre as fontes deste notebook. O arquivamento da aula 09 mantém o histórico e impede novas candidaturas.

## Configuração e dados

`lib/configuracao.ts` contém o endereço HTTPS e o nome público da equipe. Todas as pessoas precisam usar o mesmo nome para compartilhar dados. `lib/api.ts` concentra as chamadas HTTP. A aplicação não consulta mais SQLite, Prisma nem os JSON do GitHub.

As leituras públicas usam cache de 60 segundos. As consultas da identidade e dos painéis não usam cache compartilhado. As Server Actions invalidam as etiquetas depois de uma gravação bem-sucedida. Atualizações feitas por outro computador aparecem após a revalidação do cache.

Os JSON em `dados/` continuam como material da equipe para importação. Para visualizar o destino e as instruções sem alterar a API:

```bash
npm run dados:importar
```

A execução com `--confirmar-substituicao` substitui as vagas da equipe. Leia o [passo a passo](docs/PASSO_A_PASSO.md) antes de usar.

`prisma/` é apenas o histórico das aulas 06/07, preservado para estudo. Não faz parte da instalação ou execução atual; seus antigos comandos de seed e migration não são usados. A referência original está em [Aulas 01 a 08](docs/REFERENCIA-AULAS-01-08.md).

## Verificar

```bash
npm run typecheck
npm test
npm run verificar:api
npm run build
npm start
```

O [registro de validação](docs/VALIDACAO.md) detalha o que foi conferido e os limites. Os testes locais verificam a integração HTTP, tratamento de respostas e permissões sem gravar no backend. `verificar:api` consulta somente vagas, empresas e números da equipe. O build depende da API estar acessível, porque pré-gera o catálogo e as páginas de detalhe.

## Publicar e apresentar

O guia [PASSO_A_PASSO.md](docs/PASSO_A_PASSO.md) descreve como abrir o projeto correto no VS Code, executá-lo, testar cada papel, importar dados quando necessário, subir as alterações e configurar a Vercel. A publicação requer seu projeto/conta na Vercel e um `AUTH_SECRET` próprio do ambiente publicado.

Fontes principais: [notebook fornecido](https://notebook.google.com/notebook/ae36a796-471d-4146-bccd-ef5201e6167f), [slides da aula 09](https://aulas.umlequedetecnologia.com.br/material/introducao-nextjs/aula-09-o-backend-no-ar/slides.html?inteira=1), [card da aula](https://aulas.umlequedetecnologia.com.br/material/introducao-nextjs/aula-09-o-backend-no-ar/ticket.html) e [desafio das quatro frentes](https://aulas.umlequedetecnologia.com.br/material/introducao-nextjs/aula-09-o-backend-no-ar/desafio.html).

Material didático do NickDev / Um Leque de Tecnologia, adaptado para o repositório `joaovitor2410/lequedevagas-jv`.
