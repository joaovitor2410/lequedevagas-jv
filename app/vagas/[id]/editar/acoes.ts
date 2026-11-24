"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { apagarVaga, buscarVaga, trocarVaga } from "@/lib/api";
import { EsquemaDaVaga } from "@/lib/esquemas";
import { porCampo, valoresDe } from "@/lib/formulario";
import { podeEditarVaga } from "@/lib/permissoes";
import { usuarioAtual } from "@/lib/sessao";
import type { Estado } from "@/lib/tipos";

export async function editarVaga(id: string, estadoAnterior: Estado, dados: FormData): Promise<Estado> {
  const valores = valoresDe(dados);
  const [quem, vaga] = await Promise.all([usuarioAtual(), buscarVaga(id, true)]);
  if (!vaga) return { ok: false, erros: {}, valores, mensagem: "Esta vaga não existe mais." };
  if (!podeEditarVaga(quem, vaga)) {
    return { ok: false, erros: {}, valores, mensagem: "Só quem publicou esta vaga pode editar." };
  }

  const analise = EsquemaDaVaga.safeParse(Object.fromEntries(dados));
  if (!analise.success) return { ok: false, erros: porCampo(analise.error), valores };

  // A empresa é a da vaga original: editar não troca empresa, dona, data ou situação.
  const gravou = await trocarVaga(vaga.id, { ...analise.data, empresaSlug: vaga.empresaSlug });
  if (!gravou.ok) return { ok: false, erros: gravou.erros, valores, mensagem: gravou.mensagem };

  updateTag("vagas");
  // O histórico da candidata inclui o título e a empresa da vaga.
  updateTag("candidaturas");
  redirect(`/vagas/${encodeURIComponent(vaga.id)}`);
}

export async function apagar(id: string): Promise<Estado> {
  const [quem, vaga] = await Promise.all([usuarioAtual(), buscarVaga(id, true)]);
  if (!vaga || !podeEditarVaga(quem, vaga)) {
    return { ok: false, erros: {}, valores: {}, mensagem: "Só quem publicou esta vaga pode apagar." };
  }

  const gravou = await apagarVaga(vaga.id);
  if (!gravou.ok) return { ok: false, erros: gravou.erros, valores: {}, mensagem: gravou.mensagem };

  updateTag("vagas");
  updateTag("candidaturas");
  redirect("/painel");
}
