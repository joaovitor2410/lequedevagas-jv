"use client";

import Botao from "@/components/ui/Botao";

export default function ErroDeDados({ error, retry }: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <section role="alert" className="rounded-xl border border-dashed border-borda-campo p-6">
      <h1>Não conseguimos carregar os dados</h1>
      <p>A conexão com a nossa fonte de dados falhou. Tente novamente em instantes.</p>
      {error.digest && <p className="font-mono text-xs text-suave">Referência: {error.digest}</p>}
      <Botao variante="secundario" onClick={retry}>Tentar de novo</Botao>
    </section>
  );
}
