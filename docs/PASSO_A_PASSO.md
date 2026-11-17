# Passo a passo · Leque de Vagas

## 1. Abrir a pasta correta

A pasta encontrada neste computador é `/Users/jayv/Desktop/Front_Avancado/lequedevagas-jv`. As abas antigas do IDE apontavam para `meu-projeto-next`, que não está neste workspace.

1. No VS Code, escolha **Arquivo → Abrir Pasta**.
2. Selecione `Front_Avancado/lequedevagas-jv`.
3. Abra **Terminal → Novo Terminal**. O `package.json` precisa estar na pasta atual.
4. Confira:

```bash
pwd
node -v
npm -v
```

Recomendado: Node 24. Se já usa nvm, execute `nvm install` e `nvm use` na pasta do projeto. O mínimo configurado é 22.18, pois os scripts usam o suporte nativo do Node a arquivos TypeScript.

## 2. Instalar e configurar

Neste computador as dependências e o ambiente local já foram preparados durante a atualização. Em outro clone, ou para repetir a instalação:

```bash
npm ci
npm run configurar
```

O segundo comando gera `.env.local` com `AUTH_SECRET` e `AUTH_TRUST_HOST=true` para o localhost. Ele não imprime o segredo nem substitui um segredo existente. O arquivo está ignorado pelo Git.

Não é necessário criar `.env`, configurar `DATABASE_URL`, instalar Prisma ou executar migrations/seed. As contas de laboratório já pertencem à API do curso.

## 3. Iniciar o site

```bash
npm run dev
```

Mantenha esse terminal aberto e visite **http://localhost:3000**. Se o terminal informar outra porta porque a 3000 está ocupada, use a URL que ele mostrar. Para encerrar, pressione **Control+C**.

Todos os dados vêm pela internet. O endereço público da equipe está em `lib/configuracao.ts`:

```text
https://aulas.umlequedetecnologia.com.br/api/leque-de-vagas/equipe/lequedevagas-jv
```

Compartilhe o mesmo nome com as outras pessoas. Alterar esse nome muda o conjunto de dados acessado. Ele não é uma senha.

## 4. Conferir vagas e empresas

1. Abra **Vagas**: a lista e os números devem carregar.
2. Digite parte de um título ou nome de empresa na busca.
3. Troque os filtros de área e confira a contagem.
4. Abra uma vaga, expanda/recolha a descrição e teste **Copiar link**.
5. Abra **Empresas**, escolha uma e alterne entre **Sobre** e **Vagas**. As setas do teclado também alternam as abas quando elas estão em foco.
6. Abra `/vagas/um-id-inexistente`: deve aparecer a tela de vaga não encontrada.

As vagas existentes na API, inclusive as de exemplo, recebem candidatura pelo site. Vaga arquivada continua com página de detalhe, mas sem formulário de candidatura.

## 5. Testar como empresa

1. Abra `/entrar` e entre como `ana@exemplo.com`, senha `leque1234`.
2. O painel deve mostrar somente as vagas da Ana.
3. Clique em **publicar uma vaga**.
4. Preencha título, área, senioridade, local e descrição de pelo menos **80 caracteres**. Marque a opção de iniciante se quiser.
5. Envie. Você será levado à vaga criada; o id vem da API.
6. Abra `/vagas`: a vaga e a contagem devem atualizar imediatamente.
7. Volte ao painel, abra **editar o perfil** e salve uma alteração da Aurora Tech.
8. Confira o perfil e o nome da empresa nas vagas.
9. Teste `/empresas/nuvem-rosa/editar` com a Ana: a edição deve ser recusada.
10. Se quiser testar **Arquivar**, use uma vaga de teste criada por você. Ela sai do mural e do painel, mas permanece no backend com `arquivada: true`.

Bruno (`bruno@exemplo.com`, mesma senha) só publica/edita pela Nuvem Rosa. Para trocar de conta, use **Sair** no painel.

## 6. Testar como candidata

