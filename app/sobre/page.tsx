import type { Metadata } from "next";

// A metadata da página sobrescreve a do layout.
export const metadata: Metadata = {
  title: "Sobre · Leque de Vagas",
  description: "Projeto de João Victor Azevedo e Abraao Nerys para a disciplina Introdução ao Next.js, NickDev, 2026.2.",
};

export default function Sobre() {
  return (
    <section>
      <h1>Sobre o projeto</h1>
      <p>
        O Leque de Vagas é o projeto de João Victor Azevedo e Abraao Nerys
        para a disciplina Introdução ao Next.js, do NickDev, no semestre 2026.2.
        Nosso objetivo é facilitar a busca por oportunidades de entrada em tecnologia.
      </p>
      <p>
        Vagas, empresas, contas e candidaturas são compartilhadas pela API do
        curso. Assim, o site publicado e os computadores da equipe mostram os
        mesmos dados. Você pode explorar as empresas, encontrar oportunidades
        e acompanhar suas candidaturas na sua área.
      </p>
      <p>
        João Victor cuida das vagas e das empresas; Abraao cuida das contas,
        candidaturas, busca e números. Empresas podem publicar e administrar suas
        vagas. Candidatas podem encontrar oportunidades, se candidatar e desistir pelo painel.
      </p>
    </section>
  );
}
