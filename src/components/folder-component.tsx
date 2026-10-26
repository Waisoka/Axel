import React, {useEffect, useState} from "react";
import {Platform, Pressable, View, ViewStyle, StyleProp} from "react-native";
import Svg, {Path, Rect} from "react-native-svg";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing,
} from "react-native-reanimated";
import {Text} from "@/components/ui/text";

// ---------------------------------------------------------------------------
// Themes
// Color tokens for the folder back, flap (glass layer), and the paper cards.
// ---------------------------------------------------------------------------
const themes = {
    black: {
        backFill: "#000000",
        backBorder: "rgba(255,255,255,0.37)",
        flapFill: "#292929",
        flapFillOpacity: 0.25,
        flapStroke: "#979797",
        cardFill: "#F1F1F1",
        cardStroke: "#E0E0E0",
        cardLineFill: "#D4D4D4",
    },
    white: {
        backFill: "#ffffff",
        backBorder: "rgba(178,178,178,0.25)",
        flapFill: "#f5f5f5",
        flapFillOpacity: 0.85,
        flapStroke: "#d4d4d4",
        cardFill: "#262626",
        cardStroke: "#404040",
        cardLineFill: "#737373",
    },
    blue: {
        backFill: "#50B1FD",
        backBorder: "rgba(255,255,255,0.35)",
        flapFill: "#3a9ae8",
        flapFillOpacity: 0.45,
        flapStroke: "#7ec8ff",
        cardFill: "#F1F1F1",
        cardStroke: "#E0E0E0",
        cardLineFill: "#D4D4D4",
    },
} as const;

type Theme = (typeof themes)[keyof typeof themes];

// ---------------------------------------------------------------------------
// Size & layout constants
// All geometry is authored at base size and multiplied by the size scale.
// ---------------------------------------------------------------------------
const sizeScales = {sm: 0.65, md: 1, lg: 1.35} as const;

const BASE_WIDTH = 321; // Folder back width
const BASE_HEIGHT = 270; // Folder back height
const CARD_W = 164; // Paper card width
const CARD_H = 214; // Paper card height
const FLAP_H = 241; // Front flap height

// Extra SVG viewBox padding so strokes are never clipped at the edges
const PAD = 2;
const STROKE_W = 1.5; // Flap stroke width

// SVG path of the front flap (rounded rectangle with the tab notch)
const FLAP_PATH =
    "M0 25C0 11.1929 11.1929 0 25 0H136.084C143.044 0 149.689 2.90139 154.42 8.00608L178.08 33.5343C182.811 38.639 189.456 41.5404 196.416 41.5404H296C309.807 41.5404 321 52.7333 321 66.5404V216C321 229.807 309.807 241 296 241H25C11.1929 241 0 229.807 0 216V25Z";

// ---------------------------------------------------------------------------
// Animation config
// Timing with ease-out and no overshoot, so cards never bounce through the folder.
// ---------------------------------------------------------------------------
const DURATION = 600;
const TIMING = {
    duration: DURATION,
    easing: Easing.bezier(0.22, 1, 0.36, 1),
};

type FolderProps = {
    color?: "black" | "white" | "blue";
    size?: "sm" | "md" | "lg";
    style?: StyleProp<ViewStyle>;
};

