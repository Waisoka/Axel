import {Input} from "@/components/ui/input";
import {View} from "react-native";

type AuthInputProps = {
    email: string;
    password: string;
    onEmailChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    mode?: "sign-in" | "sign-up";
    showConfirmPassword?: boolean;
    confirmPassword?: string;
    onConfirmPasswordChange?: (value: string) => void;
    editable?: boolean;
}

export default function AuthInput({
                                      email,
                                      password,
                                      onEmailChange,
                                      onPasswordChange,
                                      mode = "sign-in",
                                      showConfirmPassword = false,
                                      confirmPassword,
                                      onConfirmPasswordChange,
                                      editable = true,
                                  }: AuthInputProps) {

    const isSignUp = mode === "sign-up";

    return (
        <View className="gap-3">
            <Input
                className="bg-background text-foreground border-input"
                value={email}
                onChangeText={onEmailChange}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Email"
                editable={editable}
            />
            <Input
                className="bg-background text-foreground border-input"
                value={password}
                onChangeText={onPasswordChange}
                secureTextEntry
                textContentType={isSignUp ? "newPassword" : "password"}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                autoCapitalize="none"
                placeholder="Password"
                editable={editable}
            />
            {isSignUp && showConfirmPassword && (
                <Input
                    className="bg-background text-foreground border-input"
                    value={confirmPassword}
                    onChangeText={onConfirmPasswordChange}
                    secureTextEntry
                    textContentType="newPassword"
                    autoComplete="new-password"
                    autoCapitalize="none"
                    placeholder="Confirm Password"
                    editable={editable}
                />
            )}
        </View>
    );
}