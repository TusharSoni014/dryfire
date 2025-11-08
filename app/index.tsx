import { Button, ButtonText } from "@/components/ui/button";
import { Ionicons } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import { AudioPlayer, useAudioPlayer } from "expo-audio";
import { useEffect, useRef, useState } from "react";
import { Dimensions, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Defs,
  Image,
  Mask,
  Pattern,
  Rect,
  Text as SvgText,
} from "react-native-svg";

type TimerState = "idle" | "running" | "paused";
type RepPhase = "delay" | "active"; // delay = waiting to start, active = doing the rep

export default function Index() {
  const [parTime, setParTime] = useState<string>("0");
  const [delayTime, setDelayTime] = useState<string>("0");
  const [numberOfReps, setNumberOfReps] = useState<string>("0");
  const [goldImageUri, setGoldImageUri] = useState<string | null>(null);

  // Timer states
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [elapsedTime, setElapsedTime] = useState<number>(0); // in milliseconds
  const [currentRep, setCurrentRep] = useState<number>(0);
  const [repPhase, setRepPhase] = useState<RepPhase>("delay");
  const [phaseStartTime, setPhaseStartTime] = useState<number>(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Audio players
  const chaloPlayer = useAudioPlayer(require("@/assets/chalo.mp3"));
  const rukoPlayer = useAudioPlayer(require("@/assets/ruko.mp3"));

  // Load image asset
  useEffect(() => {
    const loadImage = async () => {
      const asset = Asset.fromModule(require("@/assets/gold.png"));
      await asset.downloadAsync();
      setGoldImageUri(asset.localUri || asset.uri);
    };
    loadImage();
  }, []);

  // Calculate total time needed
  const getTotalTime = (): number => {
    const par = parseFloat(parTime) || 0;
    const delay = parseFloat(delayTime) || 0;
    const reps = parseInt(numberOfReps) || 0;
    // Total = (delay + par) * reps (delay before each rep, then the rep itself)
    return reps > 0 ? (delay + par) * reps : 0;
  };

  // Play sound helper
  const playSound = (player: AudioPlayer) => {
    try {
      player.seekTo(0);
      player.play();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  // Timer effect with rep progression
  useEffect(() => {
    if (timerState === "running") {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        setElapsedTime(elapsed);

        // Check if we need to transition phases or reps
        const par = parseFloat(parTime) || 0;
        const delay = parseFloat(delayTime) || 0;
        const totalReps = parseInt(numberOfReps) || 0;
        const phaseElapsed = (elapsed - phaseStartTime) / 1000;

        if (repPhase === "delay" && phaseElapsed >= delay) {
          // Transition from delay to active rep
          setRepPhase("active");
          setPhaseStartTime(elapsed);
          playSound(chaloPlayer); // Say "chalo" when rep starts
        } else if (repPhase === "active" && phaseElapsed >= par) {
          // Transition from active rep to next delay (or finish)
          if (currentRep < totalReps) {
            setCurrentRep((prev) => prev + 1);
            setRepPhase("delay");
            setPhaseStartTime(elapsed);
            playSound(rukoPlayer); // Say "ruko" when rep ends
          } else {
            // All reps completed
            handleStop();
          }
        }
      }, 10);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    timerState,
    repPhase,
    phaseStartTime,
    currentRep,
    parTime,
    delayTime,
    numberOfReps,
    chaloPlayer,
    rukoPlayer,
  ]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const getTimeLeft = (): number => {
    const totalTime = getTotalTime() * 1000; // Convert to ms
    const timeLeft = totalTime - elapsedTime;
    return Math.max(0, timeLeft);
  };

  const getCurrentPhaseTime = (): number => {
    if (timerState === "idle" || currentRep === 0) return 0;
    const phaseElapsed = (elapsedTime - phaseStartTime) / 1000;
    return Math.max(0, phaseElapsed);
  };

  const handleStart = () => {
    const totalReps = parseInt(numberOfReps) || 0;
    if (totalReps === 0) return;

    if (timerState === "idle") {
      // Starting fresh - always start with delay phase for positioning
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      setElapsedTime(0);
      setCurrentRep(1);
      setPhaseStartTime(0);
      setRepPhase("delay"); // Always start with delay to give time to position
      setTimerState("running");
    } else if (timerState === "paused") {
      // Resuming from pause
      const pauseDuration = Date.now() - pausedTimeRef.current;
      startTimeRef.current += pauseDuration;
      setTimerState("running");
    }
  };

  const handlePause = () => {
    if (timerState === "running") {
      pausedTimeRef.current = Date.now();
      setTimerState("paused");
    }
  };

  const handleStop = () => {
    setTimerState("idle");
    setElapsedTime(0);
    setCurrentRep(0);
    setPhaseStartTime(0);
    setRepPhase("delay");
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <SafeAreaView
      className="flex-1 w-full h-full bg-black text-white"
      edges={["bottom"]}
    >
      <View className="w-full items-center justify-center p-3">
        {goldImageUri && (
          <Svg width={Dimensions.get("window").width} height={80}>
            <Defs>
              <Pattern
                id="goldPattern"
                patternUnits="userSpaceOnUse"
                width="100"
                height="100"
                x="0"
                y="0"
              >
                <Image
                  href={goldImageUri}
                  width="200"
                  height="100"
                  preserveAspectRatio="xMidYMid slice"
                />
              </Pattern>
              <Mask id="textMask">
                <Rect width="100%" height="100%" fill="black" />
                <SvgText
                  x="50%"
                  y="50%"
                  fontSize="36"
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fill="white"
                >
                  Target Olympic Gold🪙
                </SvgText>
              </Mask>
            </Defs>
            <Rect
              width="100%"
              height="100%"
              fill="url(#goldPattern)"
              mask="url(#textMask)"
            />
          </Svg>
        )}
      </View>
      <View className="flex-col justify-start items-start gap-3 p-3">
        <View className="w-full">
          <Text className="text-white text-xl">Par Time:</Text>
          <TextInput
            className="text-white text-xl border border-white/30 rounded-md p-2 w-full"
            keyboardType="numeric"
            placeholder="0.00"
            value={parTime}
            onChangeText={(text) => {
              const numericValue = text.replace(/[^0-9.]/g, "");
              setParTime(numericValue);
            }}
          />
        </View>
        <View className="w-full">
          <Text className="text-white text-xl">Delay Time:</Text>
          <TextInput
            className="text-white text-xl border border-white/30 rounded-md p-2 w-full"
            keyboardType="numeric"
            placeholder="0.00"
            value={delayTime}
            onChangeText={(text) => {
              const numericValue = text.replace(/[^0-9.]/g, "");
              setDelayTime(numericValue);
            }}
          />
        </View>
        <View className="w-full">
          <Text className="text-white text-xl">Number of Reps:</Text>
          <TextInput
            className="text-white text-xl border border-white/30 rounded-md p-2 w-full"
            keyboardType="numeric"
            placeholder="0.00"
            value={numberOfReps}
            onChangeText={(text) => {
              const numericValue = text.replace(/[^0-9.]/g, "");
              setNumberOfReps(numericValue);
            }}
          />
        </View>
      </View>
      <View className="w-full p-3 flex-row">
        <View className=" bg-white flex-1 rounded-l">
          <Text className="text-black text-center px-2 py-0.5">
            Time Left (HH:MM:SS)
          </Text>
          <Text className="text-black text-center px-2 py-0.5 text-4xl font-bold">
            {formatTime(getTimeLeft())}
          </Text>
        </View>
        <View className=" bg-white flex-1 rounded-r">
          <Text className="text-black text-center px-2 py-0.5">
            Rep {currentRep}/{numberOfReps || 0} -{" "}
            {repPhase === "delay" ? "Delay" : "Active"} (
            {getCurrentPhaseTime().toFixed(2)}s)
          </Text>
          <Text className="text-black text-center px-2 py-0.5 text-4xl font-bold">
            {currentRep > 0 ? currentRep : "-"}
          </Text>
        </View>
      </View>
      <View className="w-full flex-row justify-center items-center gap-3 p-3">
        <Button
          onPress={handleStart}
          disabled={timerState === "running"}
          className={timerState === "running" ? "opacity-50" : ""}
        >
          <Ionicons name="play" size={20} color="black" />
          <ButtonText>Start</ButtonText>
        </Button>
        <Button
          variant="outline"
          className="border-red-500"
          onPress={handleStop}
          disabled={timerState === "idle"}
        >
          <Ionicons name="stop" size={20} color="#ef4444" />
          <ButtonText className="text-red-500">Stop</ButtonText>
        </Button>
        <Button
          className="bg-yellow-500"
          onPress={handlePause}
          disabled={timerState !== "running"}
        >
          <Ionicons name="pause" size={20} color="white" />
          <ButtonText className="text-white">Pause</ButtonText>
        </Button>
      </View>
    </SafeAreaView>
  );
}
