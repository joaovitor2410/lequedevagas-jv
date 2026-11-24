import type { Vaga } from "@/lib/tipos";

export type FiltrosDeVagas = {
  busca: string;
  area: string;
  senioridade: string;
  iniciante: "" | "true" | "false";
};

/** O briefing pede a mesma busca para “junior”, “Júnior” e “JÚNIOR”. */
export function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function lerFiltros(parametros: Pick<URLSearchParams, "get">): FiltrosDeVagas {
  const iniciante = parametros.get("iniciante");
  return {
    busca: parametros.get("busca") ?? "",
    area: parametros.get("area") ?? "",
    senioridade: parametros.get("senioridade") ?? "",
    iniciante: iniciante === "true" || iniciante === "false" ? iniciante : "",
  };
}

export function filtrarVagas(vagas: Vaga[], filtros: FiltrosDeVagas): Vaga[] {
  const busca = normalizar(filtros.busca);
  const area = normalizar(filtros.area);
  const senioridade = normalizar(filtros.senioridade);
  return vagas.filter((vaga) =>
    (normalizar(vaga.titulo).includes(busca) || normalizar(vaga.empresa).includes(busca)) &&
    (!area || normalizar(vaga.area) === area) &&
    (!senioridade || normalizar(vaga.senioridade) === senioridade) &&
    (!filtros.iniciante || vaga.aceitaIniciante === (filtros.iniciante === "true")),
  );
}
