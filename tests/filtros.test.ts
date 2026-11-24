import assert from "node:assert/strict";
import { test } from "node:test";
import { filtrarVagas, lerFiltros } from "../lib/filtros";
import type { Vaga } from "../lib/tipos";

const base: Vaga = { id: "1", titulo: "Pessoa Front-end Júnior", empresa: "Aurora Tech", empresaSlug: "aurora-tech", area: "Front-end", senioridade: "Júnior", local: "Remoto", aceitaIniciante: true, descricao: "Descrição", publicadaEm: "2026-11-24T12:00:00Z", arquivada: false, autorId: "ana" };
const vagas = [base, { ...base, id: "2", titulo: "Pessoa de Dados Pleno", area: "Dados", senioridade: "Pleno", aceitaIniciante: false }];

test("link compartilhado combina busca sem acento, área, senioridade e iniciante", () => {
  const filtros = lerFiltros(new URLSearchParams("busca=JUNIOR&area=front-end&senioridade=junior&iniciante=true"));
  assert.deepEqual(filtrarVagas(vagas, filtros).map((v) => v.id), ["1"]);
  assert.equal(filtrarVagas(vagas, { ...filtros, area: "Dados" }).length, 0);
});

test("false seleciona quem não aceita iniciante; filtro ausente inclui as duas situações", () => {
  assert.deepEqual(filtrarVagas(vagas, lerFiltros(new URLSearchParams("iniciante=false"))).map((v) => v.id), ["2"]);
  assert.deepEqual(filtrarVagas(vagas, lerFiltros(new URLSearchParams())), vagas);
  assert.equal(lerFiltros(new URLSearchParams("iniciante=talvez")).iniciante, "");
});

test("a busca também encontra empresa, ignora espaços externos e preserva a ordem", () => {
  assert.deepEqual(filtrarVagas(vagas, lerFiltros(new URLSearchParams("busca=+AURORA+"))).map((v) => v.id), ["1", "2"]);
  assert.equal(filtrarVagas(vagas, lerFiltros(new URLSearchParams("area=inexistente"))).length, 0);
});
