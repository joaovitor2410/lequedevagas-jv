// app/(institucional)/termos/page.tsx  →  /termos
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Termos de uso · Leque de Vagas" };

export default function Termos() {
  return (
    <>
      <h1>Termos de uso</h1>
      <p>Texto de exemplo do projeto da disciplina.</p>
    </>
  );
}
