# Executar, conferir e publicar · aulas 01 a 11

## 1. Abrir e executar

Abra `/Users/jayv/Desktop/Front_Avancado/lequedevagas-jv` no VS Code. No terminal dessa pasta:

```bash
node -v
npm ci
npm run configurar
npm run dev
```

Use Node 22.18+, recomendado 24. Abra a URL indicada pelo terminal, normalmente <http://localhost:3000>. O arquivo `.env.local` recebe um segredo aleatório e fica fora do Git. Todas as pessoas devem manter `EQUIPE = "jv-e-abraao"` em `lib/configuracao.ts`.

## 2. Explorar sem conta

1. Em `/vagas`, teste busca por título e empresa, área, senioridade e “Aceita iniciante”. “junior” também encontra “Júnior”.
2. Copie a URL com todos os filtros e abra em outra aba. Recarregue e confira os mesmos resultados. “Limpar filtros” volta ao catálogo completo.
3. Abra uma vaga, expanda/recolha a descrição e copie o link.
4. Em `/empresas`, abra uma empresa e troque as abas por clique e pelas setas do teclado.
5. Abra `/vagas/id-inexistente` e `/rota-inexistente`: devem aparecer as telas de ausência.
6. Sem login, `/painel`, `/vagas/nova`, `/vagas/1/editar` e `/empresas/aurora-tech/editar` levam a `/entrar`.

## 3. Conferir como empresa

Contas: `ana@exemplo.com` (Aurora Tech) e `bruno@exemplo.com` (Nuvem Rosa), senha `leque1234`. Use dados fictícios e recursos de teste.

1. Como Ana, abra o painel. Ele lista só vagas publicadas por ela, incluindo uma seção de arquivadas.
2. Publique uma vaga. Campos obrigatórios: título, área, senioridade, local e descrição com 80 a 2000 caracteres. A empresa vem da sessão.
3. Confira a vaga no mural e os números atualizados.
4. No painel, abra **Editar**. Os campos vêm preenchidos. Troque o título e a opção de iniciante; salve e confira o detalhe.
5. **Arquivar** tira do mural e mantém a vaga em **Arquivadas**. O detalhe continua acessível, sem receber candidaturas. **Desarquivar** devolve ao mural.
6. Em uma vaga descartável, **Apagar → Cancelar** mantém a vaga. **Apagar → confirmar** apaga a vaga e suas candidaturas; o endereço passa a mostrar ausência.
7. Edite o perfil da Aurora Tech. “Perfil salvo.” confirma; o nome aparece também nas vagas.
8. Como Bruno, tente `/vagas/1/editar` (vaga da Ana) e `/empresas/aurora-tech/editar`: os dois devem recusar.
9. Para provar a ação, abra o formulário com uma conta, troque a conta em outra aba e envie na primeira. A operação precisa ser recusada. No arquivar/desarquivar, troque o id oculto por uma vaga de outra autora e confirme que ela não mudou.

## 4. Conferir como candidata

Entre como `carla@exemplo.com`, senha `leque1234`, ou crie uma conta fictícia em `/cadastro`.

1. Cadastro: nome de 3 a 80 caracteres, e-mail válido e senha exclusiva de 8 a 72 caracteres. A conta nasce candidata e entra no painel. E-mail repetido é recusado.
2. Candidatura: selecione habilidades em uma vaga aberta. Nome e e-mail vêm da conta. O sucesso e a nova contagem devem aparecer.
3. Repita na mesma vaga: a API recusa duplicação. O painel mostra só candidaturas da conta atual.
4. Em candidatura descartável, **Desistir → Cancelar** mantém; confirmar remove e atualiza a contagem da vaga.
5. Deixe o painel aberto e entre como outra candidata em outra aba. Desistir pelo painel antigo precisa recusar.
6. Candidata em `/vagas/nova` ou na edição de vaga deve ser recusada.
7. **Apagar a minha conta**, em conta criada para o teste, pede confirmação, remove as candidaturas e encerra a sessão. O login anterior deixa de funcionar. Use essa prova apenas com uma conta descartável.
8. A exclusão de uma conta com vagas ativas ou arquivadas deve receber a mensagem de conflito da API, mantendo a sessão.

## 5. Estados dos formulários e acessibilidade

Confira publicação, edição de vaga, perfil, candidatura e ações do painel:

| Ensaio | Resultado esperado |
| --- | --- |
| Resposta com atraso | Botão com verbo de espera e desabilitado |
| Validação local | Mensagem ligada ao campo; valores preservados |
| Recusa 409/422 da API | Mensagem da API e erros de campo; texto e checkbox preservados |
| Falha 503 ou conexão | `error.tsx`, sem detalhes internos, com **Tentar de novo** |
| Cancelar exclusão | Nenhuma ação enviada |

A API aceita parâmetros didáticos. Somente em desenvolvimento, acrescente temporariamente `?atraso=2500`, depois `?falha=409`, depois `?falha=503` ao caminho da função que está ensaiando em `lib/api.ts`. Faça um ensaio por vez. Remova o parâmetro e use **Tentar de novo** para a recuperação. Não deixe essas simulações na entrega.

