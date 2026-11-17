import assert from "node:assert/strict";
import { test } from "node:test";
import { podeArquivar, podeCandidatar, podeEditarEmpresa, podePublicar } from "../lib/permissoes";
import { EsquemaDaVaga, EsquemaDoCadastro } from "../lib/esquemas";
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
