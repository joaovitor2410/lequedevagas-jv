"use client";

import { useActionState } from "react";
import { arquivar, desarquivar } from "@/app/vagas/acoes";
import { ESTADO_INICIAL } from "@/lib/tipos";
import BotaoDeEnviar from "@/components/BotaoDeEnviar";

export default function FormularioDeArquivar({ id, arquivada = false }: { id: string; arquivada?: boolean }) {
  const [estado, acao, pendente] = useActionState(arquivada ? desarquivar : arquivar, ESTADO_INICIAL);
  return (
    <form action={acao} aria-busy={pendente}>
      <input type="hidden" name="id" value={id} />
      <BotaoDeEnviar variante="secundario" enviando={arquivada ? "Desarquivando…" : "Arquivando…"}>
        {arquivada ? "Desarquivar" : "Arquivar"}
      </BotaoDeEnviar>
      {estado.mensagem && <p role={estado.ok ? "status" : "alert"} className={`mb-0 text-sm ${estado.ok ? "text-sucesso" : "text-erro"}`}>{estado.mensagem}</p>}
    </form>
  );
}
