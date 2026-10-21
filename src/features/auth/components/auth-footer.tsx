import {View} from "react-native";
import {Button} from "@/components/ui/button";
import {Text} from "@/components/ui/text";
import {Link, type Href} from "expo-router";

type AuthFooterProps = {
    onContinue: () => void;
    loading?: boolean;
    disabled?: boolean;
    message?: string;
    linkText?: string;
    href: Href;
}

export default function AuthFooter({
                                       onContinue,
                                       loading = false,
                                       disabled = false,
                                       message,
                                       linkText,
                                       href,
                                   }: AuthFooterProps) {
    return (
        <View className="gap-4">
            <Button onPress={onContinue} disabled={loading || disabled}>
                <Text>{loading ? "Loading..." : "Continue"}</Text>
            </Button>

            <View className="flex-row  justify-center gap-1">
                <Text className="text-muted-foreground ">
                    {message}
                </Text>
                <Link href={href}>
                    <Text className="text-primary font-medium">
                        {linkText}
                    </Text>
                </Link>
            </View>
        </View>
    );
}