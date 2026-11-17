import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const arquivo = fileURLToPath(new URL("../.env.local", import.meta.url));
let conteudo = existsSync(arquivo) ? readFileSync(arquivo, "utf8") : "";
if (!/^AUTH_SECRET\s*=\s*["']?[^\s"']+/m.test(conteudo)) {
  conteudo = conteudo.replace(/^AUTH_SECRET\s*=.*\r?\n?/gm, "");
  conteudo += `\nAUTH_SECRET="${randomBytes(32).toString("base64")}"\n`;
}
if (!/^AUTH_TRUST_HOST\s*=/m.test(conteudo)) conteudo += "AUTH_TRUST_HOST=true\n";
writeFileSync(arquivo, conteudo, { mode: 0o600 });
console.log("Ambiente local configurado. O segredo foi preservado ou gerado em .env.local (não é exibido).\nExecute npm run dev e abra http://localhost:3000.");
