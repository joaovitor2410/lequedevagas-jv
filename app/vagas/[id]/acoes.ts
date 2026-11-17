"use server"; // PRIMEIRA linha do arquivo. Antes de qualquer import.

import { updateTag } from "next/cache";
import { guardarCandidatura } from "@/lib/api";
import { EsquemaDaCandidatura } from "@/lib/esquemas";
import { porCampo } from "@/lib/formulario";
import { podeCandidatar } from "@/lib/permissoes";
import { usuarioAtual } from "@/lib/sessao";
import type { Estado } from "@/lib/tipos";

/**
 * Candidatar-se (aula 05, frente 3 → aula 06 → aula 07).
 *
 * DOIS parâmetros: com useActionState o Next chama a ação com o estado
 * anterior na frente. Quem declara só (dados: FormData) recebe o ESTADO no
 * lugar do formulário, e todo campo vira undefined sem erro nenhum.
 */
export async function enviarCandidatura(
  estadoAnterior: Estado,
  dados: FormData,
): Promise<Estado> {
  // As habilidades são uma LISTA, e Object.fromEntries só guardaria a
  // última. Para lista existe o getAll.
  const habilidades = dados.getAll("habilidades").map(String);
  const valores = { habilidades: habilidades.join(",") };

  /* 0. QUEM ESTÁ CHAMANDO? (aula 07) A página da vaga é estática (●): ela
        não sabe quem está olhando. Quem sabe é a AÇÃO, que roda com o
        cookie de quem mandou. */
  const quem = await usuarioAtual();
  if (!podeCandidatar(quem)) {
    return { ok: false, erros: {}, valores, mensagem: "Entre como candidata para se candidatar." };
  }

  // 1. DESCONFIE. Nada do que chegou aqui passou pelo seu formulário.
  const analise = EsquemaDaCandidatura.safeParse({ vagaId: dados.get("vagaId"), habilidades });
  if (!analise.success) {
    return { ok: false, erros: porCampo(analise.error), valores };
  }

  // O backend confere vaga inexistente, arquivada e candidatura duplicada.
  const gravou = await guardarCandidatura(analise.data.vagaId, {
    nome: quem.nome,
    email: quem.email,
    habilidades: analise.data.habilidades,
    pessoaId: quem.id,
  });
  if (!gravou.ok) {
    return { ok: false, erros: gravou.erros, valores, mensagem: gravou.mensagem };
  }

  updateTag("candidaturas");
  return { ok: true, erros: {}, valores: {}, mensagem: "Candidatura enviada!" };
}
