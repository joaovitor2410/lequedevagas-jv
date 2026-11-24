"use server";

import { updateTag } from "next/cache";
import { arquivarVaga, buscarVaga, desarquivarVaga } from "@/lib/api";
import { EsquemaDeArquivar } from "@/lib/esquemas";
import { podeArquivar } from "@/lib/permissoes";
import { usuarioAtual } from "@/lib/sessao";
import type { Estado } from "@/lib/tipos";

export async function arquivar(estadoAnterior: Estado, dados: FormData): Promise<Estado> {
  return mudarArquivamento(dados, true);
}

export async function desarquivar(estadoAnterior: Estado, dados: FormData): Promise<Estado> {
  return mudarArquivamento(dados, false);
}

async function mudarArquivamento(dados: FormData, arquivada: boolean): Promise<Estado> {
  const analise = EsquemaDeArquivar.safeParse(Object.fromEntries(dados));
  if (!analise.success) {
    return { ok: false, erros: {}, valores: {}, mensagem: "Vaga não informada." };
  }
  const [quem, vaga] = await Promise.all([
    usuarioAtual(), buscarVaga(analise.data.id, true),
  ]);
  if (!vaga || !podeArquivar(quem, vaga)) {
    return { ok: false, erros: {}, valores: {}, mensagem: `Só quem publicou pode ${arquivada ? "arquivar" : "desarquivar"} esta vaga.` };
  }

  const gravou = await (arquivada ? arquivarVaga(vaga.id) : desarquivarVaga(vaga.id));
  if (!gravou.ok) {
    return { ok: false, erros: gravou.erros, valores: {}, mensagem: gravou.mensagem };
  }
  updateTag("vagas");
  return { ok: true, erros: {}, valores: {}, mensagem: arquivada ? "Vaga arquivada." : "Vaga desarquivada." };
}
