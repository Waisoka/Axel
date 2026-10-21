import { Alert } from 'react-native'
import { useAuthContext } from '@/features/auth/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'

export default function SignOutButton() {
    const { signOut } = useAuthContext()

    const handleSignOut = async () => {
        try {
            await signOut()
        } catch (e: any) {
            Alert.alert('Sign out failed', e.message)
        }
    }

    return (
        <Button variant="outline" onPress={handleSignOut}>
            <Text className="text-muted-foreground">Sign Out</Text>
        </Button>
    )
}
