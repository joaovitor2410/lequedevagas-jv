import { Suspense } from "react";
import type { Metadata } from "next";
import { listarVagas } from "@/lib/api";
import MuralDeVagas from "@/components/MuralDeVagas";
import NumerosDoCatalogo from "@/components/NumerosDoCatalogo";
import NumerosEsqueleto from "@/components/NumerosEsqueleto";
import ListaEsqueleto from "@/components/ListaEsqueleto";

export const metadata: Metadata = {
  title: "Vagas · Leque de Vagas",
  description: "Encontre vagas de tecnologia por área, senioridade e aceitação de iniciantes. Compartilhe seus filtros pelo link.",
};

/**
 * Repare no que ESTA página não é: `async`.
 *
 * Se ela fosse, esperaria antes de mandar qualquer coisa — e aí nem o `<h1>`
 * chegaria cedo. Quem busca são os filhos, cada um dentro do seu `<Suspense>`,
 * e por isso o título aparece na hora enquanto os dois blocos ficam prontos
 * cada um no seu tempo. São dois `<Suspense>` de propósito: com um só, o bloco
 * mais lento seguraria o outro.
 */
export default function Vagas() {
  return (
    <>
      <h1>Vagas</h1>

      <Suspense fallback={<NumerosEsqueleto />}>
        <NumerosDoCatalogo />
      </Suspense>

      <Suspense fallback={<ListaEsqueleto />}>
        <ListagemDeVagas />
      </Suspense>
    </>
  );
}

/**
 * O componente que embrulha o mural da aula 03: ele busca, o mural filtra.
 *
 * O MuralDeVagas continua sendo de CLIENTE e continua com os filtros no
 * endereço — a lista filtrada e a contagem continuam derivadas. A API só é
 * consultada no servidor; o componente recebe a lista por prop.
 */
async function ListagemDeVagas() {
  const vagas = await listarVagas();
  return <MuralDeVagas vagas={vagas} />;
}
