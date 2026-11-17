# Quem pode o quê

A tabela do desafio 07. Cada linha é uma função em `lib/permissoes.ts`, chamada
**pela tela** (para decidir o que desenhar — conveniência) e **pela ação**
(para decidir se faz — a tranca). Se esta tabela e o arquivo discordarem, um
dos dois está errado.

| verbo | quem pode | depende de | função | onde a ação pergunta |
| --- | --- | --- | --- | --- |
| publicar vaga | quem fala por uma empresa | papel | `podePublicar(quem)` | `app/vagas/nova/acoes.ts` |
| editar o perfil da empresa | quem fala por **aquela** empresa | papel + qual | `podeEditarEmpresa(quem, slug)` | `app/empresas/[slug]/editar/acoes.ts` |
| candidatar-se | quem é candidata | papel | `podeCandidatar(quem)` | `app/vagas/[id]/acoes.ts` |
| arquivar vaga | quem publicou **aquela** vaga | dono | `podeArquivar(quem, vaga)` | `app/vagas/acoes.ts` |
| criar conta | qualquer pessoa — sempre como candidata | — | (o papel é fixo na ação) | `app/cadastro/acoes.ts` |

## As regras que saem da tabela

- **Quem é vem da sessão, nunca do formulário.** O dono da vaga, a empresa que
  publica, o nome e o e-mail da candidata e o papel de quem se cadastra. Um
  campo `empresaSlug`, `papel` ou `nome` enfiado pelo DevTools é ignorado:
  ele nem está no esquema do Zod.
- **Vaga sem dono ninguém arquiva.** A API informa `autorId`; se for nulo,
  nenhuma sessão é autora. A ação relê a vaga sem cache antes da operação.
- **Arquivar recusado mostra mensagem.** Falhas de permissão e recusas da API
  voltam ao formulário, sem simular sucesso nem invalidar o cache.
- **O `proxy.ts` é atalho, não tranca.** Ele devolve para `/entrar` quem nem
  entrou, nas três páginas de uma pessoa só (`/painel`, `/vagas/nova`,
  `/empresas/[slug]/editar`). Quem decide é a ação, a cada envio.
- **Ler a sessão só onde a página já é de uma pessoa.** Mural, vaga e empresa
  são iguais para todo mundo e continuam pré-gerados (○ e ●). Por isso o botão
  Arquivar e o link "editar perfil" moram no `/painel`, e a candidatura
  descobre quem é dentro da ação.

## As pessoas de laboratório

A API da equipe fornece três contas de laboratório, todas com a senha `leque1234`:

| pessoa | e-mail | papel | fala por |
| --- | --- | --- | --- |
| Ana Souza | `ana@exemplo.com` | empresa | Aurora Tech (`aurora-tech`) |
| Bruno Lima | `bruno@exemplo.com` | empresa | Nuvem Rosa (`nuvem-rosa`) |
| Carla Dias | `carla@exemplo.com` | candidata | — |

Essas contas são exclusivamente didáticas. Não use dados pessoais reais ou senhas reutilizadas no backend público do curso.
