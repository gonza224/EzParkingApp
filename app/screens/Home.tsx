import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { TextField, Button, Text, Card } from "app/components"
import { useStores } from "../models"
import { AppStackScreenProps } from "../navigators"
import { colors, spacing } from "../theme"
import { openLinkInBrowser } from "../utils/openLinkInBrowser"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"

const welcomeLogo = require("../../assets/images/logo.png")

interface HomeScreenProps extends AppStackScreenProps<"home"> { }

export const Home: FC<HomeScreenProps> = observer(function WelcomeScreen(_props) {

  const { navigation } = _props
  const { userStateStore } = useStores()

  const handleFocus = () => {
    navigation.navigate("search");
  };

  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])

  return (
    <View style={$container}>
      <View style={$topContainer}>
        <Image style={$welcomeLogo} source={welcomeLogo} resizeMode="contain" />
        <Text
          testID="welcome-heading"
          style={$welcomeHeading}
          tx="home.parkingMadeEz"
          preset="heading"
        />

        <TextField
          value={userStateStore.searchQuery}
          placeholderTx="home.searchPlaceholder"
          placeholderTxOptions={{ prop: "placeholder" }}
          onFocus={handleFocus}
        />
      </View>

      <View style={[$bottomContainer, $bottomContainerInsets]}>
        <Card
          preset="reversed"
          headingTx="home.infoCard.heading"
          verticalAlignment="force-footer-bottom"
          contentTx="home.infoCard.desc"
          footerTx="demoCard.useCase.verticalAlignment.reversed.footer"
          style={$infoCard}
          contentStyle={$infoCardContentStyle}
          FooterComponent={
            <Button
              testID="next-screen-button"
              preset="default"
              tx="home.infoCard.buttonTxt"
              onPress={() => openLinkInBrowser("https://ez-parking.com/")}
            />
          }
        />
      </View>
    </View>
  )
})
const $container: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const $topContainer: ViewStyle = {
  flexShrink: 1,
  flexGrow: 1,
  flexBasis: "57%",
  justifyContent: "flex-start",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.lg,
}

const $bottomContainer: ViewStyle = {
  flexShrink: 1,
  flexGrow: 0,
  flexBasis: "43%",
  backgroundColor: colors.palette.neutral100,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  paddingHorizontal: spacing.lg,
}
const $welcomeLogo: ImageStyle = {
  height: 150,
  width: "100%",
  marginBottom: spacing.xxl,
}

const $welcomeHeading: TextStyle = {
  marginBottom: spacing.lg,
}

const $infoCard: ViewStyle = {
  minHeight: 160,
  paddingVertical: 15,
  paddingHorizontal: 15,
}

const $infoCardContentStyle: TextStyle = {
  marginBottom: spacing.xl,
}
