import { readFileSync } from "node:fs";
import { API, EQUIPE } from "../lib/configuracao.ts";

// Importar substitui as vagas existentes. O operador confirma explicitamente no comando.
if (!process.argv.includes("--confirmar-substituicao")) {
  console.log(`Destino: ${EQUIPE}\nA importação substitui as vagas da equipe na API.\nConfira os arquivos dados/*.json e execute apenas se quiser substituir:\nnpm run dados:importar -- --confirmar-substituicao`);
  process.exit(0);
}
const carregar = (nome) => JSON.parse(readFileSync(new URL(`../dados/${nome}.json`, import.meta.url), "utf8"));
const resposta = await fetch(`${API}/importar`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ vagas: carregar("vagas"), empresas: carregar("empresas") }),
  signal: AbortSignal.timeout(30_000),
});
const resultado = await resposta.json();
console.log(JSON.stringify(resultado, null, 2));
if (!resposta.ok) process.exitCode = 1;
