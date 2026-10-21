import {View} from "react-native";
import SignUpForm from "@/features/auth/components/sign-up-form";

export default function SignUpScreen(){
    return(
       <View className="flex-1">
           <SignUpForm />
       </View>
    );
}