import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { usuarioAtual, type Quem } from "@/lib/sessao";
import { buscarEmpresa, contarCandidaturas, listarArquivadasDoAutor, listarCandidaturasDe, listarVagasDoAutor } from "@/lib/api";
import BotaoDeEnviar from "@/components/BotaoDeEnviar";
import BotaoDeApagar from "@/components/BotaoDeApagar";
import { apagarConta, desistir, sair } from "./acoes";
import { apagar } from "@/app/vagas/[id]/editar/acoes";
import FormularioDeArquivar from "@/components/FormularioDeArquivar";
import type { Vaga } from "@/lib/tipos";

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
      <h2>Apagar a conta</h2>
      <p>A conta e suas candidaturas serão apagadas. Não tem volta. Se você publicou vagas, apague-as primeiro, inclusive as arquivadas.</p>
      <BotaoDeApagar acao={apagarConta} pergunta="Apagar a sua conta e todas as suas candidaturas? Não tem volta." enviando="Apagando…">
        Apagar a minha conta
      </BotaoDeApagar>
    </section>
  );
}

/* Frente 2 · o painel de quem publica: as vagas DELA, e não o mural inteiro. */
async function PainelDaEmpresa({ quem }: { quem: Quem }) {
  const [empresa, vagas, arquivadas] = await Promise.all([
    quem.empresaSlug ? buscarEmpresa(quem.empresaSlug) : undefined,
    listarVagasDoAutor(quem.id),
    listarArquivadasDoAutor(quem.id),
  ]);

  const contagens = new Map(await Promise.all([...vagas, ...arquivadas].map(async (vaga) =>
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
          {vagas.map((vaga) => <VagaDoPainel key={vaga.id} vaga={vaga} candidaturas={contagens.get(vaga.id) ?? 0} />)}
        </ul>
      )}
      <h2>Arquivadas</h2>
      {arquivadas.length === 0 ? <p>Nenhuma vaga arquivada.</p> : (
        <ul className="grid gap-3">
          {arquivadas.map((vaga) => <VagaDoPainel key={vaga.id} vaga={vaga} candidaturas={contagens.get(vaga.id) ?? 0} />)}
        </ul>
      )}
    </>
  );
}

function VagaDoPainel({ vaga, candidaturas }: { vaga: Vaga; candidaturas: number }) {
  const caminho = `/vagas/${encodeURIComponent(vaga.id)}`;
  return (
    <li className={`${CARTAO} p-4`}>
      <Link href={caminho} className="font-semibold">{vaga.titulo}</Link>
      <p className="text-sm text-suave">{candidaturas === 1 ? "1 candidatura" : `${candidaturas} candidaturas`}</p>
      <div className="flex flex-wrap items-start gap-3" role="group" aria-label={`Ações de ${vaga.titulo}`}>
        <Link href={`${caminho}/editar`} className="inline-flex px-4 py-2">Editar</Link>
        <FormularioDeArquivar id={vaga.id} arquivada={vaga.arquivada} />
        <BotaoDeApagar acao={apagar.bind(null, vaga.id)} pergunta={`Apagar “${vaga.titulo}”? As candidaturas dela vão junto. Não tem volta.`} enviando="Apagando…">
          Apagar
        </BotaoDeApagar>
      </div>
    </li>
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
              <div className="px-4 pb-4">
                <BotaoDeApagar acao={desistir.bind(null, c.id)} pergunta={`Desistir da candidatura${c.vaga ? ` a “${c.vaga.titulo}”` : ""}?`} enviando="Desistindo…">
                  Desistir
                </BotaoDeApagar>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
