"use client";

import { useActionState } from "react";
import { entrar } from "./acoes";
import BotaoDeEnviar from "@/components/BotaoDeEnviar";
import Campo from "@/components/ui/Campo";
import { ESTADO_INICIAL } from "@/lib/tipos";

export default function FormularioDeEntrada() {
  const [estado, acaoDoForm, pendente] = useActionState(entrar, ESTADO_INICIAL);
  const { valores, erros } = estado;

  return (
    <form key={JSON.stringify(valores)} action={acaoDoForm} aria-busy={pendente} className="grid max-w-sm gap-4" noValidate>
      {/* O Campo liga rótulo, entrada e erro (aula 08): o leitor de tela diz
          "inválido" e lê a frase do erro logo depois do nome do campo. */}
      <Campo
        rotulo="E-mail"
        name="email"
        type="email"
        autoComplete="username"
        defaultValue={valores.email}
        erro={erros.email}
      />
      <Campo
        rotulo="Senha"
        name="senha"
        type="password"
        autoComplete="current-password"
        erro={erros.senha}
      />
      <div>
        <BotaoDeEnviar enviando="Entrando…">Entrar</BotaoDeEnviar>
      </div>
      {estado.mensagem && (
        <p role="alert" className="m-0 text-sm text-erro">
          {estado.mensagem}
        </p>
      )}
    </form>
  );
}
