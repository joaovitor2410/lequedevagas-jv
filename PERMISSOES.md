# Quem pode o quê

As regras puras em `lib/permissoes.ts` são usadas pelas telas e conferidas novamente dentro das ações. As leituras de identidade e autoria usadas para decidir ignoram cache compartilhado.

| Operação | Quem pode | Regra | Ação |
| --- | --- | --- | --- |
| Publicar vaga | Conta de empresa vinculada a uma empresa | `podePublicar` | `app/vagas/nova/acoes.ts` |
| Editar perfil | Conta vinculada àquela empresa | `podeEditarEmpresa` | `app/empresas/[slug]/editar/acoes.ts` |
| Candidatar-se | Conta candidata | `podeCandidatar` | `app/vagas/[id]/acoes.ts` |
| Arquivar e desarquivar | Conta de empresa que publicou a vaga | `podeArquivar` | `app/vagas/acoes.ts` |
| Editar e apagar vaga | Mesma autora do arquivamento | `podeEditarVaga`, delega a `podeArquivar` | `app/vagas/[id]/editar/acoes.ts` |
| Desistir | Candidata dona da candidatura | `podeDesistir` | `app/painel/acoes.ts` |
| Apagar a própria conta | Pessoa logada; API recusa quem tem vagas | Id exclusivamente da sessão | `app/painel/acoes.ts` |
| Criar conta | Cadastro público, sempre candidata | Papel fixado pela ação | `app/cadastro/acoes.ts` |

- A autoria, a empresa de publicação e a identidade da candidata vêm da sessão. Na edição, a empresa vem da vaga original. Campos injetados não alteram id, data, dona ou situação da vaga.
- Vaga sem autora não pode ser alterada pelo site. Candidatura sem pessoa vinculada não pode ser apagada por outra conta.
- O id oculto de arquivar/desarquivar escolhe o recurso; a ação relê a vaga e confere a autora. O `.bind` em editar/apagar/desistir não substitui essa autorização.
- A confirmação de exclusão evita cliques acidentais. Cancelar não envia a ação. A ação continua conferindo a permissão mesmo quando alguém contorna a confirmação.
- A exclusão da conta não recebe id do formulário nem do `.bind`: usa `quem.id` e encerra a sessão só depois do sucesso. Contas com vagas ativas ou arquivadas recebem 409 da API.
- O proxy redireciona visitantes de `/painel`, `/vagas/nova`, `/vagas/[id]/editar` e `/empresas/[slug]/editar`. As ações continuam protegendo cada envio, inclusive quando a conta muda em outra aba.
- O layout e os detalhes públicos não leem sessão. Ações pessoais ficam no painel; o mural permanece igual para todo mundo.

## Contas didáticas

| Conta | Papel | Empresa |
| --- | --- | --- |
| `ana@exemplo.com` | Empresa | Aurora Tech (`aurora-tech`) |
| `bruno@exemplo.com` | Empresa | Nuvem Rosa (`nuvem-rosa`) |
| `carla@exemplo.com` | Candidata | — |

Senha de laboratório: `leque1234`. A API é um ambiente didático com endpoints diretos públicos. A autorização do site não altera essa característica do backend.
