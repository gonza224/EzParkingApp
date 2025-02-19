import React, { FC, useEffect, useRef } from 'react';
import { View, ViewStyle, TextStyle, Animated } from "react-native";
import { Button, Text } from "app/components";
import MapView, { Marker } from 'app/components/mymap';
import { AppStackScreenProps } from "../../navigators";
import { useStores } from "../../models";
import { FiX } from "react-icons/fi";
import { colors, spacing } from 'app/theme';
import { customMapStyle } from "./MapScreen";
import Constants from 'expo-constants';

interface ParkingSpotScreenProps extends AppStackScreenProps<"parkingSpot"> { }
export const ParkingSpotScreen: FC<ParkingSpotScreenProps> = (props) => {
    const { userStateStore } = useStores();
    const { navigation } = props;

    const centerLoc = {
        latitude: userStateStore.selectedParkingSpot?.latitude || 0,
        longitude: userStateStore.selectedParkingSpot?.longitude || 0,
    };

    // const mapApiKey = "";
    const { mapApiKey } = Constants.manifest.extra;

    const handleSpotRelease = () => {
        userStateStore.resetParkingState();
        navigation.navigate("home");
    };

    // Pulsating animation setup
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [pulseAnim]);

    const scale = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 3],
    });

    const opacity = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.2, 0],
    });

    return (
        <View style={$container}>
            <View style={$topContainer}>
                <Button
                    style={$backButtonContainer}
                    onPress={handleSpotRelease}
                >
                    <FiX style={{ marginTop: 3 }} fontSize={spacing.lg} />
                </Button>

                <MapView
                    provider="google"
                    googleMapsApiKey={mapApiKey}
                    rotateEnabled={false}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    initialCamera={{
                        zoom: 24,
                        center: centerLoc,
                    }}
                    options={{
                        mapTypeControl: false,
                        fullscreenControl: false,
                        rotateEnabled: false,
                        streetViewControl: false,
                        zoomControl: false,
                        gestureHandling: "none",
                        styles: customMapStyle,
                    }}
                    loadingFallback={
                        <View>
                            <Text>Loading...</Text>
                        </View>
                    }
                    style={$mapContainer}
                >
                    <Marker
                        coordinate={centerLoc}
                        anchor={{ x: 0.5, y: 0.09 }}
                    >
                        <View style={$markerContainer}>
                            <Animated.View
                                style={[
                                    $pulseCircle,
                                    { transform: [{ scale }], opacity },
                                ]}
                            />
                            <View style={$markerCircle}>
                                <Text style={$ParkingSpotMarkerText}>Parked</Text>
                            </View>
                        </View>
                    </Marker>
                </MapView>
                <Button
                    style={$actionButton}
                    preset="reversed"
                    onPress={handleSpotRelease}
                >
                    I'm done with the spot
                </Button>
            </View>
        </View>
    );
};

const $container: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
};

const $topContainer: ViewStyle = {
    flex: 1,
    position: 'relative',
    marginBottom: -30,
};

const $backButtonContainer: ViewStyle = {
    position: 'absolute',
    top: 16,
    left: 12,
    zIndex: 1,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 0,
};

const $mapContainer: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
    transform: [{ scale: 2 }],
};

const $actionButton: ViewStyle = {
    marginLeft: 12,
    marginRight: 12,
    bottom: 40,
    left: 0,
    right: 0,
    position: 'absolute',
    minHeight: 65,
    zIndex: 2,
    borderRadius: 16,
    marginVertical: spacing.md,
};

const $markerContainer: ViewStyle = {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
};

const $pulseCircle: ViewStyle = {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.palette.good,
};

const $markerCircle: ViewStyle = {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.palette.good,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#7c7c7c",
    borderWidth: 4,
};

const $ParkingSpotMarkerText: TextStyle = {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
};

export default ParkingSpotScreen;
