# Validação da atualização · 17/11/2026

Escopo: aulas 01 a 09 disponíveis no notebook, incluindo a migração e o desafio das quatro frentes da aula 09. Equipe configurada: `lequedevagas-jv`.

## Verificações automatizadas

- `npm run typecheck`: verificação TypeScript.
- `npm test`: 13 testes de integração HTTP com respostas simuladas, regras de autorização e validação.
- `npm run verificar:api`: GETs reais de vagas, empresas e números, todos com resposta 200.
- `npm run build`: compilação de produção; catálogo e detalhes pré-gerados, mantendo as áreas pessoais dinâmicas.
- `git diff --check`: verificação de espaços e conflitos no diff.

Os testes de integração cobrem 404, 401, 409, 422 e 503, preservação de erros de campo, identidade sem cache, ids codificados, autoria da publicação, cadastro com papel fixo, PUT do perfil e PATCH do arquivamento.

## Fluxos conferidos no Chrome

| Fluxo | Resultado observado |
| --- | --- |
| Login como Ana | Painel da Aurora Tech com as vagas da autora |
| Publicação sem preencher campos | Mensagens de validação ligadas aos campos |
| Publicação de uma vaga fictícia | Detalhe aberto com id gerado pela API; vaga no painel |
| Login como Carla | Painel com o histórico da candidata |
| Candidatura à vaga fictícia | Confirmação de envio e contagem de 0 para 1 |
| Segunda candidatura à mesma vaga | Mensagem de duplicação devolvida pela API |
| Histórico após candidatura | Vaga no painel com data 17/11/2026 |
| Carla em `/vagas/nova` | Publicação recusada |
| Arquivamento pela Ana | Vaga fictícia removida do painel; API confirmou `arquivada: true` |
| Salvar o perfil atual da Aurora Tech | Confirmação “Perfil salvo.”, preservando o conteúdo existente |
| Falha temporária `?falha=503` no mural | Tela de erro com “Tentar de novo” |
| Remover a simulação e tentar novamente | Listagem recuperada com 12 vagas abertas e 8 para iniciantes |

A vaga de laboratório criada para a prova permaneceu arquivada, com a candidatura de teste associada. Nenhuma vaga preexistente foi arquivada ou substituída. A importação dos JSON não foi executada porque substitui as vagas da equipe.

## Limites e próximos passos externos

O cadastro foi verificado pelos testes de integração da camada HTTP e pela validação; a criação de uma conta nova não foi exercitada no navegador. A publicação na conta Vercel, a revisão/merge no GitHub e a prova no domínio publicado dependem dos passos do [guia](PASSO_A_PASSO.md). A aplicação requer conectividade com a API do curso durante o build e a execução.
