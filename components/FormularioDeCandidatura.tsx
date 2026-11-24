"use client";

import { useActionState, useId } from "react";
import { enviarCandidatura } from "@/app/vagas/[id]/acoes";
import BotaoDeEnviar from "@/components/BotaoDeEnviar";
import { ESTADO_INICIAL } from "@/lib/tipos";
import type { Vaga } from "@/lib/tipos";

const HABILIDADES = ["HTML", "CSS", "JavaScript", "React", "SQL"];

/**
 * A candidatura, depois de quatro aulas:
 *
 * - aula 03: useState em tudo, e o dado morria nesta aba;
 * - aula 05: `action` em vez de `onSubmit` — o dado vai para o servidor, e o
 *   formulário funciona até com o JavaScript desligado;
 * - aula 07: nome e e-mail saíram — vêm da CONTA de quem está na sessão;
 * - aula 08: o fieldset, a legend e o erro ligado ao GRUPO.
 */
export default function FormularioDeCandidatura({ vaga }: { vaga: Vaga }) {
  const [estado, acaoDoForm, pendente] = useActionState(enviarCandidatura, ESTADO_INICIAL);
  const idDoErro = useId();

  // A tela de sucesso da aula 03 continua existindo. O que mudou é quem a
  // liga: era um useState local, agora é o `ok` que veio do servidor.
  if (estado.ok) {
    return (
      // role="status": quem não está olhando a tela ouve que deu certo.
      <div role="status" className="rounded-xl border border-sucesso bg-sucesso-fundo p-4 text-sucesso">
        <h3 className="m-0 font-semibold">Candidatura enviada</h3>
        <p className="mb-0">A {vaga.empresa} vai receber o seu contato.</p>
      </div>
    );
  }

  return (
    // noValidate: quem valida é a ação, em português e ligada ao campo.
    <form key={JSON.stringify(estado.valores)} action={acaoDoForm} aria-busy={pendente} className="grid max-w-xl gap-4" noValidate>
      {/* Campo escondido: a ação precisa saber de QUAL vaga é. Trocá-lo só
          faz a pessoa se candidatar a outra vaga pública — coisa que ela já
          podia fazer clicando. QUEM se candidata vem da sessão, nunca daqui. */}
      <input type="hidden" name="vagaId" value={vaga.id} />
      <p className="m-0 text-sm text-suave">
        Você se candidata com o nome e o e-mail da sua conta.
      </p>

      {/* O <fieldset> junta os cinco checkboxes, e a <legend> dá o nome do
          grupo: o leitor de tela diz "Habilidades, grupo" ao entrar. O erro é
          do GRUPO, não de um checkbox — por isso o aria-describedby mora aqui.
          Vários checkboxes com o MESMO name: do outro lado, getAll(). */}
      <fieldset
        aria-describedby={estado.erros.habilidades ? idDoErro : undefined}
        className="grid gap-2 rounded-xl border border-borda p-4"
      >
        <legend className="px-1 font-medium">Habilidades</legend>
        {HABILIDADES.map((h) => (
          <label key={h} className="flex w-fit items-center gap-2">
            <input
              type="checkbox"
              name="habilidades"
              value={h}
              defaultChecked={estado.valores.habilidades?.split(",").includes(h)}
              className="size-4 accent-principal"
            />
            {h}
          </label>
        ))}
      </fieldset>
      {estado.erros.habilidades && (
        <p id={idDoErro} className="m-0 text-sm text-erro">
          {estado.erros.habilidades}
        </p>
      )}

      <div>
        <BotaoDeEnviar>Enviar candidatura</BotaoDeEnviar>
      </div>
      {estado.mensagem && (
        <p role="alert" className="m-0 text-sm text-erro">
          {estado.mensagem}
        </p>
      )}
    </form>
  );
}
