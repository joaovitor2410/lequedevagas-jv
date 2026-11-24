"use client"; // useActionState é hook: exige cliente

import { useActionState, useId } from "react";
import BotaoDeEnviar from "@/components/BotaoDeEnviar";
import Campo from "@/components/ui/Campo";
import AreaDeTexto from "@/components/ui/AreaDeTexto";
import { ESTADO_INICIAL, type Estado, type Vaga } from "@/lib/tipos";

type Props = {
  acao: (estadoAnterior: Estado, dados: FormData) => Promise<Estado>;
  vaga?: Vaga;
  botao: string;
  enviando: string;
};

/**
 * Os campos são NÃO CONTROLADOS: `defaultValue`, e não `value` — com Server
 * Actions é o <form> que sabe o que tem dentro dele. O defaultValue vem do
 * estado, para uma recusa devolver o que a pessoa tinha digitado.
 *
 * Aula 07: o <select> de empresa saiu. Por qual empresa se publica vem da
 * sessão, e um campo "só para mostrar" convidaria alguém a achar que manda.
 */
export default function FormularioDeVaga({ acao, vaga, botao, enviando }: Props) {
  const [estado, acaoDoForm, pendente] = useActionState(acao, ESTADO_INICIAL);
  const { erros } = estado;
  const idDoErro = useId();
  const valores = estado === ESTADO_INICIAL ? valoresDa(vaga) : estado.valores;

  return (
    // noValidate: quem valida é a ação. Sem ele, o navegador mostra o balão
    // dele, em outra língua e sem o aria-describedby.
    <form key={JSON.stringify(valores)} action={acaoDoForm} aria-busy={pendente} className="grid max-w-xl gap-4" noValidate>
      <Campo rotulo="Título" name="titulo" defaultValue={valores.titulo} erro={erros.titulo} />
      <Campo rotulo="Área" name="area" defaultValue={valores.area} erro={erros.area} />
      <Campo
        rotulo="Senioridade"
        name="senioridade"
        defaultValue={valores.senioridade}
        erro={erros.senioridade}
      />
      <Campo rotulo="Local" name="local" defaultValue={valores.local} erro={erros.local} />
      <AreaDeTexto
        rotulo="Descrição"
        name="descricao"
        defaultValue={valores.descricao}
        erro={erros.descricao}
      />
      {/* O <label> em volta do checkbox: clicar no texto marca a caixa. */}
      <label className="flex w-fit items-center gap-2">
        <input
          type="checkbox"
          name="aceitaIniciante"
          defaultChecked={valores.aceitaIniciante === "on"}
          aria-invalid={erros.aceitaIniciante ? true : undefined}
          aria-describedby={erros.aceitaIniciante ? idDoErro : undefined}
          className="size-4 accent-principal"
        />
        Aceita quem está começando
      </label>
      {erros.aceitaIniciante && <p id={idDoErro} className="m-0 text-sm text-erro">{erros.aceitaIniciante}</p>}
      <div>
        <BotaoDeEnviar enviando={enviando}>{botao}</BotaoDeEnviar>
      </div>
      {/* A recusa que não é de campo nenhum — "você não pode publicar". */}
      {estado.mensagem && (
        <p role="alert" className="m-0 text-sm text-erro">
          {estado.mensagem}
        </p>
      )}
    </form>
  );
}

function valoresDa(vaga?: Vaga): Record<string, string> {
  if (!vaga) return {};
  return {
    titulo: vaga.titulo,
    area: vaga.area,
    senioridade: vaga.senioridade,
    local: vaga.local,
    descricao: vaga.descricao,
    ...(vaga.aceitaIniciante ? { aceitaIniciante: "on" } : {}),
  };
}
