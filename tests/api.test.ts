import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  apagarCandidatura, apagarPessoa, apagarVaga, arquivarVaga, buscarCandidatura, buscarEmpresa, buscarPessoa, buscarVaga, conferirLogin,
  contarCandidaturas, guardarCandidatura, guardarEmpresa, guardarPessoa,
  guardarVaga, listarArquivadasDoAutor, listarCandidaturasDe, listarVagas, listarVagasDoAutor, buscarNumeros, trocarVaga, desarquivarVaga,
} from "../lib/api";
import { API } from "../lib/configuracao";

const fetchOriginal = globalThis.fetch;
afterEach(() => { globalThis.fetch = fetchOriginal; });
function responder(status: number, dado: unknown, conferir?: (url: string, opcoes: RequestInit & { next?: unknown }) => void) {
  globalThis.fetch = (async (url, opcoes) => {
    conferir?.(String(url), opcoes ?? {});
    return new Response(status === 204 ? null : JSON.stringify(dado), {
      status, headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
}

test("catálogo usa a equipe configurada e cache de 60 segundos", async () => {
  responder(200, [{ id: "1" }], (url, opcoes) => {
    assert.equal(url, `${API}/vagas`);
    assert.deepEqual(opcoes.next, { revalidate: 60, tags: ["vagas"] });
  });
  assert.deepEqual(await listarVagas(), [{ id: "1" }]);
});

test("404 de detalhe é ausência; 404 de catálogo é erro de configuração", async () => {
  responder(404, { erro: "Não existe" });
  assert.equal(await buscarVaga("ausente"), undefined);
  assert.equal(await buscarEmpresa("ausente"), undefined);
  await assert.rejects(listarVagas, /404/);
});

test("falha do backend lança para a tela de erro", async () => {
  responder(503, { erro: "Indisponível" });
  await assert.rejects(listarVagas, /503/);
  await assert.rejects(() => conferirLogin("ana@exemplo.com", "incorreta"), /503/);
});

test("identificadores são codificados e autorização consulta vaga sem cache", async () => {
  responder(200, { id: "a/b" }, (url, opcoes) => {
    assert.equal(url, `${API}/vagas/a%2Fb`);
    assert.equal(opcoes.cache, "no-store");
  });
  await buscarVaga("a/b", true);
});

test("publicação preserva os erros de campo da API e recebe id do servidor", async () => {
  const entrada = { titulo: "Nova vaga", empresaSlug: "aurora-tech", area: "Front-end", senioridade: "Júnior", local: "Remoto", aceitaIniciante: true, descricao: "Descrição da vaga" };
  responder(422, { erro: "Há campos para corrigir.", campos: { titulo: "Muito longo" } });
  assert.deepEqual(await guardarVaga(entrada, "ana"), { ok: false, status: 422, erros: { titulo: "Muito longo" }, mensagem: "Há campos para corrigir." });
  responder(201, { id: "id-da-api" }, (_url, opcoes) => {
    const corpo = JSON.parse(String(opcoes.body));
    assert.equal(corpo.autorId, "ana");
    assert.equal(corpo.empresaSlug, "aurora-tech");
    assert.equal(corpo.id, undefined);
  });
  assert.deepEqual(await guardarVaga(entrada, "ana"), { ok: true, dado: { id: "id-da-api" } });
});

test("login inválido é null; pessoa e painéis não usam cache compartilhado", async () => {
  responder(401, { erro: "E-mail ou senha não conferem." });
  assert.equal(await conferirLogin("ana@exemplo.com", "incorreta"), null);
  responder(200, [], (_url, opcoes) => assert.equal(opcoes.cache, "no-store"));
  await buscarPessoa("ana");
  await listarVagasDoAutor("ana");
  await listarArquivadasDoAutor("ana");
  await listarCandidaturasDe("carla");
  await buscarCandidatura("c1");
  responder(404, {});
  assert.equal(await buscarPessoa("removida"), null);
});

test("editar manda PUT completo e desarquivar manda só arquivada false", async () => {
  const vaga = { titulo: "Vaga editada", empresaSlug: "aurora-tech", area: "QA", senioridade: "Júnior", local: "Remoto", aceitaIniciante: false, descricao: "Descrição da vaga" };
  responder(200, { ...vaga, id: "a/b" }, (url, opcoes) => {
    assert.equal(url, `${API}/vagas/a%2Fb`);
    assert.equal(opcoes.method, "PUT");
    assert.deepEqual(JSON.parse(String(opcoes.body)), vaga);
  });
  assert.equal((await trocarVaga("a/b", vaga)).ok, true);
  responder(200, {}, (_url, opcoes) => {
    assert.equal(opcoes.method, "PATCH");
    assert.deepEqual(JSON.parse(String(opcoes.body)), { arquivada: false });
  });
  await desarquivarVaga("1");
});

test("exclusões aceitam 204 sem tentar interpretar JSON e codificam os ids", async () => {
  for (const [apagar, caminho] of [[apagarVaga, "vagas"], [apagarPessoa, "pessoas"], [apagarCandidatura, "candidaturas"]] as const) {
    responder(204, null, (url, opcoes) => {
      assert.equal(url, `${API}/${caminho}/a%2Fb`);
      assert.equal(opcoes.method, "DELETE");
      assert.equal(opcoes.body, undefined);
      assert.equal(opcoes.cache, "no-store");
    });
    assert.deepEqual(await apagar("a/b"), { ok: true, dado: null });
  }
});

test("listar arquivadas usa o filtro explícito e não usa cache compartilhado", async () => {
  responder(200, [], (url, opcoes) => {
    assert.equal(url, `${API}/vagas?autor=a%2Fb&arquivada=true`);
    assert.equal(opcoes.cache, "no-store");
    assert.equal(opcoes.next, undefined);
  });
  assert.deepEqual(await listarArquivadasDoAutor("a/b"), []);
});

test("falha de conexão e 503 em exclusão sobem; conflito 409 permanece uma recusa", async () => {
  responder(503, {});
  await assert.rejects(() => apagarVaga("1"), /503/);
  responder(409, { erro: "Apague as vagas antes de apagar a conta." });
  const resultado = await apagarPessoa("ana");
  assert.equal(resultado.ok, false);
  if (!resultado.ok) assert.equal(resultado.status, 409);
  globalThis.fetch = async () => { throw new TypeError("fetch failed"); };
  await assert.rejects(() => apagarCandidatura("1"), /fetch failed/);
});

test("cadastro fixa papel de candidata, sem devolver senha ou hash no resultado de erro", async () => {
  responder(409, { erro: "E-mail repetido", campos: { email: "Já tem conta" } }, (_url, opcoes) => {
    assert.deepEqual(JSON.parse(String(opcoes.body)), { nome: "Nova Pessoa", email: "nova@exemplo.com", senha: "somente-teste", papel: "candidata" });
  });
  const resultado = await guardarPessoa({ nome: "Nova Pessoa", email: "nova@exemplo.com", senha: "somente-teste" });
  assert.equal(resultado.ok, false);
  assert.ok(!JSON.stringify(resultado).includes("somente-teste"));
});

test("editar empresa usa PUT e arquivar usa PATCH com apenas arquivada", async () => {
  responder(200, {}, (url, opcoes) => {
    assert.equal(url, `${API}/empresas/aurora-tech`);
    assert.equal(opcoes.method, "PUT");
  });
  await guardarEmpresa("aurora-tech", { nome: "Aurora", sobre: "Sobre", site: "https://exemplo.com" });
  responder(200, {}, (url, opcoes) => {
    assert.equal(url, `${API}/vagas/1`);
    assert.equal(opcoes.method, "PATCH");
    assert.deepEqual(JSON.parse(String(opcoes.body)), { arquivada: true });
  });
  await arquivarVaga("1");
});

test("candidatura repetida preserva 409; contagem e números vêm da API", async () => {
  responder(409, { erro: "Você já se candidatou", campos: { email: "Repetida" } });
  const r = await guardarCandidatura("1", { nome: "Carla", email: "carla@exemplo.com", habilidades: ["React"], pessoaId: "carla" });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.erros.email, "Repetida");
  responder(200, [{ id: "c1" }, { id: "c2" }]);
  assert.equal(await contarCandidaturas("1"), 2);
  responder(200, { total: 12, aceitamIniciante: 8 });
  assert.equal((await buscarNumeros()).total, 12);
});
