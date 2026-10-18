import '../../global.css';
import {SafeAreaView} from "react-native-safe-area-context";
import {Text, View, StyleSheet} from "react-native";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Skeleton} from "@/components/ui/skeleton";
import {TextColors} from "@/constants/text-colors";

export default function HomeScreen() {
    return (
        <SafeAreaView className="flex-1 px-5" edges={["top"]}>
            <View className="flex-1 flex-col gap-y-4">

                {/*User Header*/}
                <View className="flex-row gap-3">
                    <Avatar style={styles.avatarSize} alt="User Profile's Avatar">
                        <AvatarImage
                            source={{uri: 'https://i.pinimg.com/1200x/2a/3a/1e/2a3a1e85135db15d5cdd591f4437d480.jpg'}}/>
                        <AvatarFallback>
                            <View>
                                <Skeleton className="w-10 h-10 rounded-full animate-pulse"/>
                            </View>
                        </AvatarFallback>
                    </Avatar>
                    <View className='flex-1 flex-col items-start'>
                        <Text className="text-xl font-medium leading-tight">
                            Waisoka
                        </Text>
                        <Text style={styles.description} className="text-sm font-medium leading-tight text-sub">
                            Hello ReactNative
                        </Text>
                    </View>
                </View>

                {/*Main Card*/}
                <View className="flex-1 rounded-3xl bg-white">
                    <View className="p-4">
                        <Text style={[styles.appTitle]} className="font-medium uppercase">
                            Axel Desktop Robot
                        </Text>
                    </View>
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