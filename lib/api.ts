import { API } from "@/lib/configuracao";
import type {
   Empresa, Pessoa, Vaga, VagaNova, Candidatura, CandidaturaComVaga, Numeros
} from "@/lib/tipos";

/** Uma única porta para o backend da aula 09, tanto no localhost quanto na Vercel. */
async function ler<T>(caminho: string, etiqueta: string, semCache = false): Promise<T | undefined> {
  const resposta = await fetch(`${API}${caminho}`, {
    ...(semCache ? { cache: "no-store" as const } : { next: { revalidate: 60, tags: [etiqueta] } }),
    signal: AbortSignal.timeout(15_000),
  });
  if (resposta.status === 404) return undefined;
  if (!resposta.ok) throw new Error(`GET ${caminho} respondeu ${resposta.status}`);
  return resposta.json();
}

export type Gravou<T> =
  | { ok: true; dado: T }
  | { ok: false; status: number; erros: Record<string, string>; mensagem: string };

async function gravar<T>(metodo: string, caminho: string, corpo?: unknown): Promise<Gravou<T>> {
  const resposta = await fetch(`${API}${caminho}`, {
    method: metodo,
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
    headers: { "Content-Type": "application/json" },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  if (resposta.status >= 500) throw new Error(`${metodo} ${caminho} respondeu ${resposta.status}`);
  if (resposta.status === 204) return { ok: true, dado: null as T };
  const lido = await resposta.json();
  if (resposta.ok) return { ok: true, dado: lido };
  return { ok: false, status: resposta.status, erros: lido.campos ?? {}, mensagem: lido.erro };
}

export async function listarVagas(): Promise<Vaga[]> {
  const vagas = await ler<Vaga[]>("/vagas", "vagas");
  if (!vagas) throw new Error("GET /vagas respondeu 404. Confira a configuração da API.");
  return vagas;
}

/** As ações usam leitura fresca para conferir autoria e situação antes de escrever. */
export async function buscarVaga(id: string, semCache = false): Promise<Vaga | undefined> {
  return ler<Vaga>(`/vagas/${encodeURIComponent(id)}`, "vagas", semCache);
}

export async function guardarVaga(vaga: VagaNova, autorId: string) {
  return gravar<Vaga>("POST", "/vagas", { ...vaga, autorId });
}

/** Editar preserva id, autoria, empresa, data e situação da vaga. */
export async function trocarVaga(id: string, vaga: VagaNova) {
  return gravar<Vaga>("PUT", `/vagas/${encodeURIComponent(id)}`, vaga);
}

/** O DELETE responde 204 e também remove as candidaturas da vaga. */
export async function apagarVaga(id: string) {
  return gravar<null>("DELETE", `/vagas/${encodeURIComponent(id)}`);
}

export async function arquivarVaga(id: string) {
  return gravar<Vaga>("PATCH", `/vagas/${encodeURIComponent(id)}`, { arquivada: true });
}

export async function desarquivarVaga(id: string) {
  return gravar<Vaga>("PATCH", `/vagas/${encodeURIComponent(id)}`, { arquivada: false });
}

export async function listarVagasDoAutor(autorId: string): Promise<Vaga[]> {
  return (await ler<Vaga[]>(`/vagas?autor=${encodeURIComponent(autorId)}`, "vagas", true)) ?? [];
}

export async function listarArquivadasDoAutor(autorId: string): Promise<Vaga[]> {
  return (await ler<Vaga[]>(`/vagas?autor=${encodeURIComponent(autorId)}&arquivada=true`, "vagas", true)) ?? [];
}

export async function listarEmpresas(): Promise<Empresa[]> {
  const empresas = await ler<Empresa[]>("/empresas", "empresas");
  if (!empresas) throw new Error("GET /empresas respondeu 404. Confira a configuração da API.");
  return empresas;
}

export async function buscarEmpresa(slug: string): Promise<Empresa | undefined> {
  return ler<Empresa>(`/empresas/${encodeURIComponent(slug)}`, "empresas");
}

export async function guardarEmpresa(slug: string, empresa: Omit<Empresa, "slug">) {
  return gravar<Empresa>("PUT", `/empresas/${encodeURIComponent(slug)}`, empresa);
}

/* ─── O LOGIN ─────────────────────────────────────────────────────────────
   Quem confere a senha é a API: o site pergunta "confere?", e nunca vê o hash. */

export async function conferirLogin(email: string, senha: string): Promise<Pessoa | null> {
  const gravou = await gravar<Pessoa>("POST", "/sessoes", { email, senha });
  if (gravou.ok) return gravou.dado;
  if (gravou.status === 401) return null;
  throw new Error(`POST /sessoes respondeu ${gravou.status}`);
}

/** Sem cache: o papel de alguém pode mudar, e o painel precisa saber no próximo clique. */
export async function buscarPessoa(id: string): Promise<Pessoa | null> {
  return (await ler<Pessoa>(`/pessoas/${encodeURIComponent(id)}`, "pessoas", true)) ?? null;
}

export async function apagarPessoa(id: string) {
  return gravar<null>("DELETE", `/pessoas/${encodeURIComponent(id)}`);
}

export async function guardarPessoa(pessoa: { nome: string; email: string; senha: string }) {
  return gravar<Pessoa>("POST", "/pessoas", { ...pessoa, papel: "candidata" });
}

export async function guardarCandidatura(
  vagaId: string,
  candidatura: { nome: string; email: string; habilidades: string[]; pessoaId: string },
) {
  return gravar<Candidatura>("POST", `/vagas/${encodeURIComponent(vagaId)}/candidaturas`, candidatura);
}

export async function listarCandidaturasDe(pessoaId: string): Promise<CandidaturaComVaga[]> {
  return (await ler<CandidaturaComVaga[]>(`/pessoas/${encodeURIComponent(pessoaId)}/candidaturas`, "candidaturas", true)) ?? [];
}

/** A desistência confere a dona com uma leitura fresca, nunca com cache compartilhado. */
export async function buscarCandidatura(id: string): Promise<Candidatura | undefined> {
  return ler<Candidatura>(`/candidaturas/${encodeURIComponent(id)}`, "candidaturas", true);
}

export async function apagarCandidatura(id: string) {
  return gravar<null>("DELETE", `/candidaturas/${encodeURIComponent(id)}`);
}

export async function contarCandidaturas(vagaId: string): Promise<number> {
  const lista = await ler<Candidatura[]>(`/vagas/${encodeURIComponent(vagaId)}/candidaturas`, "candidaturas");
  return lista?.length ?? 0;
}

export async function buscarNumeros(): Promise<Numeros> {
  const numeros = await ler<Numeros>("/numeros", "vagas");
  if (!numeros) throw new Error("GET /numeros respondeu 404");
  return numeros;
}


