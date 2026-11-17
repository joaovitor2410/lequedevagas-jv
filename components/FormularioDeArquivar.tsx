"use client";

import { useActionState } from "react";
import { arquivar } from "@/app/vagas/acoes";
import { ESTADO_INICIAL } from "@/lib/tipos";
import BotaoDeEnviar from "@/components/BotaoDeEnviar";

export default function FormularioDeArquivar({ id }: { id: string }) {
  const [estado, acao] = useActionState(arquivar, ESTADO_INICIAL);
  return (
    <form action={acao} className="pb-3.5 pl-4 sm:pb-0 sm:pl-0">
      <input type="hidden" name="id" value={id} />
      <BotaoDeEnviar variante="perigo" enviando="Arquivando…">Arquivar</BotaoDeEnviar>
      {estado.mensagem && <p role="status" className="text-sm text-erro">{estado.mensagem}</p>}
    </form>
  );
}
