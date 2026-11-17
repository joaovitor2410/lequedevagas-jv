// SEM "use client" — e é a página que usa MAIS componentes de cliente.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buscarVaga, contarCandidaturas, listarVagas } from "@/lib/api";
import BotaoCopiarLink from "@/components/BotaoCopiarLink";
import DescricaoDaVaga from "@/components/DescricaoDaVaga";
import FormularioDeCandidatura from "@/components/FormularioDeCandidatura";

// Desde o Next 15, `params` é uma Promise. É por isso que ele leva `await`.
type Props = { params: Promise<{ id: string }> };

/* ─── A LISTA DO QUE PRÉ-GERAR ─────────────────────────────────────────────
   O Next não tem como adivinhar QUAIS ids existem: esta função conta, e roda
   UMA vez, no build. A chave tem que se chamar `id`, igual ao nome da pasta,
   e o valor tem que ser TEXTO. Vaga publicada depois do build é gerada na
   primeira visita, e guardada. */
export async function generateStaticParams() {
  const vagas = await listarVagas();
  return vagas.map((vaga) => ({ id: String(vaga.id) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const vaga = await buscarVaga(id);

  // Aqui NÃO se chama notFound(): quem decide isso é a página.
  if (!vaga) return { title: "Vaga não encontrada · Leque de Vagas" };

  return {
    title: `${vaga.titulo} · ${vaga.empresa}`,
    description: vaga.descricao.slice(0, 150),
  };
}

export default async function PaginaDaVaga({ params }: Props) {
  const { id } = await params;
  const vaga = await buscarVaga(id);

  /* O id que não existe. notFound() interrompe a
     renderização e entrega o not-found.tsx desta pasta. */
  if (!vaga) notFound();

  /* Repare no que esta página NÃO faz: ler a sessão. Ela é igual para todo
     mundo e continua pré-gerada (●). Quem pergunta "quem é você?" é a ação
     da candidatura, a cada envio (aula 07). */
  const candidaturas = vaga.arquivada ? 0 : await contarCandidaturas(id);

  return (
    <article>
      {/* Título e ficha vêm prontos do servidor. Não mudam depois. */}
      <h1>{vaga.titulo}</h1>
      <p className="text-suave">
        <Link href={`/empresas/${vaga.empresaSlug}`} className="text-principal">
          {vaga.empresa}
        </Link>
        {" · "}
        {vaga.area} · {vaga.senioridade} · {vaga.local}
      </p>

      {/* Os mesmos tokens do selo do CardDeVaga: verde é "sucesso". */}
      {vaga.aceitaIniciante && (
        <p className="w-fit rounded-full bg-sucesso-fundo px-3 py-1 text-sm font-medium text-sucesso">
          Aceita quem está começando
        </p>
      )}

      {/* Componentes de cliente lado a lado. Cada um tem a própria memória,
          e nenhum sabe do outro. */}
      <BotaoCopiarLink titulo={vaga.titulo} />
      <DescricaoDaVaga texto={vaga.descricao} />

      <h2>Candidatar-se</h2>
      {!vaga.arquivada ? (
        <>
          {/* A contagem vem das candidaturas registradas na API. */}
          <p className="text-sm text-suave">
            {candidaturas === 1
              ? "1 candidatura pelo site até agora."
              : `${candidaturas} candidaturas pelo site até agora.`}{" "}
            Para se candidatar, <Link href="/entrar">entre</Link> com uma conta de candidata
            — ou <Link href="/cadastro">crie a sua</Link>.
          </p>
          <FormularioDeCandidatura vaga={vaga} />
        </>
      ) : (
        <p role="status" className="text-suave">
          Esta vaga foi arquivada e não recebe mais candidaturas.
        </p>
      )}

      <p>
        <Link href="/vagas">← todas as vagas</Link>
      </p>
    </article>
  );
}