1. Saia da conta de empresa.
2. Entre como `carla@exemplo.com`, senha `leque1234`.
3. Abra uma vaga ativa, selecione ao menos uma habilidade e envie.
4. Confira **Candidatura enviada**, a contagem no detalhe e a candidatura no painel.
5. Reabra a vaga e tente enviar outra vez: a API deve recusar a duplicação com uma mensagem.
6. Tente abrir `/vagas/nova`: uma candidata não pode publicar.
7. Para testar cadastro, saia e use `/cadastro` com um nome fictício, e-mail fictício ainda não cadastrado e senha exclusiva do exercício, de **8 a 72 caracteres**. O cadastro leva diretamente ao painel de candidata.
8. Tentar cadastrar o mesmo e-mail deve mostrar a mensagem da API no campo.

A API é didática e não tem autenticação própria nas operações diretas. Use dados de laboratório e não reutilize senha pessoal. As Server Actions do site conferem a sessão e o papel antes de escrever.

## 7. Importar os JSON da equipe, se necessário

O site já funciona com os dados remotos. A importação é necessária somente se você quiser trocar as vagas remotas pelo conteúdo de `dados/vagas.json` e atualizar/acrescentar as empresas de `dados/empresas.json`, conforme a frente 1 do desafio.

1. Confirme com a equipe se essas são as vagas que devem permanecer.
2. Confira o destino em `lib/configuracao.ts`.
3. Revise os dois JSON. Todo `empresaSlug` precisa existir entre as empresas. A API exige título de 5 a 120 caracteres, descrição de 20 a 2000, área e senioridade com até 40 e local com até 60.
4. Execute o comando informativo, que não altera dados:

```bash
npm run dados:importar
```

5. Somente quando quiser **substituir as vagas já existentes na API**, execute:

```bash
npm run dados:importar -- --confirmar-substituicao
```

6. A resposta de sucesso informa a quantidade de vagas e empresas. Em caso de 422, corrija os campos indicados e tente novamente. A API valida tudo antes de importar.
7. Aguarde a revalidação do catálogo, de cerca de um minuto, ou reinicie o servidor de desenvolvimento.

O script envia os JSON locais, evitando depender de um push para a API buscar os arquivos. Contas são mantidas pela API; vagas das empresas da Ana e do Bruno passam a ter esses autores. Como o comando troca vagas existentes, não foi executado automaticamente nesta atualização.

## 8. Validar antes de entregar

Em um segundo terminal na pasta do projeto:

```bash
npm run typecheck
npm test
npm run verificar:api
npm run build
```

- `typecheck`: verifica os tipos.
- `test`: verifica integração HTTP, erros da API e regras de permissão com respostas simuladas.
- `verificar:api`: consulta o backend real sem escrever nele.
- `build`: compila e pré-gera o site, usando a API real.

Para testar a versão de produção, pare o `dev` com Control+C e execute `npm start`. Abra a URL indicada. Não rode `dev` e `build` ao mesmo tempo no mesmo diretório `.next`.

### Provar a tela de erro do desafio

1. Execute `npm run dev`.
2. Em `lib/api.ts`, somente dentro de `listarVagas`, troque temporariamente `"/vagas"` por `"/vagas?falha=503"`.
3. Abra `/vagas`. Deve aparecer a mensagem de falha com **Tentar de novo**. O terminal registra o erro 503.
4. Registre a evidência da atividade.
5. Desfaça a alteração. Clique em **Tentar de novo**.
6. Só depois execute o build ou envie o código. A falha simulada não pode ficar na entrega.

## 9. Enviar as alterações ao GitHub

A atualização ficou nos arquivos locais. Na pasta do projeto:

```bash
git status
git diff
```

Confira os arquivos e se o remoto é o repositório correto com `git remote -v`. Para um envio em branch:

```bash
git switch -c aula/09-api
git add .
git commit -m "feat: integrar Leque de Vagas à API da equipe"
git push -u origin aula/09-api
```

No GitHub, abra um Pull Request para `main`, inclua a evidência de cada frente e peça a revisão exigida pela disciplina. Depois da revisão, faça o merge. O guia da disciplina pede participação e evidência por frente; alinhe a divisão com sua equipe antes de apresentar.

