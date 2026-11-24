import assert from "node:assert/strict";
import { test } from "node:test";
import { podeArquivar, podeCandidatar, podeDesistir, podeEditarEmpresa, podeEditarVaga, podePublicar } from "../lib/permissoes";
import { EsquemaDaEmpresa, EsquemaDaVaga, EsquemaDoCadastro } from "../lib/esquemas";
import type { Pessoa } from "../lib/tipos";

const ana: Pessoa = { id: "ana", nome: "Ana", email: "ana@exemplo.com", papel: "empresa", empresaSlug: "aurora-tech" };
const carla: Pessoa = { id: "carla", nome: "Carla", email: "carla@exemplo.com", papel: "candidata", empresaSlug: null };

test("visitante e candidata não publicam nem editam empresas", () => {
  for (const quem of [null, carla]) {
    assert.equal(podePublicar(quem), false);
    assert.equal(podeEditarEmpresa(quem, "aurora-tech"), false);
  }
  assert.equal(podePublicar(ana), true);
  assert.equal(podeEditarEmpresa(ana, "nuvem-rosa"), false);
});

test("editar e apagar seguem a mesma autoria do arquivar e exigem conta de empresa", () => {
  for (const regra of [podeArquivar, podeEditarVaga]) {
    assert.equal(regra(ana, { autorId: "ana" }), true);
    assert.equal(regra(ana, { autorId: "bruno" }), false);
    assert.equal(regra(null, { autorId: "ana" }), false);
    assert.equal(regra(carla, { autorId: "carla" }), false);
    assert.equal(regra(ana, { autorId: null }), false);
  }
});

test("somente a candidata dona da candidatura pode desistir", () => {
  assert.equal(podeDesistir(carla, { pessoaId: "carla" }), true);
  assert.equal(podeDesistir(carla, { pessoaId: "outra" }), false);
  assert.equal(podeDesistir(ana, { pessoaId: "ana" }), false);
  assert.equal(podeDesistir(null, { pessoaId: null }), false);
  assert.equal(podeDesistir(carla, { pessoaId: null }), false);
});

test("validação respeita os máximos da API para vaga, empresa e cadastro", () => {
  const vaga = { titulo: "Vaga válida", area: "QA", senioridade: "Júnior", local: "Remoto", descricao: "x".repeat(80) };
  for (const [campo, limite] of [["titulo", 120], ["area", 40], ["senioridade", 40], ["local", 60], ["descricao", 2000]] as const) {
    assert.equal(EsquemaDaVaga.safeParse({ ...vaga, [campo]: "x".repeat(limite) }).success, true);
    assert.equal(EsquemaDaVaga.safeParse({ ...vaga, [campo]: "x".repeat(limite + 1) }).success, false);
  }
  assert.equal(EsquemaDaEmpresa.safeParse({ nome: "x".repeat(81), sobre: "x".repeat(40), site: "https://exemplo.com" }).success, false);
  assert.equal(EsquemaDoCadastro.safeParse({ nome: "Pessoa de Teste", email: "teste@exemplo.com", senha: "x".repeat(73) }).success, false);
});

test("só a autora arquiva; só a candidata envia candidatura", () => {
  assert.equal(podeArquivar(ana, { autorId: "ana" }), true);
  assert.equal(podeArquivar(ana, { autorId: "bruno" }), false);
  assert.equal(podeArquivar(ana, { autorId: null }), false);
  assert.equal(podeArquivar(null, { autorId: null }), false);
  assert.equal(podeCandidatar(carla), true);
  assert.equal(podeCandidatar(ana), false);
});

test("validação local exige descrição de 80 caracteres e ignora empresa injetada", () => {
  const entrada = { titulo: "Vaga de teste", area: "QA", senioridade: "Júnior", local: "Remoto", descricao: "x".repeat(80), empresaSlug: "injetada" };
  const r = EsquemaDaVaga.parse(entrada);
  assert.equal(r.aceitaIniciante, false);
  assert.equal("empresaSlug" in r, false);
  assert.equal(EsquemaDaVaga.safeParse({ ...entrada, descricao: "Curta" }).success, false);
});

test("cadastro não aceita papel nem empresa enviados pelo formulário", () => {
  const r = EsquemaDoCadastro.parse({ nome: "Pessoa de Teste", email: "teste@exemplo.com", senha: "somente-teste", papel: "empresa", empresaSlug: "aurora-tech" });
  assert.equal("papel" in r, false);
  assert.equal("empresaSlug" in r, false);
});
