import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="dark">
      <StatusBar style="light" backgroundColor="#000000" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#000000",
          },
          headerTintColor: "#ffffff",
        }}
      >
        <Stack.Screen name="index" options={{ title: "DRYFIRE 🔥🎯" }} />
      </Stack>
    </GluestackUIProvider>
  );
}
