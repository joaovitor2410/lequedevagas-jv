"use server";

import { signIn } from "@/auth";
import { guardarPessoa } from "@/lib/api";
import { EsquemaDoCadastro } from "@/lib/esquemas";
import { porCampo, valoresDe } from "@/lib/formulario";
import type { Estado } from "@/lib/tipos";

/** Criar conta (aula 07, frente 3). Qualquer pessoa pode — sempre como candidata. */
export async function cadastrar(estadoAnterior: Estado, dados: FormData): Promise<Estado> {
  const valores = valoresDe(dados);
  delete valores.senha; // a senha nunca volta para a tela

  const analise = EsquemaDoCadastro.safeParse(Object.fromEntries(dados));
  if (!analise.success) {
    return { ok: false, erros: porCampo(analise.error), valores };
  }

  const { nome, email, senha } = analise.data;

  // A API recusa e-mail repetido e guarda o hash. O papel nunca vem do formulário.
  const gravou = await guardarPessoa({ nome, email, senha });
  if (!gravou.ok) {
    return { ok: false, erros: gravou.erros, valores, mensagem: gravou.mensagem };
  }

  // Cadastrou, já entra. O signIn lança o redirect para /painel, e ele sobe:
  // não há try/catch em volta.
  await signIn("credentials", { email, senha, redirectTo: "/painel" });
  return { ok: true, erros: {}, valores };
}
