import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * O proxy (era `middleware.ts` até o Next 15) roda ANTES da página.
 *
 * `pedido.auth` não é "existe um cookie": é o conteúdo do cookie ABERTO com o
 * AUTH_SECRET. Um cookie inventado não abre — e aí `pedido.auth` é null.
 *
 * Ele é um ATALHO, não a tranca: devolve para /entrar quem nem entrou, sem
 * gastar uma renderização. Quem decide quem pode o quê é a ação, que
 * pergunta de novo a cada envio (lib/permissoes.ts).
 */
export default auth((pedido) => {
  if (!pedido.auth) {
    return NextResponse.redirect(new URL("/entrar", pedido.nextUrl));
  }
});

// Só as páginas que já são de uma pessoa. Mural, vaga e empresa ficam de
// fora — e continuam pré-geradas.
export const config = {
  matcher: ["/vagas/nova", "/vagas/:id/editar", "/painel", "/empresas/:slug/editar"],
};
