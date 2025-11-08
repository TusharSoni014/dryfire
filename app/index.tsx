import { Asset } from "expo-asset";
import { useEffect, useState } from "react";
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

export default function Index() {
  const [parTime, setParTime] = useState<string>("0");
  const [delayTime, setDelayTime] = useState<string>("0");
  const [numberOfReps, setNumberOfReps] = useState<string>("0");
  const [goldImageUri, setGoldImageUri] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      const asset = Asset.fromModule(require("@/assets/gold.png"));
      await asset.downloadAsync();
      setGoldImageUri(asset.localUri || asset.uri);
    };
    loadImage();
  }, []);

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
            Elapsed Time (HH:MM:SS)
          </Text>
          <Text className="text-black text-center px-2 py-0.5 text-4xl font-bold">
            00:00:00
          </Text>
        </View>
        <View className=" bg-white flex-1 rounded-r">
          <Text className="text-black text-center px-2 py-0.5">
            Rep (Seconds)
          </Text>
          <Text className="text-black text-center px-2 py-0.5 text-4xl font-bold">
            0
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
