import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";
import { AuthError, CredentialsSignin } from "next-auth";
import { ESTADO_INICIAL } from "../lib/tipos";
import type { Pessoa, Vaga } from "../lib/tipos";

const ana: Pessoa = { id: "ana", nome: "Ana", email: "ana@exemplo.com", papel: "empresa", empresaSlug: "aurora-tech" };
const bruno: Pessoa = { ...ana, id: "bruno", empresaSlug: "nuvem-rosa" };
const carla: Pessoa = { id: "carla", nome: "Carla", email: "carla@exemplo.com", papel: "candidata", empresaSlug: null };
const vaga: Vaga = { id: "1", titulo: "Pessoa Front-end Júnior", empresa: "Aurora Tech", empresaSlug: "aurora-tech", area: "Front-end", senioridade: "Júnior", local: "Remoto", aceitaIniciante: true, descricao: "x".repeat(80), publicadaEm: "2026-11-24T12:00:00Z", arquivada: false, autorId: "ana" };

let quem: Pessoa | null = ana;
let erroDoLogin: Error | null = null;
const etiquetas: string[] = [];
const saidas: unknown[] = [];
const pedidos: { url: string; opcoes: RequestInit }[] = [];
const fetchOriginal = globalThis.fetch;

// Só cookie e primitivas do Next são simulados. A ação e a integração HTTP são reais.
mock.module("../lib/sessao.ts", { namedExports: { usuarioAtual: async () => quem } });
mock.module("next/cache", { namedExports: { updateTag: (tag: string) => etiquetas.push(tag) } });
mock.module("next/navigation", { namedExports: { redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); } } });
mock.module("../auth.ts", { namedExports: {
  signOut: async (opcoes: unknown) => { saidas.push(opcoes); },
  signIn: async () => { if (erroDoLogin) throw erroDoLogin; throw new Error("REDIRECT:/painel"); },
} });

const { editarVaga, apagar } = await import("../app/vagas/[id]/editar/acoes");
const { arquivar, desarquivar } = await import("../app/vagas/acoes");
const { apagarConta, desistir } = await import("../app/painel/acoes");
const { criarVaga } = await import("../app/vagas/nova/acoes");
const { enviarCandidatura } = await import("../app/vagas/[id]/acoes");
const { salvarEmpresa } = await import("../app/empresas/[slug]/editar/acoes");
const { entrar } = await import("../app/entrar/acoes");

