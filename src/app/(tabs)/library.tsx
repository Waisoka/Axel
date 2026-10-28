import {SafeAreaView} from "react-native-safe-area-context";
import {Column, Host} from "@expo/ui";
import {Text} from "@/components/ui/text";
export default function LibraryScreen() {
    return (
        <SafeAreaView className="flex-1 px-5" edges={["top"]}>
            <Host>
                <Column>
                    <Text className="text-2xl font-bold text-center">
                        To do List
                    </Text>
                </Column>
            </Host>
        </SafeAreaView>
    )
}