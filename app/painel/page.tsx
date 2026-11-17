import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { usuarioAtual, type Quem } from "@/lib/sessao";
import { buscarEmpresa, contarCandidaturas, listarCandidaturasDe, listarVagasDoAutor } from "@/lib/api";
import BotaoDeEnviar from "@/components/BotaoDeEnviar";
import { sair } from "./acoes";
import FormularioDeArquivar from "@/components/FormularioDeArquivar";

export const metadata: Metadata = { title: "Minha área · Leque de Vagas" };

// O mesmo desenho do CardDeVaga: quem já viu o mural reconhece.
const CARTAO = "rounded-xl border border-borda transition-colors hover:border-borda-campo";
const LINK_DO_CARTAO = "block px-4 py-3.5 no-underline";

/**
 * A página que é de uma pessoa só — a única do site que lê a sessão para
 * DESENHAR. Ela é ƒ, e isso não custa nada às outras (aula 07, LAB 3).
 */
export default async function Painel() {
  const quem = await usuarioAtual();

  /* O proxy já mandou para /entrar quem não tem crachá. Isto cobre o outro
     caso: crachá válido de alguém que não existe mais na API. */
  if (!quem) redirect("/entrar");

  return (
    <section>
      <h1>Olá, {quem.nome}</h1>
      {quem.papel === "empresa" ? (
        <PainelDaEmpresa quem={quem} />
      ) : (
        <PainelDaCandidata quem={quem} />
      )}
      {/* Secundário: botão primário é um por tela, e aqui quem manda é o
          conteúdo. */}
      <form action={sair} className="mt-8">
        <BotaoDeEnviar variante="secundario" enviando="Saindo…">
          Sair
        </BotaoDeEnviar>
      </form>
    </section>
  );
}

/* Frente 2 · o painel de quem publica: as vagas DELA, e não o mural inteiro. */
async function PainelDaEmpresa({ quem }: { quem: Quem }) {
  const [empresa, vagas] = await Promise.all([
    quem.empresaSlug ? buscarEmpresa(quem.empresaSlug) : undefined,
    listarVagasDoAutor(quem.id),
  ]);

  const contagens = new Map(await Promise.all(vagas.map(async (vaga) =>
    [vaga.id, await contarCandidaturas(vaga.id)] as const,
  )));

  return (
    <>
      <p className="text-sm text-suave">
        Você publica pela {empresa?.nome ?? quem.empresaSlug} ·{" "}
        <Link href={`/empresas/${quem.empresaSlug}/editar`} className="text-principal">
          editar o perfil
        </Link>
        {" · "}
        <Link href="/vagas/nova" className="text-principal">
          publicar uma vaga
        </Link>
      </p>

      <h2>Suas vagas</h2>
      {vagas.length === 0 ? (
        <p>
          Nenhuma vaga publicada por você. <Link href="/vagas/nova">Publicar a primeira</Link>
        </p>
      ) : (
        <ul className="grid gap-3">
          {vagas.map((vaga) => (
            <li
              key={vaga.id}
              className={`${CARTAO} flex flex-wrap items-center justify-between gap-2 pr-4`}
            >
              <Link href={`/vagas/${vaga.id}`} className={LINK_DO_CARTAO}>
                <span className="font-semibold">{vaga.titulo}</span>
                {/* Plural é conta, como o número do mural. */}
                <span className="block text-sm text-suave">
                  {contagens.get(vaga.id) === 1
                    ? "1 candidatura"
                    : `${contagens.get(vaga.id)} candidaturas`}
                </span>
              </Link>

              {/* Frente 4 · o botão mora AQUI, e não no mural: o mural é
                  igual para todo mundo (○), e o botão é de uma pessoa só. O
                  id vai escondido — ele diz QUAL vaga, nunca SE pode. */}
              <FormularioDeArquivar id={vaga.id} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/* Frente 3 · o painel de quem se candidata: as candidaturas DELA. */
async function PainelDaCandidata({ quem }: { quem: Quem }) {
  const candidaturas = await listarCandidaturasDe(quem.id);

  return (
    <>
      <h2>Suas candidaturas</h2>
      {candidaturas.length === 0 ? (
        <p>
          Nenhuma ainda. <Link href="/vagas">Ver as vagas</Link>
        </p>
      ) : (
        <ul className="grid gap-3">
          {candidaturas.map((c) => (
            <li key={c.id} className={CARTAO}>
              {c.vaga ? (
                <Link href={`/vagas/${c.vaga.id}`} className={LINK_DO_CARTAO}>
                  <span className="font-semibold">{c.vaga.titulo}</span>
                  <span className="block text-sm text-suave">
                    {c.vaga.empresa} · enviada em {new Date(c.enviadaEm).toLocaleDateString("pt-BR", { timeZone: "America/Fortaleza" })}
                  </span>
                </Link>
              ) : (
                <p className="px-4 py-3.5 text-suave">Vaga indisponível · candidatura enviada em {new Date(c.enviadaEm).toLocaleDateString("pt-BR", { timeZone: "America/Fortaleza" })}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
