"use server";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { guardarVaga } from "@/lib/api";
import { EsquemaDaVaga } from "@/lib/esquemas";
import { porCampo, valoresDe } from "@/lib/formulario";
import { podePublicar } from "@/lib/permissoes";
import { usuarioAtual } from "@/lib/sessao";
import type { Estado } from "@/lib/tipos";

export async function criarVaga(estadoAnterior: Estado, dados: FormData): Promise<Estado> {
  const valores = valoresDe(dados);

  // 0. QUEM ESTÁ CHAMANDO? (aula 07)
  const quem = await usuarioAtual();
  if (!podePublicar(quem)) {
    return { ok: false, erros: {}, valores, mensagem: "Só quem publica por uma empresa pode abrir vaga." };
  }

  // 1. DESCONFIE — o safeParse de sempre.
  const analise = EsquemaDaVaga.safeParse(Object.fromEntries(dados));
  if (!analise.success) {
    return { ok: false, erros: porCampo(analise.error), valores };
  }

  // 2. FAÇA O TRABALHO, agora na API. O id, a data e o nome da empresa, quem
  //    dá é ela; por qual empresa se publica continua vindo da sessão (aula 07).
  const gravou = await guardarVaga({ ...analise.data, empresaSlug: quem.empresaSlug }, quem.id);

  // 3. A API RECUSOU? É conversa: os campos dela voltam para o formulário.
  if (!gravou.ok) {
    return { ok: false, erros: gravou.erros, valores, mensagem: gravou.mensagem };
  }

  // 4. AVISE O CACHE pela etiqueta: toda página que leu "vagas" — o mural, a
  //    empresa, o início — busca de novo na próxima visita.
  updateTag("vagas");

  // 5. SAIA — para o endereço que a API deu.
  redirect(`/vagas/${gravou.dado.id}`);
}