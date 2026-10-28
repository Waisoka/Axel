import {SafeAreaView} from "react-native-safe-area-context";
import {View, StyleSheet} from "react-native";
import {Avatar, AvatarImage} from "@/components/ui/avatar";
import {TextColors} from "@/constants/text-colors";
import {Text} from '@/components/ui/text';
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react-native";
import {Folder, Contributor} from "@/components/folder-component";
import {useEffect, useState} from "react";
import {supabase} from "@/lib/utils/supabase";
import {Icon} from "@/components/ui/icon"

const contributors: Contributor[] = [
    {name: "Waisoka", avatar: "https://i.pinimg.com/736x/d9/f8/1b/d9f81b13da05043dcacae056256b20b5.jpg"},
    {name: "Axel Bot", avatar: require("@/assets/images/axel-bot-dark-icon.png")},
];

export default function HomeScreen() {

    const [now, setNow] = useState(new Date());

    useEffect(() => {
        async function syncTimeWithSupabase() {
            const {data, error} = await supabase.rpc('get_current_time');
            if (data && !error) {
                setNow(new Date(data));
            }
        }

        const timer = setInterval(() => {
            setNow((prev) => new Date(prev.getTime() + 1000));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formattedDate = now.toLocaleTimeString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });
    return (
        <SafeAreaView className="flex-1 px-5" edges={["top"]}>
            <View className="flex-1 flex-col gap-y-6">

                {/*User Header*/}
                <View className="flex-row gap-3 items-center">
                    <Avatar style={styles.avatarSize} alt="User Profile's Avatar">
                        <AvatarImage
                            source={{uri: 'https://i.pinimg.com/736x/d9/f8/1b/d9f81b13da05043dcacae056256b20b5.jpg'}}/>
                    </Avatar>
                    <View className="flex-1 flex-col items-start">
                        <Text className="text-xl font-medium leading-tight">
                            Waisoka
                        </Text>
                        <Text style={styles.description} className="text-sm font-medium leading-tight text-sub">
                            {formattedDate}
                        </Text>
                    </View>

                    {/* TODO: Implement task management system */}
                    <Button className="w-10 h-10 rounded-full">
                        <Icon as={Plus} size={20}/>
                    </Button>


                </View>

                <View className="flex-row">
                    <Folder size="sm" contributors={contributors}/>
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