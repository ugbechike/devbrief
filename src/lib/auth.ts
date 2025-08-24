import supabase from '~/services/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthError {
    message: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupCredentials {
    email: string;
    password: string;
}

export const auth = {
    // Sign in with email and password
    async signIn({ email, password }: LoginCredentials): Promise<{ user: User | null; error: AuthError | null }> {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return {
                    user: null,
                    error: { message: error.message }
                };
            }

            return {
                user: data.user,
                error: null
            };
        } catch (error) {
            return {
                user: null,
                error: { message: 'An unexpected error occurred' }
            };
        }
    },

    // Sign up with email and password
    async signUp({ email, password }: SignupCredentials): Promise<{ user: User | null; error: AuthError | null }> {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                return {
                    user: null,
                    error: { message: error.message }
                };
            }

            return {
                user: data.user,
                error: null
            };
        } catch (error) {
            return {
                user: null,
                error: { message: 'An unexpected error occurred' }
            };
        }
    },

    // Sign out
    async signOut(): Promise<{ error: AuthError | null }> {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                return {
                    error: { message: error.message }
                };
            }

            return { error: null };
        } catch (error) {
            return {
                error: { message: 'An unexpected error occurred' }
            };
        }
    },

    // Get current user
    async getCurrentUser(): Promise<{ user: User | null; error: AuthError | null }> {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error) {
                return {
                    user: null,
                    error: { message: error.message }
                };
            }

            return {
                user,
                error: null
            };
        } catch (error) {
            return {
                user: null,
                error: { message: 'An unexpected error occurred' }
            };
        }
    },

    // Get current session
    async getCurrentSession(): Promise<{ session: Session | null; error: AuthError | null }> {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                return {
                    session: null,
                    error: { message: error.message }
                };
            }

            return {
                session,
                error: null
            };
        } catch (error) {
            return {
                session: null,
                error: { message: 'An unexpected error occurred' }
            };
        }
    },

    // Listen to auth state changes
    onAuthStateChange(callback: (event: string, session: Session | null) => void) {
        return supabase.auth.onAuthStateChange(callback);
    }
};
