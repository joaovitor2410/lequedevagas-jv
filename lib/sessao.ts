import { cache } from "react";
import { auth } from "@/auth";
import { buscarPessoa } from "@/lib/api";

/* QUEM ESTÁ AÍ? O crachá diz o id; a API diz o resto. O `cache` do React faz
   a pergunta UMA vez por pedido, por mais que perguntem. */
export const usuarioAtual = cache(async () => {
  const sessao = await auth();
  const id = sessao?.user?.id;
  if (!id) return null;
  return buscarPessoa(id);
});

/** O que o `usuarioAtual()` devolve quando alguém entrou. */
export type Quem = NonNullable<Awaited<ReturnType<typeof usuarioAtual>>>;