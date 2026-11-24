"use client";

import { useSearchParams } from "next/navigation";
import Filtros from "./Filtros";
import CardDeVaga from "./CardDeVaga";
import type { Vaga } from "@/lib/tipos";
import { filtrarVagas, lerFiltros, type FiltrosDeVagas } from "@/lib/filtros";

/**
 * O mural é igual para todo mundo, e por isso a página dele é pré-gerada.
 * As arquivadas já chegam fora da lista: quem as tira é a consulta, no
 * lib/api.ts (aula 06) — componente só mostra.
 */
export default function MuralDeVagas({ vagas }: { vagas: Vaga[] }) {
  // A URL é a fonte de verdade: recarregar, compartilhar e voltar preservam os filtros.
  const parametros = useSearchParams();
  const filtros = lerFiltros(parametros);
  const areas = [...new Set(vagas.map((v) => v.area))].sort();
  const senioridades = [...new Set(vagas.map((v) => v.senioridade))].sort();
  const visiveis = filtrarVagas(vagas, filtros);

  function mudarFiltro(campo: keyof FiltrosDeVagas, valor: string) {
    const proximos = new URLSearchParams(window.location.search);
    if (valor) proximos.set(campo, valor);
    else proximos.delete(campo);
    const consulta = proximos.toString();
    const endereco = `${window.location.pathname}${consulta ? `?${consulta}` : ""}`;
    // Digitar não cria uma entrada por letra. Escolhas discretas admitem Voltar.
    if (campo === "busca") window.history.replaceState(null, "", endereco);
    else window.history.pushState(null, "", endereco);
  }

  function limparFiltros() {
    const proximos = new URLSearchParams(window.location.search);
    for (const campo of ["busca", "area", "senioridade", "iniciante"]) proximos.delete(campo);
    const consulta = proximos.toString();
    window.history.pushState(null, "", `${window.location.pathname}${consulta ? `?${consulta}` : ""}`);
  }

  const aceitamIniciante = visiveis.filter((v) => v.aceitaIniciante).length;

  return (
    <section>
      {/* O dado desce por prop (busca, area) e o aviso sobe por função. */}
      <Filtros
        filtros={filtros}
        aoMudar={mudarFiltro}
        aoLimpar={limparFiltros}
        areas={areas}
        senioridades={senioridades}
      />

      {/* aria-live="polite": quando um chip ou a busca muda a conta, o leitor
          de tela lê a frase nova sozinho — sem tirar a pessoa de onde está. */}
      <p className="text-sm text-suave" aria-live="polite">
        <strong>{visiveis.length}</strong> de {vagas.length} vagas ·{" "}
        <strong>{aceitamIniciante}</strong> aceitam quem está começando
      </p>

      {visiveis.length === 0 ? (
        <p>Nenhuma vaga com esses filtros. Tente outra palavra ou limpe os filtros.</p>
      ) : (
        // Uma coluna em qualquer tela; duas a partir de 640px (sm:).
        <ul className="grid gap-3 sm:grid-cols-2">
          {visiveis.map((vaga) => (
            <CardDeVaga key={vaga.id} vaga={vaga} />
          ))}
        </ul>
      )}
    </section>
  );
}
