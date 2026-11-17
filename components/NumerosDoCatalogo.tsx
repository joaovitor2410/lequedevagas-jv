import { buscarNumeros } from "@/lib/api";

/**
 * A REGRA QUE ECONOMIZA UMA HORA (aula 04): quem espera é este componente, e
 * o `await` mora AQUI DENTRO. Se a página fizesse o await e passasse o
 * número por prop, o `<Suspense>` em volta não teria mais nada a cobrir.
 *
 * A API conta as vagas abertas; publicar e arquivar expiram a etiqueta
 * "vagas", que também cobre estes números.
 */
export default async function NumerosDoCatalogo() {
  const { total, aceitamIniciante } = await buscarNumeros();

  return (
    <p className="text-sm text-suave">
      <strong>{total}</strong> vagas abertas · <strong>{aceitamIniciante}</strong> aceitam quem está
      começando
    </p>
  );
}
