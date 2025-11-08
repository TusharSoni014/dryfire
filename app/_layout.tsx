import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#000000" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#000000",
          },
          headerTintColor: "#ffffff",
        }}
      >
        <Stack.Screen name="index" options={{ title: "DRYFIRE🔥🎯" }} />
      </Stack>
    </>
  );
}
