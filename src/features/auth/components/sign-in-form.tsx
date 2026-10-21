import AuthInput from "@/features/auth/components/auth-input";
import {FormEvent, useState} from "react";
import {View} from "react-native";
import AuthFooter from "@/features/auth/components/auth-footer";
import {supabase} from "@/lib/utils/supabase";
import {Text} from "@/components/ui/text";

export default function SignInForm(){

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignIn = async () => {
        if (!email || !password) {
            setError("Please enter email and password");
            return;
        }
        setLoading(true);
        setError(null);
        const {error} = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });
        if (error) setError(error.message);
        setLoading(false);
    };

    return(
        <View className="gap-4">
            <AuthInput
                mode="sign-in"
                email={email}
                password={password}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
            />

            {error ? <Text className="text-destructive text-sm">{error}</Text> : null}

            <AuthFooter
                onContinue={handleSignIn}
                loading={loading}
                message="Don't have an account?"
                linkText="Sign Up"
                href="/sign-up"
            />
        </View>
    );
}