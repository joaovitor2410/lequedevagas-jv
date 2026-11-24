// app/(institucional)/privacidade/page.tsx  →  /privacidade
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacidade · Leque de Vagas" };

export default function Privacidade() {
  return (
    <>
      <h1>Política de privacidade</h1>
      <p>Texto de exemplo do projeto da disciplina.</p>
      <p>
        Este é um ambiente de estudos. Nome, e-mail, vagas e candidaturas são
        enviados por HTTPS à API didática do curso. A API guarda o hash da
        senha, e não a senha original. Use dados fictícios e uma senha
        exclusiva para este exercício.
      </p>
      <p>
        O login usa um cookie cifrado que o JavaScript da página não consegue
        ler. Ele identifica a conta; as permissões são consultadas na API a
        cada pedido. Os endpoints diretos dessa API são públicos, por isso
        este ambiente não deve receber informações pessoais reais.
      </p>
      <p>
        Você pode desistir de uma candidatura ou apagar a própria conta na sua área.
        Apagar a conta também apaga as suas candidaturas. Quem publicou vagas precisa
        apagá-las antes de excluir a conta.
      </p>
    </>
  );
}
