"use client";

import { useActionState } from "react";
import { salvarEmpresa } from "./acoes";
import BotaoDeEnviar from "@/components/BotaoDeEnviar";
import Campo from "@/components/ui/Campo";
import AreaDeTexto from "@/components/ui/AreaDeTexto";
import { ESTADO_INICIAL } from "@/lib/tipos";
import type { Empresa } from "@/lib/tipos";

export default function FormularioDaEmpresa({ empresa }: { empresa: Empresa }) {
  // .bind prende o slug como PRIMEIRO argumento da ação. Ele viaja junto,
  // mas não como campo do formulário — não dá para trocá-lo pelo HTML.
  const acaoComSlug = salvarEmpresa.bind(null, empresa.slug);
  const [estado, acaoDoForm, pendente] = useActionState(acaoComSlug, ESTADO_INICIAL);
  const { valores, erros } = estado;

  return (
    <form key={JSON.stringify(valores)} action={acaoDoForm} aria-busy={pendente} className="grid max-w-xl gap-4" noValidate>
      {/* O ?? garante que o primeiro carregamento mostre o valor atual, e
          uma recusa devolva o que a pessoa tinha acabado de digitar. O slug
          não aparece: ele não é editável. */}
      <Campo rotulo="Nome" name="nome" defaultValue={valores.nome ?? empresa.nome} erro={erros.nome} />
      <AreaDeTexto
        rotulo="Sobre"
        name="sobre"
        defaultValue={valores.sobre ?? empresa.sobre}
        erro={erros.sobre}
      />
      <Campo
        rotulo="Site"
        name="site"
        type="url"
        defaultValue={valores.site ?? empresa.site}
        erro={erros.site}
      />
      <div>
        <BotaoDeEnviar enviando="Salvando…">Salvar</BotaoDeEnviar>
      </div>
      {/* O recado geral. Salvou: verde e role="status" — quem não está
          olhando a tela precisa saber que salvou. Recusou: vermelho. */}
      {estado.mensagem && (
        <p role="status" className={`m-0 text-sm ${estado.ok ? "text-sucesso" : "text-erro"}`}>
          {estado.mensagem}
        </p>
      )}
    </form>
  );
}
