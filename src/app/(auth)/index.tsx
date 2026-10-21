import {View} from "react-native";
import SignInForm from "@/features/auth/components/sign-in-form";


export default function SignInScreen(){
    return(
        <View className="flex-1">
            <SignInForm/>
        </View>
    );
}