// ---------------------------------------------------------------------------
// Folder (root component)
// ---------------------------------------------------------------------------
export const Folder = ({color = "black", size = "md", style}: FolderProps) => {
    // Resolve theme and size scale
    const theme = themes[color] ?? themes.black;
    const s = sizeScales[size];

    // Interaction state: hover/press-hold and toggled open
    const [isHovered, setIsHovered] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Scaled dimensions
    const W = BASE_WIDTH * s;
    const H = BASE_HEIGHT * s;
    const flapH = FLAP_H * s;

    // Flap rotation angle (degrees around the X axis)
    const flapRotate = useSharedValue(-15);

    // Animate flap angle: closed -15, hover -45, open -55
    useEffect(() => {
        flapRotate.value = withTiming(
            isOpen ? -55 : isHovered ? -45 : -15,
            TIMING
        );
    }, [isOpen, isHovered]);

    // 3D transform for the flap, pivoting around its vertical center
    const flapStyle = useAnimatedStyle(() => ({
        transform: [
            {perspective: 800 * s},
            {translateY: flapH / 2},
            {rotateX: `${flapRotate.value}deg`},
            {translateY: -flapH / 2},
        ],
    }));

    // Clip area for cards: only the bottom edge of the back clips them,
    // the other sides are oversized so cards can rise freely
    const CLIP_X = W;
    const CLIP_TOP = H * 2;

    // Props shared by all cards
    const cardProps = {theme, s, isOpen, isHovered};

    return (
        // Outer container (centers the folder)
        <View
            style={[{alignItems: "center", justifyContent: "center"}, style]}
        >
            {/* Touch target: hover on web/pointer devices, press-hold and tap on mobile */}
            <Pressable
                onHoverIn={() => setIsHovered(true)}
                onHoverOut={() => {
                    setIsHovered(false);
                    setIsOpen(false);
                }}
                onPressIn={() => setIsHovered(true)}
                onPressOut={() => setIsHovered(false)}
                onPress={() => setIsOpen((o) => !o)}
                style={{width: W, height: H}}
            >
                {/* Back panel: scaled through the SVG viewBox (no transform scale) to keep borders sharp */}
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
                    {/* Backfill */}
                    <Rect
                        x={0}
                        y={0}
                        width={BASE_WIDTH}
                        height={BASE_HEIGHT}
                        rx={25}
                        fill={theme.backFill}
                    />
                    {/* Back border, drawn as a separate unfilled layer inside the shape */}
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

                {/* Cards layer: clipped at the back's bottom edge so papers never poke through */}
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
                    {/* Re-anchor to the folder's origin inside the oversized clip box */}
                    <View
                        style={{
                            position: "absolute",
                            left: CLIP_X,
                            top: CLIP_TOP,
                            width: W,
                            height: H,
                        }}
                    >
                        {/* Card 1 (right) */}
                        <AnimatedCard
                            {...cardProps}
                            closed={{y: -10, x: 40, r: 10}}
                            hover={{y: -30, x: 40, r: 14}}
                            open={{y: -160, x: 70, r: 18}}
                            delayOpen={60}
                            delayHover={30}
                        />
                        {/* Card 2 (center) */}
                        <AnimatedCard
                            {...cardProps}
                            closed={{y: -20, x: 3, r: 2}}
                            hover={{y: -35, x: 3, r: -1}}
                            open={{y: -180, x: 0, r: -3}}
                            delayOpen={30}
                            delayHover={15}
                        />
                        {/* Card 3 (left) */}
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

                {/* Front flap: rotates in 3D, drawn above the cards */}
                <Animated.View
                    pointerEvents="none"
                    renderToHardwareTextureAndroid
                    style={[
                        {
                            position: "absolute",
                            left: 0,
                            top: ((BASE_HEIGHT - FLAP_H) / 2 + 16) * s,
                            width: W,
                            height: flapH,
                        },
                        // Promote to its own compositing layer on web
                        Platform.OS === "web"
                            ? ({willChange: "transform"} as any)
                            : null,
                        flapStyle,
                    ]}
                >
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
                        {/* Flap shape: translucent fill + stroke */}
                        <Path
                            d={FLAP_PATH}
                            fill={theme.flapFill}
                            fillOpacity={theme.flapFillOpacity}
                            stroke={theme.flapStroke}
                            strokeWidth={STROKE_W}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                    </Svg>
                </Animated.View>
            </Pressable>
        </View>
    );
};

export default Folder;

// ---------------------------------------------------------------------------
// AnimatedCard
// A single paper card that moves between closed / hover / open poses.
// ---------------------------------------------------------------------------

// Card pose: x/y offset (base units) and rotation in degrees
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
    // Animated position and rotation (size scales offsets)
    const y = useSharedValue(closed.y * s);
    const x = useSharedValue(closed.x * s);
    const r = useSharedValue(closed.r);

    // Animate toward the pose that matches the current state
    useEffect(() => {
        const target = isOpen ? open : isHovered ? hover : closed;
        // Small stagger when opening/hovering; no delay when closing, so all cards retract together
        const delay = isOpen ? delayOpen : isHovered ? delayHover : 0;
        const run = (v: number) => withDelay(delay, withTiming(v, TIMING));
        y.value = run(target.y * s);
        x.value = run(target.x * s);
        r.value = run(target.r);
    }, [isOpen, isHovered, s]);

    // Apply animated transform
    const style = useAnimatedStyle(() => ({
        transform: [
            {translateX: x.value},
            {translateY: y.value},
            {rotate: `${r.value}deg`},
        ],
    }));

    return (
        // Card wrapper: centered inside the folder, then offset by the animated transform
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
// Static paper artwork: rounded sheet, title bar, and two columns of text lines.
// ---------------------------------------------------------------------------

// Y positions of the 9 text rows
const ROWS = Array.from({length: 9}, (_, i) => 60.99 + i * 14.118);

const Card = ({theme, s}: { theme: Theme; s: number }) => (
    <Svg width={CARD_W * s} height={CARD_H * s} viewBox="0 0 164 214">
        {/* Paper sheet */}
        <Rect
            x={0.5}
            y={0.5}
            width={162.078}
            height={212.262}
            rx={19.5}
            fill={theme.cardFill}
            stroke={theme.cardStroke}
        />
        {/* Title bar */}
        <Rect
            x={14.12}
            y={31.21}
            width={134.84}
            height={11.89}
            rx={5.94}
            fill={theme.cardLineFill}
        />
        {/* Text rows: left and right columns */}
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