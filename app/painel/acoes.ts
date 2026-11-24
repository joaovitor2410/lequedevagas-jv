"use server";

import { signOut } from "@/auth";
import { updateTag } from "next/cache";
import { apagarCandidatura, apagarPessoa, buscarCandidatura } from "@/lib/api";
import { podeDesistir } from "@/lib/permissoes";
import { usuarioAtual } from "@/lib/sessao";
import type { Estado } from "@/lib/tipos";

// Sair também é uma ação: apaga o cookie da sessão, e isso só se faz no servidor.
export async function sair() {
  await signOut({ redirectTo: "/" });
}

/** O id vem somente da sessão: não há campo nem argumento para escolher outra conta. */
export async function apagarConta(): Promise<Estado> {
  const quem = await usuarioAtual();
  if (!quem) return { ok: false, erros: {}, valores: {}, mensagem: "Entre para apagar a sua conta." };

  // A API recusa com 409 se a pessoa ainda tem vagas, inclusive arquivadas.
  const gravou = await apagarPessoa(quem.id);
  if (!gravou.ok) return { ok: false, erros: gravou.erros, valores: {}, mensagem: gravou.mensagem };

  updateTag("candidaturas");
  await signOut({ redirectTo: "/" });
  return { ok: true, erros: {}, valores: {} };
}

export async function desistir(id: string): Promise<Estado> {
  const [quem, candidatura] = await Promise.all([usuarioAtual(), buscarCandidatura(id)]);
  if (!candidatura || !podeDesistir(quem, candidatura)) {
    return { ok: false, erros: {}, valores: {}, mensagem: "Só quem se candidatou pode desistir." };
  }

  const gravou = await apagarCandidatura(candidatura.id);
  if (!gravou.ok) return { ok: false, erros: gravou.erros, valores: {}, mensagem: gravou.mensagem };

  updateTag("candidaturas");
  return { ok: true, erros: {}, valores: {}, mensagem: "Candidatura removida." };
}