function backend(responder: (url: string, opcoes: RequestInit) => { status: number; dado?: unknown }) {
  globalThis.fetch = (async (url, opcoes = {}) => {
    pedidos.push({ url: String(url), opcoes });
    const { status, dado } = responder(String(url), opcoes);
    return new Response(status === 204 ? null : JSON.stringify(dado ?? {}), { status, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
}

function formulario(): FormData {
  const dados = new FormData();
  for (const campo of ["titulo", "area", "senioridade", "local", "descricao"] as const) dados.set(campo, vaga[campo]);
  return dados;
}

beforeEach(() => {
  quem = ana;
  erroDoLogin = null;
  etiquetas.length = 0;
  saidas.length = 0;
  pedidos.length = 0;
  backend(() => ({ status: 200, dado: vaga }));
});
afterEach(() => { globalThis.fetch = fetchOriginal; });

test("ações recusam editar/apagar/arquivar/desarquivar com sessão de outra pessoa ou sem sessão", async () => {
  for (const pessoa of [bruno, carla, null]) {
    quem = pessoa;
    const dados = formulario();
    dados.set("id", "1");
    assert.equal((await editarVaga("1", ESTADO_INICIAL, dados)).ok, false);
    assert.equal((await apagar("1")).ok, false);
    assert.equal((await arquivar(ESTADO_INICIAL, dados)).ok, false);
    assert.equal((await desarquivar(ESTADO_INICIAL, dados)).ok, false);
  }
  assert.ok(pedidos.every((p) => !p.opcoes.method));
  assert.ok(pedidos.every((p) => p.opcoes.cache === "no-store"));
  assert.deepEqual(etiquetas, []);
});

test("edição ignora autoria, empresa, data, situação e id injetados e envia checkbox desmarcado como false", async () => {
  const dados = formulario();
  for (const campo of ["autorId", "empresaSlug", "publicadaEm", "id", "arquivada"]) dados.set(campo, "injetado");
  await assert.rejects(() => editarVaga("1", ESTADO_INICIAL, dados), /REDIRECT:\/vagas\/1/);
  const escrita = pedidos.find((p) => p.opcoes.method === "PUT");
  assert.ok(escrita);
  const corpo = JSON.parse(String(escrita.opcoes.body));
  assert.equal(corpo.empresaSlug, "aurora-tech");
  assert.equal(corpo.aceitaIniciante, false);
  for (const campo of ["autorId", "publicadaEm", "id", "arquivada"]) assert.equal(campo in corpo, false);
  assert.deepEqual(etiquetas, ["vagas", "candidaturas"]);
});

test("recusa da edição mantém textos e checkbox sem invalidar cache", async () => {
  backend((_url, opcoes) => opcoes.method ? { status: 409, dado: { erro: "Conflito da API", campos: { titulo: "Corrija" } } } : { status: 200, dado: vaga });
  const dados = formulario();
  dados.set("aceitaIniciante", "on");
  const estado = await editarVaga("1", ESTADO_INICIAL, dados);
  assert.equal(estado.mensagem, "Conflito da API");
  assert.equal(estado.erros.titulo, "Corrija");
  assert.equal(estado.valores.aceitaIniciante, "on");
  assert.equal(estado.valores.titulo, vaga.titulo);
  assert.deepEqual(etiquetas, []);
});

test("edição local inválida e vaga removida não fazem PUT", async () => {
  const dados = formulario();
  dados.set("descricao", "Curta");
  assert.ok((await editarVaga("1", ESTADO_INICIAL, dados)).erros.descricao);
  backend(() => ({ status: 404 }));
  assert.match((await editarVaga("1", ESTADO_INICIAL, dados)).mensagem ?? "", /não existe/);
  assert.ok(pedidos.every((p) => !p.opcoes.method));
});

test("apagar vaga só redireciona e invalida vagas e candidaturas após o 204", async () => {
  backend((_url, opcoes) => opcoes.method ? { status: 204 } : { status: 200, dado: vaga });
  await assert.rejects(() => apagar("1"), /REDIRECT:\/painel/);
  assert.equal(pedidos.at(-1)?.opcoes.method, "DELETE");
  assert.deepEqual(etiquetas, ["vagas", "candidaturas"]);
});

test("arquivar e desarquivar mudam apenas a situação e notificam vagas", async () => {
  const dados = new FormData();
  dados.set("id", "1");
  assert.equal((await arquivar(ESTADO_INICIAL, dados)).ok, true);
  assert.equal((await desarquivar(ESTADO_INICIAL, dados)).ok, true);
  assert.deepEqual(pedidos.filter((p) => p.opcoes.method === "PATCH").map((p) => JSON.parse(String(p.opcoes.body))), [{ arquivada: true }, { arquivada: false }]);
  assert.deepEqual(etiquetas, ["vagas", "vagas"]);
});

test("desistir confere a candidatura atual e recusa a troca de conta entre abas", async () => {
  backend((_url, opcoes) => opcoes.method ? { status: 204 } : { status: 200, dado: { id: "c1", pessoaId: "carla" } });
  quem = { ...carla, id: "outra" };
  assert.equal((await desistir("c1")).ok, false);
  assert.equal(pedidos.some((p) => p.opcoes.method === "DELETE"), false);
  quem = carla;
  assert.equal((await desistir("c1")).ok, true);
  assert.ok(pedidos.at(-1)?.url.endsWith("/candidaturas/c1"));
  assert.deepEqual(etiquetas, ["candidaturas"]);
});

test("apagar conta usa exclusivamente a identidade da sessão e encerra a sessão após o 204", async () => {
  quem = carla;
  backend(() => ({ status: 204 }));
  assert.equal((await apagarConta()).ok, true);
  assert.ok(pedidos[0].url.endsWith("/pessoas/carla"));
  assert.deepEqual(saidas, [{ redirectTo: "/" }]);
  assert.deepEqual(etiquetas, ["candidaturas"]);
});

test("apagar conta sem sessão ou com vagas não apaga nem encerra a sessão", async () => {
  quem = null;
  assert.equal((await apagarConta()).ok, false);
  assert.equal(pedidos.length, 0);
  quem = ana;
  backend(() => ({ status: 409, dado: { erro: "Apague as vagas antes." } }));
  assert.equal((await apagarConta()).mensagem, "Apague as vagas antes.");
  assert.deepEqual(saidas, []);
  assert.deepEqual(etiquetas, []);
});

test("503 na escrita sobe para error.tsx sem sucesso ou invalidação", async () => {
  backend((_url, opcoes) => opcoes.method ? { status: 503 } : { status: 200, dado: vaga });
  await assert.rejects(() => editarVaga("1", ESTADO_INICIAL, formulario()), /503/);
  await assert.rejects(() => apagar("1"), /503/);
  await assert.rejects(apagarConta, /503/);
  assert.deepEqual(etiquetas, []);
  assert.deepEqual(saidas, []);
});

test("publicação e candidatura usam a identidade da sessão apesar de campos injetados", async () => {
  const dados = formulario();
  dados.set("empresaSlug", "nuvem-rosa");
  dados.set("autorId", "bruno");
  await assert.rejects(() => criarVaga(ESTADO_INICIAL, dados), /REDIRECT:\/vagas\/1/);
  const publicacao = JSON.parse(String(pedidos[0].opcoes.body));
  assert.equal(publicacao.autorId, "ana");
  assert.equal(publicacao.empresaSlug, "aurora-tech");
  quem = carla;
  dados.set("vagaId", "1");
  dados.set("nome", "Outra pessoa");
  dados.set("email", "outra@exemplo.com");
  dados.set("pessoaId", "outra");
  dados.append("habilidades", "React");
  assert.equal((await enviarCandidatura(ESTADO_INICIAL, dados)).ok, true);
  const candidatura = JSON.parse(String(pedidos.at(-1)?.opcoes.body));
  assert.equal(candidatura.pessoaId, "carla");
  assert.equal(candidatura.nome, "Carla");
  assert.equal(candidatura.email, "carla@exemplo.com");
});

test("salvar perfil recusa empresa alheia e confirma sucesso com as etiquetas corretas", async () => {
  const dados = new FormData();
  dados.set("nome", "Aurora Tech");
  dados.set("sobre", "x".repeat(40));
  dados.set("site", "https://exemplo.com");
  quem = bruno;
  assert.equal((await salvarEmpresa("aurora-tech", ESTADO_INICIAL, dados)).ok, false);
  assert.equal(pedidos.length, 0);
  quem = ana;
  assert.equal((await salvarEmpresa("aurora-tech", ESTADO_INICIAL, dados)).mensagem, "Perfil salvo.");
  assert.deepEqual(etiquetas, ["empresas", "vagas"]);
});

test("login distingue credencial inválida de falha técnica e não engole redirect nem devolve senha", async () => {
  const dados = new FormData();
  dados.set("email", "ana@exemplo.com");
  dados.set("senha", "somente-teste");
  erroDoLogin = new CredentialsSignin();
  const estado = await entrar(ESTADO_INICIAL, dados);
  assert.equal(estado.mensagem, "E-mail ou senha não conferem.");
  assert.equal(estado.valores.senha, undefined);
  erroDoLogin = new AuthError("Falha técnica");
  await assert.rejects(() => entrar(ESTADO_INICIAL, dados), AuthError);
  erroDoLogin = null;
  await assert.rejects(() => entrar(ESTADO_INICIAL, dados), /REDIRECT:\/painel/);
});
