import Botao from "@/components/ui/Botao";
import { normalizar, type FiltrosDeVagas } from "@/lib/filtros";

export default function Filtros({
  filtros,
  aoMudar,
  aoLimpar,
  areas,
  senioridades,
}: {
  filtros: FiltrosDeVagas;
  aoMudar: (campo: keyof FiltrosDeVagas, valor: string) => void;
  aoLimpar: () => void;
  areas: string[];
  senioridades: string[];
}) {
  const areaSelecionada = areas.find((a) => normalizar(a) === normalizar(filtros.area)) ?? filtros.area;
  const opcoesDeArea = ["", ...areas];
  if (areaSelecionada && !areas.includes(areaSelecionada)) opcoesDeArea.push(areaSelecionada);
  const senioridadeSelecionada = senioridades.find((s) => normalizar(s) === normalizar(filtros.senioridade)) ?? filtros.senioridade;
  const opcoesDeSenioridade = ["", ...senioridades];
  if (senioridadeSelecionada && !senioridades.includes(senioridadeSelecionada)) opcoesDeSenioridade.push(senioridadeSelecionada);

  // Nenhum useState aqui. Este componente não lembra de nada: ele mostra o
  // que recebe e avisa quando alguém mexe.
  return (
    <div className="my-4 grid gap-3">
      {/* O rótulo continua, escondido: o sr-only agora é do Tailwind. */}
      <label className="sr-only" htmlFor="busca">
        Buscar vaga
      </label>
      <input
        id="busca"
        type="search"
        placeholder="Buscar por título ou empresa"
        value={filtros.busca}
        // sem este onChange o campo não deixa digitar
        onChange={(e) => aoMudar("busca", e.target.value)}
        className="rounded-lg border border-borda-campo bg-superficie px-3 py-2.5"
      />

      {/* role="group" com nome: o leitor de tela diz "Filtrar por área,
          grupo" ao chegar nos chips — e não sete botões soltos. */}
      <div role="group" aria-label="Filtrar por área" className="flex flex-wrap gap-2">
        {opcoesDeArea.map((nome) => (
          <button
            key={nome}
            type="button"
            // Botão que liga e desliga é aria-pressed. O leitor de tela diz
            // "pressionado" no ligado — e o estilo sai do MESMO atributo.
            aria-pressed={nome === areaSelecionada}
            onClick={() => aoMudar("area", nome)}
            className="rounded-full border border-borda px-3 py-1.5 text-suave aria-pressed:border-principal aria-pressed:font-semibold aria-pressed:text-principal"
          >
            {nome || "Todas"}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm text-suave">
          Senioridade
          <select
            value={senioridadeSelecionada}
            onChange={(e) => aoMudar("senioridade", e.target.value)}
            className="min-w-0 rounded-lg border border-borda-campo bg-superficie px-3 py-2.5 text-principal"
          >
            {opcoesDeSenioridade.map((nome) => <option key={nome} value={nome}>{nome || "Todas"}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm text-suave">
          Aceita iniciante
          <select
            value={filtros.iniciante}
            onChange={(e) => aoMudar("iniciante", e.target.value)}
            className="min-w-0 rounded-lg border border-borda-campo bg-superficie px-3 py-2.5 text-principal"
          >
            <option value="">Todas as vagas</option>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        </label>
      </div>
      <div>
        <Botao variante="secundario" onClick={aoLimpar} disabled={!Object.values(filtros).some(Boolean)}>Limpar filtros</Botao>
      </div>
    </div>
  );
}
