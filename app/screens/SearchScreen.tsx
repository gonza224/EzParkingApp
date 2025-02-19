import React, { FC, useEffect, useRef } from "react";
import { Animated, View, ViewStyle, Easing } from "react-native";
import { TextField, Button } from "app/components";
import { useStores } from "../models";
import { colors, spacing } from "../theme";
import { AppStackScreenProps } from "../navigators";
import { TextInput } from "react-native-gesture-handler";
import { FiArrowLeft } from "react-icons/fi";
import { LocationList } from "app/components/Location/LocationList";
import { LocationCard } from "app/components/Location/LocationCard";
import { locations, Location } from "../data/locations";
import { FiMapPin } from "react-icons/fi";

interface SearchScreenProps extends AppStackScreenProps<"search"> { }

export const SearchScreen: FC<SearchScreenProps> = ({ navigation }) => {
    const { userStateStore } = useStores();

    const easeInPosition = useRef(new Animated.Value(300)).current; // Start 300px from top
    const easeInOpacity = useRef(new Animated.Value(0)).current; // Start 300px from top

    const textFieldRef = useRef<TextInput>(null);

    useEffect(() => {
        // Animate the TextField to the top with Gaussian-like ease-in-out effect
        Animated.timing(easeInPosition, {
            toValue: 0, // Move to the top
            duration: 200, // Adjust the duration to suit the effect
            easing: Easing.inOut(Easing.ease), // Apply ease-in-out Gaussian-like animation
            useNativeDriver: false, // Set to false for layout-related animation
        }).start(() => {
            // Focus the TextField when the animation finishes
            if (textFieldRef.current) {
                textFieldRef.current.focus();
            }
        });

        Animated.timing(easeInOpacity, {
            toValue: 1, // Move to the top
            duration: 700, // Adjust the duration to suit the effect
            easing: Easing.inOut(Easing.ease), // Apply ease-in-out Gaussian-like animation
            useNativeDriver: false, // Set to false for layout-related animation
        }).start();
    }, []);

    const handlePress = (item: Location) => {
        userStateStore.setSelectedDestination(item);
        navigation.navigate("map");
    }

    return (
        <View style={$container}>
            <View style={$searchContainer}>
                <View style={$leftContainer}>
                    <Button
                        style={$backButton}
                        onPress={() => navigation.goBack()}
                        LeftAccessory={(props) => <FiArrowLeft fontSize={spacing.lg} />}
                    />
                </View>

                <Animated.View style={[{ transform: [{ translateY: easeInPosition }], },
                    $animatedContainer]}>
                    <TextField
                        ref={textFieldRef}
                        defaultValue={userStateStore.searchQuery}
                        onChangeText={(text) => userStateStore.setSearchQuery(text)}
                        placeholderTx="home.searchPlaceholder"
                    />
                </Animated.View>
            </View>
            <View style={$listContainer}>
                {/* <LocationList locations={locations} animations={{ easeInOpacity, easeInPosition }}
                    handlePress={handlePress} /> */}
                <LocationList
                    locations={locations}
                    handlePress={handlePress}
                    renderItem={(item, index, animations) => (
                        <LocationCard
                            title={item.title}
                            subtitle={item.subtitle}
                            icon={<FiMapPin style={{ margin: 'auto 0px', paddingTop: '0px' }} />}
                        />
                    )}
                />

            </View >
        </View>
    );
};

const $container: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
};

const $leftContainer: ViewStyle = {
    justifyContent: "center",
    alignItems: "flex-start", // Align the button to the left
    width: 50, // Set a fixed width for the button container
};

const $backButton: ViewStyle = {
    backgroundColor: "transparent",
    borderColor: "transparent",
    alignSelf: "stretch",
    paddingHorizontal: 0,
    paddingVertical: 0,
    flexDirection: 'column',
    width: "100%"
};

const $searchContainer: ViewStyle = {
    flexDirection: "row", // Ensure the button and text field are laid out horizontally
    alignItems: "flex-start",
    marginTop: spacing.lg,
    width: '100%',
};

const $listContainer: ViewStyle = {
    flex: 1,
    marginTop: spacing.md,
};

const $animatedContainer: ViewStyle = {
    flex: 1, // Take up the rest of the space for the TextField
    paddingRight: spacing.lg,
};