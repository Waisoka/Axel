import {NativeTabs} from "expo-router/native-tabs";
import {useColorScheme} from 'react-native';

import {Colors} from '@/constants/theme';

export default function AppTabs() {
    const scheme = useColorScheme();
    const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

    return (
        <NativeTabs
            backgroundColor={colors.background}
            indicatorColor={colors.backgroundElement}
            labelStyle={{selected: {color: colors.text}}}>
            <NativeTabs.Trigger name="home">
                <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    src={require('@/assets/images/tabIcons/home.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="library">
                <NativeTabs.Trigger.Label>Library</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    sf="folder.fill"
                    renderingMode="template"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="robot">
                <NativeTabs.Trigger.Label>Robot</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    sf="staroflife.fill"
                    renderingMode="template"
                />
            </NativeTabs.Trigger>
        </NativeTabs>

    );
}
