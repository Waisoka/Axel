import AuthInput from "@/features/auth/components/auth-input";
import {useState} from "react";
import {supabase} from "@/lib/utils/supabase";
import {View} from "react-native";
import AuthFooter from "@/features/auth/components/auth-footer";
import {Text} from "@/components/ui/text";

export default function SignUpForm() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const handleSignUp = async () => {
        if (!email.trim() || !password) {
            setError("Please enter email and password");
            return;
        }
        if (password !== passwordConfirm) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError(null);

        const {data, error} = await supabase.auth.signUp({
            email: email.trim(),
            password,
        });

        if (error) {
            setError(error.message);
        } else if (!data.session) {
            setError("Please check your email to confirm your account");
        }

        setLoading(false);
    };


    return (
        <View className="gap-4">
            <AuthInput
                mode="sign-up"
                email={email}
                password={password}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                showConfirmPassword
                confirmPassword={passwordConfirm}
                onConfirmPasswordChange={setPasswordConfirm}
            />

            {error ? <Text className="text-destructive text-sm">{error}</Text> : null}

            <AuthFooter
                onContinue={handleSignUp}
                loading={loading}
                message="Already have an account?"
                linkText="Sign In"
                href="/(auth)"
            />
        </View>
    );
}