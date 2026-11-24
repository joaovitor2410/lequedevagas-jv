# De onde vêm os dados · aulas 09 a 11

Fonte única: API HTTPS do curso, equipe **jv-e-abraao**, definida em `lib/configuracao.ts`. Todas as chamadas HTTP ficam em `lib/api.ts`; páginas não importam JSON local nem cliente de banco. Tipos escritos à mão em `lib/tipos.ts` mantêm o contrato independente da fonte. Datas chegam como texto ISO.

| Dado | Endpoint | Cache |
| --- | --- | --- |
| Vagas públicas e detalhes | `/vagas`, `/vagas/{id}` | 60 s, etiqueta `vagas` |
| Empresas | `/empresas`, `/empresas/{slug}` | 60 s, etiqueta `empresas` |
| Números da home e catálogo | `/numeros` | 60 s, etiqueta `vagas` |
| Total de candidaturas | `/vagas/{id}/candidaturas` | 60 s, etiqueta `candidaturas` |
| Identidade | `/pessoas/{id}` | `no-store` |
| Vagas abertas e arquivadas do painel | `/vagas?autor=...`, com `&arquivada=true` para arquivadas | `no-store` |
| Candidaturas do painel | `/pessoas/{id}/candidaturas` | `no-store` |
| Vaga usada para autorizar uma escrita | `/vagas/{id}` | `no-store` |
| Candidatura usada para autorizar desistência | `/candidaturas/{id}` | `no-store` |
| Escritas e login | POST, PUT, PATCH e DELETE | `no-store` |

A API gera ids, autoria informada pela ação, datas e nomes de empresas nas vagas; confere campos, duplicação e relações; guarda hash de senha. O site confere sessão e permissões antes de escrever. Nome, e-mail, empresa e autoria vêm da sessão ou do recurso original, nunca de campos enviados pelo navegador.

## Invalidação depois de sucesso

| Operação | Etiquetas |
| --- | --- |
| Publicar, arquivar ou desarquivar | `vagas` |
| Editar vaga | `vagas`, `candidaturas` |
| Apagar vaga e candidaturas dela | `vagas`, `candidaturas` |
| Editar empresa | `empresas`, `vagas` |
| Enviar ou desistir de candidatura | `candidaturas` |
| Apagar conta e candidaturas dela | `candidaturas`, seguido de logout |

`updateTag` é chamado na Server Action somente após confirmação da API. Leituras dos painéis são frescas. Mudanças externas nas páginas públicas respeitam os 60 segundos de revalidação. O PUT do perfil também atualiza o nome da empresa nas vagas. Os painéis não compartilham cache de respostas pessoais.

404 de detalhe significa ausência; 404 do endpoint de catálogo significa falha, evitando um mural vazio que pareça sucesso. Recusas 4xx devolvem `campos` e `erro` ao formulário. Falhas 5xx, conexão e timeout chegam ao `error.tsx`. Há limite de espera de 15 segundos nas chamadas da aplicação. Um DELETE 204 não tem JSON para interpretar.

## Dados locais e histórico

`dados/*.json` são material da equipe para importação, não uma segunda fonte do site. [Instruções](docs/PASSO_A_PASSO.md). A importação substitui vagas remotas e não foi executada nesta revisão. A decisão histórica entre JSON e banco local deixou de existir quando a API virou a fonte única.

Prisma, seed e migrations foram removidos na revisão da aula 11. `AUTH_SECRET` fica em `.env.local` e na Vercel; o exemplo versionado não contém segredo. A API didática não autentica seus endpoints diretos: use somente dados fictícios e senhas exclusivas do exercício.
