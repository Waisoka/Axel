import React from "react";
import {ImageSourcePropType, Platform, View} from "react-native";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Text} from "@/components/ui/text";

export type Contributor = {
    name: string;
    avatar?: string | number | ImageSourcePropType;
    avatarUrl?: string;
};

export type ContributorStackProps = {
    contributors: Contributor[];
    /** Size scale (1 = md) */
    s?: number;
    ringColor?: string;
    maxVisible?: number;
    avatarSize?: number;
    overlap?: number;
};

const URI_SCHEME =
    /^(https?:|file:|data:|content:|asset:|blob:|ph:|assets-library:)/i;

/** Convert URL / path / require() / object into an Image source */
export const resolveAvatarSource = (
    input?: string | number | ImageSourcePropType
): ImageSourcePropType | undefined => {
    if (input === undefined || input === null || input === "") return undefined;

    // require("...") returns a number on native
    if (typeof input === "number") return input;
    if (typeof input !== "string") return input;

    const value = input.trim();
    if (!value) return undefined;

    // URL, file://, data:, content: ...
    if (URI_SCHEME.test(value)) return {uri: value};

    // Absolute filesystem path on native
    if (value.startsWith("/") && Platform.OS !== "web") {
        return {uri: `file://${value}`};
    }

    // Web public path or anything else
    return {uri: value};
};

const getInitials = (name: string) =>
    name
        .split(" ")
        .filter(Boolean)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

export const ContributorStack = ({
                                     contributors,
                                     s = 1,
                                     ringColor = "rgba(255,255,255,0.6)",
                                     maxVisible = 4,
                                     avatarSize = 36,
                                     overlap = 10,
                                 }: ContributorStackProps) => {
    const visible = contributors.slice(0, maxVisible);
    const extra = contributors.length - visible.length;
    const size = avatarSize * s;

    const ringStyle = {
        width: size,
        height: size,
        borderWidth: 1 * s,
        borderColor: ringColor,
    };

    return (
        <View style={{flexDirection: "row", alignItems: "center"}}>
            {visible.map((c, i) => {
                const source = resolveAvatarSource(c.avatar ?? c.avatarUrl);

                return (
                    <Avatar
                        key={`${c.name}-${i}`}
                        alt={`${c.name}'s avatar`}
                        style={[
                            ringStyle,
                            {
                                marginLeft: i === 0 ? 0 : -overlap * s,
                                zIndex: visible.length - i,
                            },
                        ]}
                    >
                        {source ? <AvatarImage source={source}/> : null}
                        <AvatarFallback>
                            <Text style={{fontSize: 12 * s, fontWeight: "600"}}>
                                {getInitials(c.name)}
                            </Text>
                        </AvatarFallback>
                    </Avatar>
                );
            })}

            {extra > 0 && (
                <Avatar
                    alt={`${extra} more contributors`}
                    style={[ringStyle, {marginLeft: -overlap * s}]}
                >
                    <AvatarFallback>
                        <Text style={{fontSize: 12 * s, fontWeight: "600"}}>+{extra}</Text>
                    </AvatarFallback>
                </Avatar>
            )}
        </View>
    );
};
