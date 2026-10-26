import {SafeAreaView} from "react-native-safe-area-context";
import {View, StyleSheet} from "react-native";
import {Avatar, AvatarImage} from "@/components/ui/avatar";
import {TextColors} from "@/constants/text-colors";
import {Text} from '@/components/ui/text';
import SignOutButton from "@/features/auth/components/sign-out-button";
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react-native";
import Foldercomponent from "@/components/folder-component";

export default function HomeScreen() {
    return (
        <SafeAreaView className="flex-1 px-5" edges={["top"]}>
            <View className="flex-1 flex-col gap-y-6">

                {/*User Header*/}
                <View className="flex-row gap-3 items-center">
                    <Avatar style={styles.avatarSize} alt="User Profile's Avatar">
                        <AvatarImage
                            source={{uri: 'https://i.pinimg.com/1200x/2a/3a/1e/2a3a1e85135db15d5cdd591f4437d480.jpg'}}/>
                    </Avatar>
                    <View className="flex-1 flex-col items-start">
                        <Text className="text-xl font-medium leading-tight">
                            Waisoka
                        </Text>
                        <Text style={styles.description} className="text-sm font-medium leading-tight text-sub">
                            Hello ReactNative
                        </Text>
                    </View>
                </View>

                <View className="flex-row">
                    <Foldercomponent size="sm"/>
                </View>

            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    avatarSize: {
        height: 40,
        width: 40,
    },
    description: {
        color: TextColors.textColors.secondary
    },
    appTitle: {
        fontFamily: "PlexMono"
    }
})