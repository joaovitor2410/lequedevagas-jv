import { cache } from "react";
import { auth } from "@/auth";
import { buscarPessoa } from "@/lib/api";

/** O cookie guarda só o id. A API confirma conta e permissões a cada pedido. */
export const usuarioAtual = cache(async () => {
  const sessao = await auth();
  const id = sessao?.user?.id;
  return id ? buscarPessoa(id) : null;
});

export type Quem = NonNullable<Awaited<ReturnType<typeof usuarioAtual>>>;
