import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                role: { label: "Role", type: "text" }
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                try {
                    const res = await fetch(`${API_URL}/auth/login`, {
                        method: 'POST',
                        body: JSON.stringify(credentials),
                        headers: { "Content-Type": "application/json" }
                    });

                    const data = await res.json();

                    if (res.ok && data.user) {
                        const intendedRole = credentials.role;
                        
                        if (intendedRole === 'doctor' && data.user.role !== 'DOCTOR') {
                            throw new Error('This account is not registered as a doctor.');
                        }
                        if (intendedRole === 'patient' && data.user.role === 'DOCTOR') {
                            throw new Error('Doctor account detected. Please use "Doctor Login".');
                        }

                        return {
                            id: data.user.id,
                            name: data.user.name,
                            email: data.user.email,
                            role: data.user.role,
                            token: data.token
                        } as any;
                    }

                    throw new Error(data.error || "Login failed");
                } catch (error) {
                    if (error instanceof Error) {
                        throw error;
                    }
                    throw new Error("Authentication failed");
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
            // For Google sign-in, sync user to backend DB and get JWT
            if (account?.provider === 'google' && user?.email) {
                try {
                    const res = await fetch(`${API_URL}/auth/google`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: user.email,
                            name: user.name,
                            image: user.image,
                        }),
                    });
                    const data = await res.json();
                    if (res.ok && data.token) {
                        (user as any).token = data.token;
                        (user as any).role = data.user.role;
                        (user as any).id = data.user.id;
                    }
                } catch (error) {
                    console.error('Failed to sync Google user to backend:', error);
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role || 'USER';
                token.accessToken = (user as any).token;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session as any).accessToken = token.accessToken;
            }
            return session;
        }
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: '/login',
        error: '/login',
    }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
