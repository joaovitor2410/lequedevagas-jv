import { API } from "@/lib/configuracao";
import type {
   Empresa, Pessoa, Vaga, VagaNova, Candidatura, CandidaturaComVaga, Estado, Numeros
} from "@/lib/tipos";

/** Uma única porta para o backend da aula 09, tanto no localhost quanto na Vercel. */
async function ler<T>(caminho: string, etiqueta: string): Promise<T | undefined> {
  const resposta = await fetch(`${API}${caminho}`, {
    next: { revalidate: 60, tags: [etiqueta] },
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
  return (await ler<Vaga[]>("/vagas", "vagas")) ?? [];
}

/** As ações usam leitura fresca para conferir autoria e situação antes de escrever. */
export async function buscarVaga(id: string, semCache = false): Promise<Vaga | undefined> {
    return ler<Vaga>(`/vagas/${encodeURIComponent(id)}`, "vagas");
}

export async function guardarVaga(vaga: VagaNova, autorId: string) {
  return gravar<Vaga>("POST", "/vagas", { ...vaga, autorId });
}

export async function arquivarVaga(id: string) {
  return gravar<Vaga>("PATCH", `/vagas/${encodeURIComponent(id)}`, { arquivada: true });
}

export async function listarVagasDoAutor(autorId: string): Promise<Vaga[]> {
  return (await ler<Vaga[]>(`/vagas?autor=${encodeURIComponent(autorId)}`, "vagas", true)) ?? [];
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
  return gravou.ok ? gravou.dado : null;
}

/** Sem cache: o papel de alguém pode mudar, e o painel precisa saber no próximo clique. */
export async function buscarPessoa(id: string): Promise<Pessoa | null> {
  const resposta = await fetch(`${API}/pessoas/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (resposta.status === 404) return null;
  if (!resposta.ok) throw new Error(`GET /pessoas/${id} respondeu ${resposta.status}`);
  return resposta.json();
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

export async function contarCandidaturas(vagaId: string): Promise<number> {
  const lista = await ler<Candidatura[]>(`/vagas/${encodeURIComponent(vagaId)}/candidaturas`, "candidaturas");
  return lista?.length ?? 0;
}

export async function buscarNumeros(): Promise<Numeros> {
  const numeros = await ler<Numeros>("/numeros", "vagas");
  if (!numeros) throw new Error("GET /numeros respondeu 404");
  return numeros;
}


