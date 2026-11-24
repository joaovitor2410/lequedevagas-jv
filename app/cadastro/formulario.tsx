"use client";

import { useActionState } from "react";
import { cadastrar } from "./acoes";
import BotaoDeEnviar from "@/components/BotaoDeEnviar";
import Campo from "@/components/ui/Campo";
import { ESTADO_INICIAL } from "@/lib/tipos";

export default function FormularioDeCadastro() {
  const [estado, acaoDoForm, pendente] = useActionState(cadastrar, ESTADO_INICIAL);
  const { valores, erros } = estado;

  return (
    <form key={JSON.stringify(valores)} action={acaoDoForm} aria-busy={pendente} className="grid max-w-sm gap-4" noValidate>
      {/* O autoComplete diz ao navegador O QUE é cada campo: o celular sugere
          o e-mail, e o gerenciador de senha oferece uma senha forte no
          new-password — e não a senha antiga, como no current-password. */}
      <Campo
        rotulo="Nome completo"
        name="nome"
        autoComplete="name"
        defaultValue={valores.nome}
        erro={erros.nome}
      />
      <Campo
        rotulo="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={valores.email}
        erro={erros.email}
      />
      <Campo
        rotulo="Senha"
        name="senha"
        type="password"
        autoComplete="new-password"
        erro={erros.senha}
      />
      <div>
        <BotaoDeEnviar enviando="Criando…">Criar conta</BotaoDeEnviar>
      </div>
      {estado.mensagem && (
        <p role="alert" className="m-0 text-sm text-erro">
          {estado.mensagem}
        </p>
      )}
    </form>
  );
}
