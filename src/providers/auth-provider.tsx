import { AuthContext } from '@/features/auth/hooks/use-auth'
import { supabase } from '@/lib/utils/supabase'
import { PropsWithChildren, useCallback, useEffect, useState } from 'react'

export default function AuthProvider({ children }: PropsWithChildren) {
    const [claims, setClaims] = useState<Record<string, any> | null>(null)
    const [profile, setProfile] = useState<any>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        let mounted = true

        const init = async () => {
            const { data, error } = await supabase.auth.getClaims()
            if (error) console.error('Error fetching claims:', error)
            if (!mounted) return
            setClaims(data?.claims ?? null)
            setIsLoading(false)
        }

        init()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', { event })

            if (event === 'SIGNED_OUT' || !session) {
                setClaims(null)
                setProfile(null)
                return
            }

            setTimeout(async () => {
                if (!mounted) return
                const { data } = await supabase.auth.getClaims()
                if (mounted) setClaims(data?.claims ?? null)
            }, 0)
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    useEffect(() => {
        let cancelled = false

        const fetchProfile = async () => {
            if (!claims) {
                setProfile(null)
                return
            }
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', claims.sub)
                .maybeSingle()
            if (error) console.error('Error fetching profile:', error)
            if (!cancelled) setProfile(data ?? null)
        }

        fetchProfile()
        return () => {
            cancelled = true
        }
    }, [claims])

    const signOut = useCallback(async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    }, [])

    return (
        <AuthContext.Provider
            value={{
                claims,
                isLoading,
                profile,
                isLoggedIn: !!claims,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
