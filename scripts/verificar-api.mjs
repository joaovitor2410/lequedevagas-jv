import assert from "node:assert/strict";
import { API, EQUIPE } from "../lib/configuracao.ts";

for (const caminho of ["/vagas", "/empresas", "/numeros"]) {
  const resposta = await fetch(`${API}${caminho}`, { signal: AbortSignal.timeout(15_000) });
  assert.equal(resposta.status, 200, `${caminho}: status inesperado`);
  const dado = await resposta.json();
  if (caminho === "/numeros") assert.equal(typeof dado.total, "number");
  else assert.ok(Array.isArray(dado));
  console.log(`OK ${EQUIPE}${caminho}`);
}
