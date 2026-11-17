import type { Metadata } from "next";

// A metadata da página sobrescreve a do layout.
export const metadata: Metadata = {
  title: "Sobre · Leque de Vagas",
};

export default function Sobre() {
  return (
    <section>
      <h1>Sobre o projeto</h1>
      <p>
        Este é o projeto de referência do curso Introdução ao Next.js. Ele
        cresce junto com as aulas: a cada semana entra o recurso que foi
        ensinado, e nada além dele.
      </p>
      <p>
        Vagas, empresas, contas e candidaturas são compartilhadas pela API do
        curso. Assim, o site publicado e os computadores da equipe mostram os
        mesmos dados. Você pode explorar as empresas, encontrar oportunidades
        e acompanhar suas candidaturas na sua área.
      </p>
      <p>
        Toda escrita é uma Server Action que valida com Zod (aula 05) e
        pergunta quem está chamando antes de fazer qualquer coisa (aula 07). E
        o estilo mora junto de cada componente, com cores de nome de função que
        valem nos temas claro e escuro (aula 08).
      </p>
    </section>
  );
}
