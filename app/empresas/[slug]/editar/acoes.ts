"use server"; // PRIMEIRA linha do arquivo. Antes de qualquer import.

import { updateTag } from "next/cache";
import { guardarEmpresa } from "@/lib/api";
import { EsquemaDaEmpresa } from "@/lib/esquemas";
import { porCampo, valoresDe } from "@/lib/formulario";
import { podeEditarEmpresa } from "@/lib/permissoes";
import { usuarioAtual } from "@/lib/sessao";
import type { Estado } from "@/lib/tipos";

/**
 * Editar o perfil da empresa (aula 05, frente 2 → aula 06 → aula 07).
 *
 * O slug NÃO vem do formulário: ele é preso à ação com .bind() no
 * componente, e chega como primeiro argumento, antes do estado. Um
 * <input type="hidden" name="slug"> seria trocável pelo DevTools.
 */
export async function salvarEmpresa(
  slug: string,
  estadoAnterior: Estado,
  dados: FormData,
): Promise<Estado> {
  const valores = valoresDe(dados);

  /* A porta que o .bind deixou aberta (aula 07). O slug preso diz QUAL
     empresa; só a sessão diz QUEM está pedindo. As duas perguntas, aqui. */
  const quem = await usuarioAtual();
  if (!podeEditarEmpresa(quem, slug)) {
    return {
      ok: false,
      erros: {},
      valores,
      mensagem: "Só quem fala por esta empresa pode editar o perfil.",
    };
  }

  const analise = EsquemaDaEmpresa.safeParse(Object.fromEntries(dados));
  if (!analise.success) {
    return { ok: false, erros: porCampo(analise.error), valores };
  }

  const gravou = await guardarEmpresa(slug, analise.data);
  if (!gravou.ok) {
    return { ok: false, erros: gravou.erros, valores, mensagem: gravou.mensagem };
  }

  // O backend também troca o nome da empresa nas vagas dela.
  updateTag("empresas");
  updateTag("vagas");
  return { ok: true, erros: {}, valores, mensagem: "Perfil salvo." };
}
