import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { buscarVaga } from "@/lib/api";
import { podeEditarVaga } from "@/lib/permissoes";
import { usuarioAtual } from "@/lib/sessao";
import FormularioDeVaga from "@/components/FormularioDeVaga";
import BotaoDeApagar from "@/components/BotaoDeApagar";
import { apagar, editarVaga } from "./acoes";

export const metadata: Metadata = { title: "Editar vaga · Leque de Vagas" };

export default async function EditarVaga({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [quem, vaga] = await Promise.all([usuarioAtual(), buscarVaga(id, true)]);
  if (!quem) redirect("/entrar");
  if (!vaga) notFound();
  if (!podeEditarVaga(quem, vaga)) {
    return (
      <section>
        <h1>Editar a vaga</h1>
        <p>Só quem publicou esta vaga pode editar.</p>
        <Link href="/painel">← voltar ao painel</Link>
      </section>
    );
  }

  return (
    <section>
      <h1>Editar a vaga</h1>
      <p>Publicada pela <strong>{vaga.empresa}</strong>.</p>
      <FormularioDeVaga
        acao={editarVaga.bind(null, vaga.id)}
        vaga={vaga}
        botao="Salvar alterações"
        enviando="Salvando…"
      />
      <h2>Apagar a vaga</h2>
      <p>A vaga e suas candidaturas serão apagadas. Não tem volta. Para encerrar as inscrições e manter o histórico, arquive pelo painel.</p>
      <BotaoDeApagar
        acao={apagar.bind(null, vaga.id)}
        pergunta={`Apagar “${vaga.titulo}”? As candidaturas dela vão junto. Não tem volta.`}
        enviando="Apagando…"
      >
        Apagar a vaga
      </BotaoDeApagar>
      <p><Link href="/painel">← voltar ao painel</Link></p>
    </section>
  );
}