Com os testes encerrados, confira:

```bash
rg 'atraso=|falha=' lib app components
```

A busca deve ficar sem resultados. Não simule indisponibilidade enquanto roda build: os detalhes são pré-gerados com a API real.

Pelo teclado, confira foco, rótulos, erro do grupo de habilidades, abas com setas e descrição com `aria-expanded`. Meça axe nos temas claro/escuro e em largura 390 px. Registre os prints nas provas das frentes. Os formulários usam Server Actions; a candidatura sem JavaScript deve enviar, mas não mostrará a animação do botão. Os filtros do mural usam JavaScript.

## 6. Verificar a entrega local

Pare o servidor de desenvolvimento antes do build:

```bash
npm run typecheck
npm run lint
npm test
npm run verificar:api
npm run build
npm start
```

`verificar:api` faz somente GETs; os testes simulam escritas e não alteram a equipe. `npm start` executa o build existente, portanto mudanças de código pedem novo build. O build depende de internet. Não rode `dev` e `build` simultaneamente sobre o mesmo `.next`.

## 7. Dados da equipe

O catálogo atual é remoto. Os JSON locais só entram se a equipe escolher importá-los. Primeiro veja destino e instruções sem gravar:

```bash
npm run dados:importar
```

A execução com `--confirmar-substituicao` **substitui vagas remotas**. Revise os arquivos e combine com a equipe antes de usar. Os slugs precisam existir, e os limites constam no [manual da API](https://aulas.umlequedetecnologia.com.br/material/introducao-nextjs/projeto/api.html). A importação não foi executada nesta revisão.

## 8. Recuperar o endereço na Vercel

O domínio informado, <https://lequevagas.vercel.app/>, respondeu `404` com `DEPLOYMENT_NOT_FOUND` em 24/11/2026. O erro é da Vercel, antes da aplicação. A conta precisa ser consultada para localizar o projeto e conferir o domínio; não é possível determinar a causa só pela resposta pública.

1. Abra a conta/equipe da Vercel que hospedava o projeto ou conecte a integração Vercel solicitada durante a revisão.
2. Localize o projeto conectado a `joaovitor2410/lequedevagas-jv`. Em **Deployments**, confira se há deployment **Ready** e abra sua URL direta.
3. Em **Settings → Domains**, confira se `lequevagas.vercel.app` está associado ao projeto correto. Se a associação foi perdida, atribua o domínio ao deployment de produção do projeto. Se estiver em outra conta, use a conta proprietária.
4. Se o projeto foi removido, importe o repositório correto e verifique a disponibilidade do nome. O endereço exato depende da disponibilidade na conta; não há garantia de recuperar um nome ocupado por terceiro.
5. Framework **Next.js**, instalação `npm ci`, build `npm run build`, Node **24.x**. No repositório atual o `package.json` fica na raiz: mantenha **Root Directory** na raiz.
6. Configure **AUTH_SECRET** com um segredo próprio de produção em **Settings → Environment Variables**. Não envie o segredo no chat ou no Git. Não é necessário banco local. Na Vercel, o Auth.js reconhece o ambiente; `AUTH_TRUST_HOST` é para localhost.
7. Se o segredo foi alterado, faça **Redeploy**. Se o deployment falhar, abra seus logs e corrija a primeira falha.
8. Abra a URL de produção e repita as provas das duas contas de empresa e da candidata. Confirme filtros, dados compartilhados e autoria das operações.

A integração da Vercel não estava conectada no momento deste registro. Nenhuma configuração de conta/domínio nem publicação foi alterada localmente.

## 9. GitHub e evidências por frente

O remoto é `https://github.com/joaovitor2410/lequedevagas-jv`. A atualização consolidada está no histórico da `main`. Para novas alterações, confira antes de enviar:

```bash
git status
git diff --check
git diff
```

Revise a alteração completa, inclusive os arquivos novos, e não inclua `.env.local`, `.next` ou `node_modules`. O curso exige PRs por frente e review cruzado: registrem autoria real e provas próprias, sem criar histórico fictício. Um push/merge na branch de produção só publica automaticamente quando o projeto estiver conectado à Vercel.

## 10. Ensaio da defesa

A apresentação é de 15 minutos. Com a divisão informada pela dupla, um roteiro de ensaio é:

- 6 minutos · João Victor: publicar/editar/arquivar/desarquivar/apagar e perfil da empresa; uma tentativa de acesso alheio recusada; explicar formulário compartilhado e autoria.
- 6 minutos · Abraao: cadastro e candidatura com identidade da sessão, desistência e conta; filtros compartilháveis e números; uma sessão trocada recusada.
- 3 minutos · ambas as frentes juntas: decisão de cache, problema encontrado, perguntas e transições.

Ajustem esse roteiro à autorização da disciplina para a equipe em dupla. Usem o site publicado e deixem os arquivos das regras abertos no editor. O [desafio 11](https://aulas.umlequedetecnologia.com.br/material/introducao-nextjs/aula-11-pronto-para-a-defesa/desafio.html) orienta as provas de cada frente.
