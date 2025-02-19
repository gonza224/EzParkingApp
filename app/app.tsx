/* eslint-disable import/first */
/**
 * Welcome to the main entry point of the app.
 */
if (__DEV__) {
  require("./devtools/ReactotronConfig.ts")
}

import "./utils/gestureHandler"
import "./i18n"
import "./utils/ignoreWarnings"
import { useFonts } from "expo-font"
import React from "react"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"
import * as Linking from "expo-linking"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useInitialRootStore } from "./models"
import { AppNavigator, useNavigationPersistence } from "./navigators"
import { ErrorBoundary } from "./screens/ErrorScreen/ErrorBoundary"
import * as storage from "./utils/storage"
import { customFontsToLoad } from "./theme"
import Config from "./config"

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

// Web linking configuration
const prefix = Linking.createURL("/")
const config = {
  screens: {
    Login: { path: "" },
    Home: "home",
    Demo: {
      screens: {
        DemoShowroom: { path: "showroom/:queryIndex?/:itemIndex?" },
        DemoDebug: "debug",
        DemoPodcastList: "podcast",
        DemoCommunity: "community",
      },
    },
  },
}

// Create a QueryClient instance
const queryClient = new QueryClient()

interface AppProps {
  hideSplashScreen: () => Promise<void>
}

function App(props: AppProps) {
  const { hideSplashScreen } = props
  const {
    initialNavigationState,
    onNavigationStateChange,
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY)

  const [areFontsLoaded, fontLoadError] = useFonts(customFontsToLoad)

  const { rehydrated } = useInitialRootStore(() => {
    setTimeout(hideSplashScreen, 500)
  })

  if (!rehydrated || !isNavigationStateRestored || (!areFontsLoaded && !fontLoadError)) {
    return null
  }

  const linking = {
    prefixes: [prefix],
    config,
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary catchErrors={Config.catchErrors}>
          <AppNavigator
            linking={linking}
            initialState={initialNavigationState}
            onStateChange={onNavigationStateChange}
          />
        </ErrorBoundary>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}

export default App
