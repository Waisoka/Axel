import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        PlexMono: require("../../assets/fonts/IBMPlexMono-Regular.ttf"),
        PlexMonoMedium: require("../../assets/fonts/IBMPlexMono-Medium.ttf"),
        PlexMonoBold: require("../../assets/fonts/IBMPlexMono-Bold.ttf"),
    });

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    if (!loaded && !error) return null;

    return <Stack screenOptions={{headerShown: false}} />;
}