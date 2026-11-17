import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { conferirLogin } from "@/lib/api";
import { EsquemaDoLogin } from "@/lib/esquemas";

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: { signIn: "/entrar" },
  providers: [
    Credentials({
      credentials: { email: {}, senha: {} },
      // A ÚNICA função que decide se a pessoa é quem diz ser. null = não conferiu.
      async authorize(credenciais) {
        const analise = EsquemaDoLogin.safeParse(credenciais);
        if (!analise.success) return null;
        // (aula 09) Quem confere agora é a API. O bcrypt e o prisma saíram daqui.
        const pessoa = await conferirLogin(analise.data.email, analise.data.senha);
        if (!pessoa) return null;
        return { id: pessoa.id };
      },
    }),
  ],

  callbacks: {
    // O crachá diz QUEM é: o id, e só. O que a pessoa PODE vem da API —
    // um papel gravado aqui valeria até o crachá vencer, trinta dias depois.
    jwt({ token, user }) {
      if (user) return { sub: user.id }; // `user` só existe no momento do login
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
