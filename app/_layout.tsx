import Colors from '@/constants/Colors';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import db from "@/database/database";
import React from 'react';
import { ToastProvider } from '@/contexts/ToastContext';
import { ExportTypeProvider } from '@/contexts/ExportTypeContext';
import { WordsContextProvider } from '@/contexts/WordsContext';
import Data from './(tabs)';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [loaded, error] = useFonts({
    "inter-r": require("../assets/fonts/Inter-Regular.ttf"),
    "inter-b": require("../assets/fonts/Inter-Bold.ttf"),
    "inter-sm": require("../assets/fonts/Inter-SemiBold.ttf"),
    "inter-el": require("../assets/fonts/Inter-ExtraLight.ttf"),
    "inter-eli": require("../assets/fonts/Inter-ExtraLightItalic.otf"),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(`
          CREATE TABLE IF NOT EXISTS words (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
          word TEXT, 
          pronunciation TEXT,
          language TEXT,
          plural TEXT,
          partOfSpeech TEXT,
          thematicGroup TEXT,
          meaning TEXT,
          etymology TEXT,
          dateAdded DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        [],
        (tx, result) => {
          console.log("Created table:", result);
          return true;
        },
        (tx, error) => {
          console.log("Could not create table:", error);
          return true;
        },
      );
    });

    db.transaction(tx => {
      tx.executeSql(`
          CREATE TABLE IF NOT EXISTS words_archive (
          id INTEGER NOT NULL, 
          word TEXT, 
          pronunciation TEXT,
          language TEXT,
          plural TEXT,
          partOfSpeech TEXT,
          thematicGroup TEXT,
          meaning TEXT,
          etymology TEXT,
          dateAdded DATETIME,
          dateArchived DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id)
        )`,
        [],
        (tx, result) => {
          console.log("Created archive table:", result);
          return true;
        },
        (tx, error) => {
          console.log("Could not create archive table:", error);
          return true;
        },
      );
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <WordsContextProvider>
      <ExportTypeProvider>
        <ToastProvider>
          <RootLayoutNav />
        </ToastProvider>
      </ExportTypeProvider>
    </WordsContextProvider>
  );
}

const RootLayoutNav = () => {
  return (
    <View style={{flex: 1, backgroundColor: Colors.primary}}>
      <Stack>
        <Stack.Screen 
          name="(tabs)"
          options={{ 
            headerShown: false, 
          }}
        />
        <Stack.Screen 
          name="(cards)/add"
          options={{
            title: "Add",
            presentation: "card",
          }}
        />
        <Stack.Screen 
          name="(cards)/deleteMultiple"
          options={{
            title: "DeleteMultiple",
            presentation: "card",
          }}
        />
        <Stack.Screen 
          name="(cards)/edit"
          options={{
            title: "Edit",
            presentation: "card",
          }}
          initialParams={{ idProp: "" }}
        />
        <Stack.Screen 
          name="(cards)/view"
          options={{
            title: "Edit",
            presentation: "card",
          }}
          initialParams={{ idProp: "" }}
        />
        <Stack.Screen 
          name="(cards)/settings"
          options={{
            title: "Settings",
            presentation: "card",
          }}
        />
        <Stack.Screen 
          name="(modals)/sort"
          options={{
            title: "Sort",
            presentation: "modal",
          }}
        />
      </Stack>
    </View>
  );
}

export default RootLayout;
