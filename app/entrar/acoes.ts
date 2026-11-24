"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { EsquemaDoLogin } from "@/lib/esquemas";
import { porCampo, valoresDe } from "@/lib/formulario";
import type { Estado } from "@/lib/tipos";

export async function entrar(estadoAnterior: Estado, dados: FormData): Promise<Estado> {
  const valores = valoresDe(dados);
  delete valores.senha; // a senha NUNCA volta para a tela, nem recusada

  const analise = EsquemaDoLogin.safeParse(Object.fromEntries(dados));
  if (!analise.success) {
    return { ok: false, erros: porCampo(analise.error), valores };
  }

  try {
    await signIn("credentials", { ...analise.data, redirectTo: "/painel" });
  } catch (erro) {
    // E-mail que não existe e senha errada caem AQUI, com a MESMA frase:
    // "esse e-mail não existe" contaria a quem tenta adivinhar quem tem conta.
    if (erro instanceof AuthError && erro.type === "CredentialsSignin") {
      return { ok: false, erros: {}, valores, mensagem: "E-mail ou senha não conferem." };
    }
    // Deu certo? Então o signIn LANÇOU o redirect para /painel — é assim que
    // o redirect funciona desde a aula 05. Um catch que engolisse tudo
    // engoliria justamente o login bem-sucedido. Ele sobe.
    throw erro;
  }

  return { ok: false, erros: {}, valores };
}
