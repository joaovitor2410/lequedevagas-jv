# De onde vêm os dados · aula 09

A fonte em execução é a API HTTPS do curso, equipe **lequedevagas-jv**. O endereço público fica em `lib/configuracao.ts`; `lib/api.ts` concentra todas as chamadas HTTP.

| Dado | Endpoint | Cache |
| --- | --- | --- |
| Vagas e detalhes | `/vagas`, `/vagas/{id}` | 60 segundos, etiqueta `vagas` |
| Empresas | `/empresas`, `/empresas/{slug}` | 60 segundos, etiqueta `empresas` |
| Números | `/numeros` | 60 segundos, etiqueta `vagas` |
| Total de candidaturas | `/vagas/{id}/candidaturas` | 60 segundos, etiqueta `candidaturas` |
| Identidade e permissões atuais | `/pessoas/{id}` | sem cache compartilhado |
| Vagas/candidaturas do painel | `/vagas?autor=...`, `/pessoas/{id}/candidaturas` | sem cache compartilhado |
| Escritas e login | POST, PUT e PATCH | sem cache |

As Server Actions conferem sessão e permissão antes de escrever. A API gera ids, nomes das empresas nas vagas e datas; também faz o hash das senhas e rejeita cadastros e candidaturas duplicados. A resposta `campos` da API vira `erros` no formulário. Falhas 5xx e de conexão chegam às telas de erro, sem mostrar mensagens técnicas ao visitante.

Depois de sucesso, publicar/arquivar expiram `vagas`; editar empresa expira `empresas` e `vagas`; candidatar expira `candidaturas`. O detalhe de uma vaga arquivada permanece acessível, mas não oferece candidatura. Leituras usadas para conferir autoria antes de arquivar ignoram o cache.

Os arquivos `dados/*.json` são material para importar com o script documentado no [passo a passo](docs/PASSO_A_PASSO.md). Não são buscados automaticamente pelo site. Importação substitui as vagas da equipe, portanto exige escolha explícita de quem opera o comando.

A pasta `prisma/` é histórica. O SQLite local e a antiga regra de sobrepor JSON com banco não participam da execução. O segredo `AUTH_SECRET` existe somente no `.env.local` e na configuração do provedor; não deve ir para o repositório.

A API compartilhada é didática e seus endpoints diretos não exigem autenticação. A autorização do site existe nas Server Actions; ela não torna o backend público adequado para dados pessoais reais.
