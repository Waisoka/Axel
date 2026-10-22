import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsLayout() {
    return (
        <SafeAreaView className="flex-1 px-5" edges={["top"]}>
            <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaView>
    );
}
