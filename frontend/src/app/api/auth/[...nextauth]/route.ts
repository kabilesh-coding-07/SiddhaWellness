import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

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
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                try {
                    // 1. Fetch user directly from Supabase (bypassing Express backend)
                    const { data: user, error } = await supabase
                        .from('users')
                        .select('id, email, password, name, role')
                        .eq('email', credentials.email)
                        .single();

                    if (error || !user) {
                        throw new Error("Invalid credentials");
                    }

                    // 2. Verify password
                    if (!user.password) {
                        throw new Error("Please use Google Sign-in for this account.");
                    }

                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isValid) {
                        throw new Error("Invalid credentials");
                    }

                    // 3. Verify intended role
                    const intendedRole = credentials.role;
                    if (intendedRole === 'doctor' && user.role !== 'DOCTOR') {
                        throw new Error('This account is not registered as a doctor.');
                    }
                    if (intendedRole === 'patient' && user.role === 'DOCTOR') {
                        throw new Error('Doctor account detected. Please use "Doctor Login".');
                    }

                    // 4. Return user object (NextAuth will create the session)
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        token: 'DIRECT_SUPABASE_SESSION' // Placeholder since we bypass separate backend tokens
                    } as any;
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
            // For Google sign-in, sync user directly to Supabase
            if (account?.provider === 'google' && user?.email) {
                try {
                    const { data: existingUser, error: findError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('email', user.email)
                        .single();

                    if (!existingUser) {
                        // Create new user if they don't exist
                        const { data: newUser, error: createError } = await supabase
                            .from('users')
                            .insert({
                                id: crypto.randomUUID(),
                                email: user.email,
                                name: user.name || user.email.split('@')[0],
                                image: user.image,
                                role: 'USER', // Default role for new Google sign-ups
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            })
                            .select()
                            .single();

                        if (newUser) {
                            (user as any).role = newUser.role;
                            (user as any).id = newUser.id;
                        }
                    } else {
                        // Update existing user
                        const { data: updatedUser } = await supabase
                            .from('users')
                            .update({
                                name: user.name || existingUser.name,
                                image: user.image || existingUser.image,
                            })
                            .eq('email', user.email)
                            .select()
                            .single();

                        if (updatedUser) {
                            (user as any).role = updatedUser.role;
                            (user as any).id = updatedUser.id;
                        }
                    }
                    (user as any).token = 'DIRECT_SUPABASE_GOOGLE_SESSION';
                } catch (error) {
                    console.error('Failed to sync Google user to Supabase:', error);
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
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