O `.env.local`, dependências, cache e banco de dados não devem aparecer no commit. Se a branch já existir, escolha outro nome ou continue nela sem repetir `git switch -c`.

## 10. Configurar e publicar na Vercel

1. Entre na sua conta da Vercel.
2. Se o projeto já existe, abra-o. Caso contrário, escolha **Add New → Project** e importe `joaovitor2410/lequedevagas-jv`.
3. Selecione **Next.js** como Framework Preset.
4. Se o repositório tiver `package.json` na raiz, deixe **Root Directory** como a raiz. Se você tiver enviado a pasta inteira `Front_Avancado`, selecione `lequedevagas-jv`.
5. Selecione Node **24.x** (ou uma versão compatível com `engines`). Use `npm ci` para instalar e `npm run build` para compilar. Deixe o Output Directory padrão do Next.js.
6. Em **Settings → Environment Variables**, adicione **AUTH_SECRET**, com um segredo novo e diferente do local. Gere-o no terminal:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

7. Cole o resultado no valor de `AUTH_SECRET`; aplique a **Production** e **Preview** se usar ambos. Não coloque esse valor no README ou no GitHub.
8. Não é necessário `DATABASE_URL`. `AUTH_TRUST_HOST=true` é da configuração local; na Vercel o Auth.js detecta o ambiente automaticamente.
9. Clique em **Deploy**. Para um projeto já conectado, o push/merge em `main` dispara a publicação.
10. Se adicionou a variável depois do último deploy, vá a **Deployments → último deployment → Redeploy**.
11. Abra a URL publicada e repita os passos de login, publicação e candidatura.
12. Abra a mesma vaga no localhost para provar que ambos usam a API da equipe. Alterações feitas externamente podem esperar a revalidação de 60 segundos.
13. Salve o link da Vercel na entrega da disciplina.

A publicação na sua conta Vercel não foi realizada nesta atualização. O código foi preparado para esse fluxo; a configuração externa e a prova no endereço publicado ficam para esses passos.

## 11. Resolver problemas comuns

| Sintoma | Como resolver |
| --- | --- |
| `package.json` não encontrado | Entre em `Front_Avancado/lequedevagas-jv`. |
| Comando de script não entende `.ts` | Use Node 22.18+; recomendado 24. |
| `MissingSecret` | Execute `npm run configurar` no local; na Vercel configure `AUTH_SECRET` e faça redeploy. |
| Login antigo volta para `/entrar` | Saia e entre novamente: o cookie do SQLite antigo tinha outro id. |
| API não carrega ou build falha em `fetch` | Confira internet, disponibilidade da API e o endereço em `lib/configuracao.ts`. |
| Mural de outro computador não atualiza | Confira o mesmo nome de equipe e aguarde a revalidação de 60 segundos. |
| 422 | Corrija os campos indicados. A API tem regras adicionais às do Zod local. |
| Candidatura duplicada | A mesma conta/e-mail já se candidatou àquela vaga; consulte o painel. |
| Erro na Vercel | Abra **Deployments → último deployment → Logs** e confira a variável `AUTH_SECRET` e a conectividade com a API. |

## Fontes consultadas

- [Notebook com as dez fontes](https://notebook.google.com/notebook/ae36a796-471d-4146-bccd-ef5201e6167f).
- [Slides da aula 09](https://aulas.umlequedetecnologia.com.br/material/introducao-nextjs/aula-09-o-backend-no-ar/slides.html?inteira=1).
- [Card com implementação da aula 09](https://aulas.umlequedetecnologia.com.br/material/introducao-nextjs/aula-09-o-backend-no-ar/ticket.html).
- [Desafio das quatro frentes](https://aulas.umlequedetecnologia.com.br/material/introducao-nextjs/aula-09-o-backend-no-ar/desafio.html).
- [Contrato OpenAPI](https://aulas.umlequedetecnologia.com.br/api/leque-de-vagas/openapi.json).
