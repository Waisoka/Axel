import { Stack, DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { PortalHost } from "@rn-primitives/portal";
import AuthProvider from "@/providers/auth-provider";
import { useAuthContext } from "@/features/auth/hooks/use-auth";
import "../global.css";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
    const { isLoggedIn, isLoading } = useAuthContext();

    useEffect(() => {
        if (!isLoading) SplashScreen.hideAsync();
    }, [isLoading]);

    if (isLoading) return null;

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={isLoggedIn}>
                <Stack.Screen name="(tabs)" />
            </Stack.Protected>
            <Stack.Protected guard={!isLoggedIn}>
                <Stack.Screen name="(auth)" />
            </Stack.Protected>
        </Stack>
    );
}

export default function RootLayout() {
    const { colorScheme } = useColorScheme();
    const [loaded, error] = useFonts({
        PlexMono: require("../../assets/fonts/IBMPlexMono-Regular.ttf"),
        PlexMonoMedium: require("../../assets/fonts/IBMPlexMono-Medium.ttf"),
        PlexMonoBold: require("../../assets/fonts/IBMPlexMono-Bold.ttf"),
    });

    if (!loaded && !error) return null;

    return (
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            <AuthProvider>
                <RootNavigator />
            </AuthProvider>
            <PortalHost />
        </ThemeProvider>
    );
}
