"use client";

import { useActionState, type ReactNode } from "react";
import BotaoDeEnviar from "@/components/BotaoDeEnviar";
import { ESTADO_INICIAL, type Estado } from "@/lib/tipos";

type Props = {
  acao: (estadoAnterior: Estado) => Promise<Estado>;
  pergunta: string;
  enviando: string;
  children: ReactNode;
};

/** A confirmação evita cliques acidentais; a autorização continua na ação. */
export default function BotaoDeApagar({ acao, pergunta, enviando, children }: Props) {
  const [estado, acaoDoForm, pendente] = useActionState(acao, ESTADO_INICIAL);

  return (
    <form
      action={acaoDoForm}
      aria-busy={pendente}
      onSubmit={(evento) => {
        if (!window.confirm(pergunta)) evento.preventDefault();
      }}
    >
      <BotaoDeEnviar variante="perigo" enviando={enviando}>{children}</BotaoDeEnviar>
      {estado.mensagem && (
        <p role={estado.ok ? "status" : "alert"} className={`mb-0 text-sm ${estado.ok ? "text-sucesso" : "text-erro"}`}>
          {estado.mensagem}
        </p>
      )}
    </form>
  );
}
