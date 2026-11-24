"use client";

import { useState } from "react";
import Botao from "@/components/ui/Botao";

export default function BotaoCopiarLink({ titulo }: { titulo: string }) {
  const [situacao, setSituacao] = useState<"inicial" | "copiando" | "copiado" | "erro">("inicial");

  return (
    <div>
      <Botao
        variante="secundario"
        disabled={situacao === "copiando"}
        onClick={async () => {
          // location e navigator só existem no navegador.
          setSituacao("copiando");
          try {
            await navigator.clipboard.writeText(location.href);
            setSituacao("copiado");
          } catch {
            setSituacao("erro");
          }
        }}
      >
        {situacao === "copiando" ? "Copiando…" : situacao === "copiado" ? `✓ Link de “${titulo}” copiado` : "Copiar link"}
      </Botao>
      {situacao === "erro" && <p role="status" className="text-sm text-erro">Não foi possível copiar. Copie o endereço pela barra do navegador.</p>}
    </div>
  );
}
