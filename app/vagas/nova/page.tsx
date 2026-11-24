import type { Metadata } from "next";
import Link from "next/link";
import { buscarEmpresa } from "@/lib/api";
import { podePublicar } from "@/lib/permissoes";
import { usuarioAtual } from "@/lib/sessao";
import FormularioDeVaga from "@/components/FormularioDeVaga";
import { criarVaga } from "./acoes";

export const metadata: Metadata = { title: "Publicar vaga · Leque de Vagas" };

/**
 * A página é servidor; só o formulário é cliente. Ela lê a sessão, então é
 * ƒ — e tudo bem: um formulário de publicar já é de uma pessoa só.
 */
export default async function PublicarVaga() {
  /* A TELA pergunta a regra para decidir o que desenhar. É CONVENIÊNCIA:
     poupa a candidata de preencher um formulário que vai ser recusado. A
     tranca é a mesma regra, dentro da ação (aula 07, LAB 4). */
  const quem = await usuarioAtual();

  if (!podePublicar(quem)) {
    return (
      <section>
        <h1>Publicar uma vaga</h1>
        <p>Só quem publica por uma empresa pode abrir vaga aqui.</p>
        <p>
          <Link href="/vagas">← todas as vagas</Link>
        </p>
      </section>
    );
  }

  // A empresa é a da sessão: a página só mostra por qual se publica.
  const empresa = await buscarEmpresa(quem.empresaSlug);

  return (
    <section>
      <h1>Publicar uma vaga</h1>
      <p className="text-suave">
        Publicando pela <strong className="text-principal">{empresa?.nome ?? quem.empresaSlug}</strong>.
      </p>
      <FormularioDeVaga acao={criarVaga} botao="Publicar vaga" enviando="Publicando…" />
    </section>
  );
}
