import React, {useEffect, useState} from "react";
import {
    Platform,
    Pressable,
    StyleProp,
    StyleSheet,
    useColorScheme,
    View,
    ViewStyle,
} from "react-native";
import Svg, {Path, Rect} from "react-native-svg";
import Animated, {
    Easing,
    Extrapolation,
    SharedValue,
    interpolate,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from "react-native-reanimated";
import {BlurView} from "expo-blur";
import {MaskedView} from "@expo/ui/community/masked-view";
import {
    ContributorStack,
    type Contributor,
} from "@/components/contributor-stack";

export type {Contributor};

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
const AnimatedPath = Animated.createAnimatedComponent(Path);

type BlurTint = "dark" | "light" | "default";

// ---------------------------------------------------------------------------
// Themes
// Color tokens for the folder back, flap (glass layer), paper cards and avatars.
// ---------------------------------------------------------------------------
const themes = {
    black: {
        backFill: "#000000",
        backBorder: "rgba(255,255,255,0.37)",
        flapFill: "#292929",
        flapFillOpacity: 0.2,
        flapStroke: "#979797",
        cardFill: "#F1F1F1",
        cardStroke: "#E0E0E0",
        cardLineFill: "#D4D4D4",
        blurTint: "dark" as BlurTint,
        avatarRing: "rgba(255,255,255,0.6)",
    },
    white: {
        backFill: "#ffffff",
        backBorder: "rgba(178,178,178,0.25)",
        flapFill: "#f5f5f5",
        flapFillOpacity: 0.45,
        flapStroke: "#d4d4d4",
        cardFill: "#262626",
        cardStroke: "#404040",
        cardLineFill: "#737373",
        blurTint: "light" as BlurTint,
        avatarRing: "rgba(0,0,0,0.15)",
    },
    blue: {
        backFill: "#50B1FD",
        backBorder: "rgba(255,255,255,0.35)",
        flapFill: "#3a9ae8",
        flapFillOpacity: 0.3,
        flapStroke: "#7ec8ff",
        cardFill: "#F1F1F1",
        cardStroke: "#E0E0E0",
        cardLineFill: "#D4D4D4",
        blurTint: "default" as BlurTint,
        avatarRing: "rgba(255,255,255,0.7)",
    },
};

type Theme = (typeof themes)[keyof typeof themes];

// ---------------------------------------------------------------------------
// Size & layout constants
// ---------------------------------------------------------------------------
const sizeScales = {sm: 0.65, md: 1, lg: 1.35} as const;

const BASE_WIDTH = 321;
const BASE_HEIGHT = 270;
const CARD_W = 164;
const CARD_H = 214;
const FLAP_H = 241;

const PAD = 2;
const STROKE_W = 1.5;

const FLAP_PATH =
    "M0 25C0 11.1929 11.1929 0 25 0H136.084C143.044 0 149.689 2.90139 154.42 8.00608L178.08 33.5343C182.811 38.639 189.456 41.5404 196.416 41.5404H296C309.807 41.5404 321 52.7333 321 66.5404V216C321 229.807 309.807 241 296 241H25C11.1929 241 0 229.807 0 216V25Z";

// ---------------------------------------------------------------------------
// Animation config
// ---------------------------------------------------------------------------
const DURATION = 600;
const TIMING = {
    duration: DURATION,
    easing: Easing.bezier(0.22, 1, 0.36, 1),
};

// Flap angles
const ANGLE_CLOSED = -15;
const ANGLE_HOVER = -45;
const ANGLE_OPEN = -55;

// Blur intensity range (closed -> open)
const BLUR_MIN = 20;
const BLUR_MAX = 20;

// Flap fill opacity when fully open (near transparent glass)
const FLAP_FILL_OPEN = 0.04;

// Flap stroke opacity (closed -> open)
const FLAP_STROKE_CLOSED = 0.7;
const FLAP_STROKE_OPEN = 1;

// Extra mask width (px) to compensate for edges eaten by dimezisBlurView on Android
const MASK_BLEED = 2;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export type FolderProps = {
    /** "auto" follows the device theme (dark -> black, light -> blue) */
    color?: "black" | "white" | "blue" | "auto";
    size?: "sm" | "md" | "lg";
    style?: StyleProp<ViewStyle>;
    /** Avatar stack shown on the flap */
    contributors?: Contributor[];
    /** Max avatars before "+N" */
    maxVisible?: number;
    /** Override avatar ring color (hex, rgb, rgba) */
    avatarRingColor?: string;
    /** Custom flap content, overrides contributors */
    flapContent?: React.ReactNode;
    /** Called when the folder is tapped */
    onPress?: () => void;
    /** Called when the open state changes */
    onOpenChange?: (open: boolean) => void;
};

// ---------------------------------------------------------------------------
// Folder (root component)
// ---------------------------------------------------------------------------
export const Folder = ({
                           color = "auto",
                           size = "md",
                           style,
                           contributors,
                           maxVisible = 4,
                           avatarRingColor,
                           flapContent,
                           onPress,
                           onOpenChange,
                       }: FolderProps) => {
    const scheme = useColorScheme();

    const resolvedColor: keyof typeof themes =
        color === "auto" ? (scheme === "dark" ? "black" : "blue") : color;

    const theme = themes[resolvedColor] ?? themes.black;
    const s = sizeScales[size];

    const [isHovered, setIsHovered] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const W = BASE_WIDTH * s;
    const H = BASE_HEIGHT * s;
    const flapH = FLAP_H * s;

    const flapRotate = useSharedValue(ANGLE_CLOSED);

    useEffect(() => {
        flapRotate.value = withTiming(
            isOpen ? ANGLE_OPEN : isHovered ? ANGLE_HOVER : ANGLE_CLOSED,
            TIMING
        );
    }, [isOpen, isHovered]);

    const flapStyle = useAnimatedStyle(() => ({
        transform: [
            {perspective: 800 * s},
            {translateY: flapH / 2},
            {rotateX: `${flapRotate.value}deg`},
            {translateY: -flapH / 2},
        ],
    }));

    const baseOpacity = theme.flapFillOpacity;

    // Fill fades to near transparent and stroke gets sharper as the flap opens
    const flapFillProps = useAnimatedProps(() => ({
        fillOpacity: interpolate(
            flapRotate.value,
            [ANGLE_CLOSED, ANGLE_OPEN],
            [baseOpacity, FLAP_FILL_OPEN],
            Extrapolation.CLAMP
        ),
        strokeOpacity: interpolate(
            flapRotate.value,
            [ANGLE_CLOSED, ANGLE_OPEN],
            [FLAP_STROKE_CLOSED, FLAP_STROKE_OPEN],
            Extrapolation.CLAMP
        ),
    }));

    const CLIP_X = W;
    const CLIP_TOP = H * 2;

    const cardProps = {theme, s, isOpen, isHovered};
    const hasFlapContent =
        !!flapContent || (!!contributors && contributors.length > 0);

    return (
        <View style={[{alignItems: "center", justifyContent: "center"}, style]}>
            <Pressable
                onHoverIn={() => setIsHovered(true)}
                onHoverOut={() => {
                    setIsHovered(false);
                    if (isOpen) {
                        setIsOpen(false);
                        onOpenChange?.(false);
                    }
                }}
                onPressIn={() => setIsHovered(true)}
                onPressOut={() => setIsHovered(false)}
                onPress={() => {
                    const next = !isOpen;
                    setIsOpen(next);
                    onOpenChange?.(next);
                    onPress?.();
                }}
                style={{width: W, height: H}}
            >
                {/* Back panel */}
                <Svg
                    width={(BASE_WIDTH + PAD * 2) * s}
                    height={(BASE_HEIGHT + PAD * 2) * s}
                    viewBox={`${-PAD} ${-PAD} ${BASE_WIDTH + PAD * 2} ${
                        BASE_HEIGHT + PAD * 2
                    }`}
                    style={{
                        position: "absolute",
                        left: -PAD * s,
                        top: -PAD * s,
                    }}
                    pointerEvents="none"
                >
                    <Rect
                        x={0}
                        y={0}
                        width={BASE_WIDTH}
                        height={BASE_HEIGHT}
                        rx={25}
                        fill={theme.backFill}
                    />
                    <Rect
                        x={1}
                        y={1}
                        width={BASE_WIDTH - 2}
                        height={BASE_HEIGHT - 2}
                        rx={24}
                        fill="none"
                        stroke={theme.backBorder}
                        strokeWidth={2}
                    />
                </Svg>

                {/* Cards layer */}
                <View
                    pointerEvents="none"
                    style={{
                        position: "absolute",
                        left: -CLIP_X,
                        top: -CLIP_TOP,
                        width: W + CLIP_X * 2,
                        height: CLIP_TOP + H - 2 * s,
                        overflow: "hidden",
                    }}
                >
                    <View
                        style={{
                            position: "absolute",
                            left: CLIP_X,
                            top: CLIP_TOP,
                            width: W,
                            height: H,
                        }}
                    >
                        <AnimatedCard
                            {...cardProps}
                            closed={{y: -10, x: 40, r: 10}}
                            hover={{y: -30, x: 40, r: 14}}
                            open={{y: -160, x: 70, r: 18}}
                            delayOpen={60}
                            delayHover={30}
                        />
                        <AnimatedCard
                            {...cardProps}
                            closed={{y: -20, x: 3, r: 2}}
                            hover={{y: -35, x: 3, r: -1}}
                            open={{y: -180, x: 0, r: -3}}
                            delayOpen={30}
                            delayHover={15}
                        />
                        <AnimatedCard
                            {...cardProps}
                            closed={{y: -22, x: -40, r: -5}}
                            hover={{y: -44, x: -40, r: -9}}
                            open={{y: -170, x: -65, r: -14}}
                            delayOpen={0}
                            delayHover={0}
                        />
                    </View>
                </View>

                {/* Front flap: 3D rotate + blur + fill + content */}
                <Animated.View
                    pointerEvents="none"
                    // renderToHardwareTextureAndroid is intentionally omitted (breaks blur on Android)
                    style={[
                        {
                            position: "absolute",
                            left: 0,
                            top: ((BASE_HEIGHT - FLAP_H) / 2 + 16) * s,
                            width: W,
                            height: flapH,
                        },
                        Platform.OS === "web"
                            ? ({willChange: "transform"} as any)
                            : null,
                        flapStyle,
                    ]}
                >
                    {/* 1. Blur layer (bottom) */}
                    <FlapBlur
                        W={W}
                        flapH={flapH}
                        rotate={flapRotate}
                        tint={theme.blurTint}
                    />

                    {/* 2. Fill + stroke (fill fades out when open, stroke sharpens) */}
                    <Svg
                        width={(BASE_WIDTH + PAD * 2) * s}
                        height={(FLAP_H + PAD * 2) * s}
                        viewBox={`${-PAD} ${-PAD} ${BASE_WIDTH + PAD * 2} ${
                            FLAP_H + PAD * 2
                        }`}
                        style={{
                            position: "absolute",
                            left: -PAD * s,
                            top: -PAD * s,
                        }}
                    >
                        <AnimatedPath
                            d={FLAP_PATH}
                            fill={theme.flapFill}
                            animatedProps={flapFillProps}
                            stroke={theme.flapStroke}
                            strokeWidth={STROKE_W}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                    </Svg>

                    {/* 3. Flap content (rotates with the flap) */}
                    {hasFlapContent ? (
                        <View
                            style={{
                                position: "absolute",
                                left: 20 * s,
                                bottom: 20 * s,
                            }}
                        >
                            {flapContent ?? (
                                <ContributorStack
                                    contributors={contributors!}
                                    s={s}
                                    ringColor={avatarRingColor ?? theme.avatarRing}
                                    maxVisible={maxVisible}
                                />
                            )}
                        </View>
                    ) : null}
                </Animated.View>
            </Pressable>
        </View>
    );
};

export default Folder;

// ---------------------------------------------------------------------------
// FlapBlur
// Blur clipped to the flap shape. Intensity morphs with the flap angle.
// ---------------------------------------------------------------------------
const FLAP_MASK_URI = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 321 241' preserveAspectRatio='none'><path d='${FLAP_PATH}' fill='black'/></svg>`
)}`;

const FlapBlur = ({
                      W,
                      flapH,
                      rotate,
                      tint,
                  }: {
    W: number;
    flapH: number;
    rotate: SharedValue<number>;
    tint: BlurTint;
}) => {
    const animatedProps = useAnimatedProps(() => ({
        intensity: interpolate(
            rotate.value,
            [ANGLE_CLOSED, ANGLE_OPEN],
            [BLUR_MIN, BLUR_MAX],
            Extrapolation.CLAMP
        ),
    }));

    // Web: apply mask directly on the BlurView (a mask on the parent would break backdrop-filter)
    if (Platform.OS === "web") {
        const mask = {
            maskImage: `url("${FLAP_MASK_URI}")`,
            WebkitMaskImage: `url("${FLAP_MASK_URI}")`,
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
        } as any;

        return (
            <AnimatedBlurView
                animatedProps={animatedProps}
                tint={tint}
                style={[StyleSheet.absoluteFill, mask]}
            />
        );
    }

    // Native: MaskedView with the flap path as the mask
    return (
        <MaskedView
            style={StyleSheet.absoluteFill}
            maskElement={
                <Svg
                    width={W + MASK_BLEED}
                    height={flapH}
                    viewBox="0 0 321 241"
                    preserveAspectRatio="none"
                >
                    <Path d={FLAP_PATH} fill="#000"/>
                </Svg>
            }
        >
            <AnimatedBlurView
                animatedProps={animatedProps}
                tint={tint}
                blurMethod="dimezisBlurView"
                style={StyleSheet.absoluteFill}
            />
        </MaskedView>
    );
};

// ---------------------------------------------------------------------------
// AnimatedCard
// ---------------------------------------------------------------------------
type Pose = { y: number; x: number; r: number };

const AnimatedCard = ({
                          theme,
                          s,
                          isOpen,
                          isHovered,
                          closed,
                          hover,
                          open,
                          delayOpen,
                          delayHover,
                      }: {
    theme: Theme;
    s: number;
    isOpen: boolean;
    isHovered: boolean;
    closed: Pose;
    hover: Pose;
    open: Pose;
    delayOpen: number;
    delayHover: number;
}) => {
    const y = useSharedValue(closed.y * s);
    const x = useSharedValue(closed.x * s);
    const r = useSharedValue(closed.r);

    useEffect(() => {
        const target = isOpen ? open : isHovered ? hover : closed;
        const delay = isOpen ? delayOpen : isHovered ? delayHover : 0;
        const run = (v: number) => withDelay(delay, withTiming(v, TIMING));
        y.value = run(target.y * s);
        x.value = run(target.x * s);
        r.value = run(target.r);
    }, [isOpen, isHovered, s]);

    const style = useAnimatedStyle(() => ({
        transform: [
            {translateX: x.value},
            {translateY: y.value},
            {rotate: `${r.value}deg`},
        ],
    }));

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                {
                    position: "absolute",
                    left: ((BASE_WIDTH - CARD_W) / 2) * s,
                    top: ((BASE_HEIGHT - CARD_H) / 2) * s,
                    width: CARD_W * s,
                    height: CARD_H * s,
                },
                style,
            ]}
        >
            <Card theme={theme} s={s}/>
        </Animated.View>
    );
};

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------
const ROWS = Array.from({length: 9}, (_, i) => 60.99 + i * 14.118);

const Card = ({theme, s}: { theme: Theme; s: number }) => (
    <Svg width={CARD_W * s} height={CARD_H * s} viewBox="0 0 164 214">
        <Rect
            x={0.5}
            y={0.5}
            width={162.078}
            height={212.262}
            rx={19.5}
            fill={theme.cardFill}
            stroke={theme.cardStroke}
        />
        <Rect
            x={14.12}
            y={31.21}
            width={134.84}
            height={11.89}
            rx={5.94}
            fill={theme.cardLineFill}
        />
        {ROWS.map((y, i) => (
            <React.Fragment key={i}>
                <Rect
                    x={14.83}
                    y={y}
                    width={64.52}
                    height={5.88}
                    rx={2.94}
                    fill={theme.cardLineFill}
                />
                <Rect
                    x={84.43}
                    y={y}
                    width={64.52}
                    height={5.88}
                    rx={2.94}
                    fill={theme.cardLineFill}
                />
            </React.Fragment>
        ))}
    </Svg>
);
