import { createContext, useContext } from 'react'

export type AuthData = {
    claims?: Record<string, any> | null
    profile?: any
    isLoading: boolean
    isLoggedIn: boolean
    signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthData>({
    claims: null,
    profile: null,
    isLoading: true,
    isLoggedIn: false,
    signOut: async () => {},
})


export const useAuthContext = () => useContext(AuthContext)
