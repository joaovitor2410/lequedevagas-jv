import type { Quem } from "@/lib/sessao";

/**
 * AS REGRAS DE QUEM PODE O QUÊ, num arquivo só (aula 07). Cada função é uma
 * linha da tabela do PERMISSOES.md — se os dois discordarem, um está errado.
 *
 * - a TELA usa para decidir o que desenhar (conveniência);
 * - a AÇÃO usa para decidir se faz (a tranca).
 *
 * Funções puras: não leem cookie e não vão ao banco. Recebem `quem` (do
 * usuarioAtual()) e, quando precisam, o quê. É isso que deixa a mesma regra
 * servir à tela e à ação — escrita duas vezes, ela divergiria na primeira
 * mudança.
 */

/** Publicar vaga: só quem fala por uma empresa. (frente 1) */
export function podePublicar(quem: Quem | null): quem is Quem & { empresaSlug: string } {
  // O `quem is …` é um predicado de tipo: depois de um `if (!podePublicar(quem))
  // return`, o TypeScript sabe que quem.empresaSlug é texto.
  return quem?.papel === "empresa" && typeof quem.empresaSlug === "string" && quem.empresaSlug.length > 0;
}

/** Editar o perfil de uma empresa: só quem fala por ELA. (frente 2) */
export function podeEditarEmpresa(quem: Quem | null, slug: string): boolean {
  return quem?.papel === "empresa" && quem.empresaSlug === slug;
}

/** Candidatar-se: só quem entrou como candidata. (frente 3) */
export function podeCandidatar(quem: Quem | null): quem is Quem {
  return quem?.papel === "candidata";
}

/** Editar e apagar compartilham a regra de autoria do arquivamento. */
export function podeEditarVaga(quem: Quem | null, vaga: { autorId: string | null }): boolean {
  return podeArquivar(quem, vaga);
}

/** Só a candidata dona da candidatura pode desistir. */
export function podeDesistir(quem: Quem | null, candidatura: { pessoaId: string | null }): boolean {
  return quem?.papel === "candidata" && candidatura.pessoaId === quem.id;
}

/** Arquivar: só quem publicou. Vaga sem dono ninguém arquiva. (frente 4) */
export function podeArquivar(quem: Quem | null, vaga: { autorId: string | null }): boolean {
  // Com autorId nulo, a comparação dá false para todo mundo — é assim que
  // "vaga sem dono ninguém arquiva" acontece sem um if a mais.
  return quem?.papel === "empresa" && vaga.autorId === quem.id;
}
