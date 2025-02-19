import { observer, Observer } from "mobx-react-lite";
import { View, ViewStyle } from "react-native";
import { Button, Text } from "app/components";
import React, { FC, useRef, useEffect } from "react";
import MapView, { Marker, Callout } from 'app/components/mymap';
import { FiArrowLeft, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { AppStackScreenProps } from "../../navigators";
import { colors, spacing } from "../../theme";
import { customMapStyle } from "./MapScreen";
import { useStores } from "../../models";
import { parkingLotsMap } from "../../data/parkingLotMapping";
import ParkingSpotMarker from "app/components/Marker/ParkingSpotMarker";
import { calculateCentroid, getLocationsBounds } from "app/utils/locationCalc";
import Constants from 'expo-constants';

enum Mode {
    Left,
    Right
};

export interface Spot {
    isReserved: boolean;
    latitude: number;
    longitude: number;
}


interface ParkingLotScreenProps extends AppStackScreenProps<"parkingLot"> { }
export const ParkingLotScreen: FC<ParkingLotScreenProps> = observer(function ParkingLotScreen(_props) {

    const mapView = useRef<MapView>(null);
    const markerRefs = useRef<MapView.Marker[]>([]);

    const { userStateStore } = useStores();
    const { navigation } = _props;

    const selectedLotTitle = userStateStore.preSelectedParkingLot;

    const selectedParkingLot = parkingLotsMap.find((parkingLot) => parkingLot.title == selectedLotTitle);

    if (!selectedParkingLot) navigation.goBack();

    const parkingSpots = selectedParkingLot?.spots?.map((spot, index) => ({
        ...spot,
        isReserved: Math.random() < 0.5,
    })) || [];


    const focusParkingSpot = (index: number, parkingSpot: Spot) => {
        if (mapView.current)
            mapView.current.setCamera({
                zoom: 22,
                center: parkingSpot,
            })

        markerRefs.current.forEach(marker => marker.hideCallout());
        markerRefs.current[index]?.showCallout();
    }

    const availableIndices = parkingSpots
        .reduce((indices: number[], spot, index) => {
            if (!spot.isReserved) indices.push(index);
            return indices;
        }, []);

    if (parkingSpots && parkingSpots.length > 0) {
        userStateStore.setSelectedParkingSpot({ index: availableIndices[0], ...parkingSpots[availableIndices[0]] });
        focusParkingSpot(availableIndices[0], parkingSpots[availableIndices[0]]);
    }

    const centroidLocation = calculateCentroid(parkingSpots ?? []);

    const initialRegion = {
        latitude: selectedParkingLot?.latitude || 0,
        longitude: selectedParkingLot?.longitude || 0
    }

    // const mapApiKey = "";
    const { mapApiKey } = Constants.manifest.extra;

    const handleSpotPress = (index: number) => {
        if (!availableIndices.includes(index)) return;

        userStateStore.setSelectedParkingSpot({ index, ...parkingSpots[index] });
        focusParkingSpot(index, parkingSpots[index]);
    }

    const handleChangeSpotPress = (mode: Mode) => {
        const spotsLength = availableIndices.length;
        if (spotsLength === 0) return;

        const currentIndexInAvailable = availableIndices.findIndex(
            (index) => index === userStateStore.selectedParkingSpot?.index
        );

        const newIndexInAvailable =
            (currentIndexInAvailable + (mode === Mode.Left ? -1 : 1) + spotsLength) % spotsLength;

        const newSpotIndex = availableIndices[newIndexInAvailable];
        userStateStore.setSelectedParkingSpot({ index: newSpotIndex, ...parkingSpots[newSpotIndex] });

        focusParkingSpot(newSpotIndex, parkingSpots[newSpotIndex]);
    };


    const { minLat, maxLat, minLng, maxLng } = getLocationsBounds(parkingSpots || []);
    const handleRegionChangeComplete = (region: any) => {
        const constrainedRegion = {
            latitude: Math.max(minLat, Math.min(region.latitude, maxLat)),
            longitude: Math.max(minLng, Math.min(region.longitude, maxLng)),
            latitudeDelta: 0,
            longitudeDelta: 0,
        };

        mapView.current?.animateToRegion(constrainedRegion, 100);
    };

    const handleMapReady = () => {
        markerRefs.current[availableIndices[0]]?.showCallout();
    }

    useEffect(() => {
        const observer = new MutationObserver(() => {
            const closeButton = document.querySelector(".gm-ui-hover-effect");
            if (closeButton) {
                (closeButton as HTMLElement).style.display = "none";
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, []);


    return (
        <View style={$container}>
            <View style={$topContainer}>
                <Button
                    style={$backButtonContainer}
                    onPress={() => navigation.goBack()}
                >
                    <FiArrowLeft style={{ marginTop: 3 }} fontSize={spacing.lg} />
                </Button>

                <MapView
                    ref={mapView}
                    provider="google"
                    googleMapsApiKey={mapApiKey}
                    rotateEnabled={false}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    initialRegion={initialRegion}
                    initialCamera={{
                        zoom: 22,
                        center: availableIndices.length > 0 ? parkingSpots[availableIndices[0]] : centroidLocation
                    }}
                    options={{
                        mapTypeControl: false,
                        fullscreenControl: false,
                        rotateEnabled: false,
                        streetViewControl: false,
                        zoomControl: false,
                        styles: customMapStyle,
                    }}
                    loadingFallback={
                        <View>
                            <Text>Loading...</Text>
                        </View>
                    }
                    onRegionChangeComplete={handleRegionChangeComplete}
                    style={$mapContainer}
                    onMapReady={handleMapReady}
                >
                    {parkingSpots?.map((spot, index) => (
                        <Marker
                            ref={(ref: Marker) => (markerRefs.current[index] = ref!)}
                            key={index}
                            coordinate={{
                                latitude: spot.latitude,
                                longitude: spot.longitude,
                            }}
                            title={index + 1}
                            onPress={() => handleSpotPress(index)}
                            anchor={{ x: 0.5, y: -0.5 }}
                        >
                            <ParkingSpotMarker
                                spot={spot}
                                shouldReScale={true}
                                text={index + 1 + ""}
                            />
                            {!spot.isReserved && (
                                <Callout style={{ height: 0 }}>
                                    <View
                                        style={{
                                            minWidth: 180,
                                            minHeight: 120,
                                            padding: spacing.md,
                                            paddingHorizontal: spacing.sm,
                                            rowGap: spacing.sm
                                        }}>
                                        <Text size="sm" weight="bold"
                                            accessibilityLabel="Location">
                                            Parking Spot Info.
                                        </Text>

                                        <Text size="sm" accessibilityLabel="Location">
                                            🏪 Pay at Meter or Parking Station
                                        </Text>

                                        <Text size="sm" accessibilityLabel="Location">
                                            💰 Price per hour: $5/hr
                                        </Text>

                                        <Text size="sm" accessibilityLabel="Location">
                                            ⌚ Open 24/7
                                        </Text>

                                        <Text size="sm" accessibilityLabel="Location">
                                            💳 Methods Accepted: Card, Cash
                                        </Text>

                                        <Text size="sm" accessibilityLabel="Location">
                                            ⌛ Maximum: 2 hours
                                        </Text>
                                    </View>
                                </Callout>
                            )}
                        </Marker>
                    ))}
                </MapView>

            </View>

            <View style={$dockContainer}>
                <View style={$dock}>
                    <Button
                        onPress={() => handleChangeSpotPress(Mode.Left)}
                        style={$beforeButtonContainer}
                    >
                        <FiChevronLeft style={{ marginTop: 3 }} fontSize={spacing.lg} />
                    </Button>
                    <Observer>
                        {() =>
                            <Text weight="bold" style={{ flex: 1 }}>
                                Spot {(userStateStore.selectedParkingSpot?.index ?? 0) + 1}
                            </Text>
                        }
                    </Observer>
                    <Button
                        onPress={() => handleChangeSpotPress(Mode.Right)}
                        style={[$beforeButtonContainer, { marginRight: 0 }]}
                    >
                        <FiChevronRight style={{ marginTop: 3 }} fontSize={spacing.lg} />
                    </Button>
                </View>
                <Button style={$actionButton} preset="reversed"
                    onPress={() => navigation.navigate("parkingSpot")}>
                    🚗  Park here
                </Button>
            </View>

        </View >
    )
});

export default ParkingLotScreen;


const $actionButton: ViewStyle = {
    paddingHorizontal: 26,
    minHeight: 50,
    zIndex: 2,
    marginRight: spacing.md,
    borderRadius: 16
}

const $beforeButtonContainer: ViewStyle = {
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 0,
    marginRight: spacing.md
};

const $dock: ViewStyle = {
    backgroundColor: 'white',
    alignSelf: 'center',
    alignItems: 'center',
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginRight: spacing.md
}

const $dockContainer: ViewStyle = {
    position: 'absolute',
    bottom: 20,
    display: 'flex',
    flexDirection: 'row',
    borderRadius: 100,
    width: '100%',
    padding: 12
}

const $backButtonContainer: ViewStyle = {
    position: 'absolute',
    top: 16,
    left: 12,
    zIndex: 1,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 0
};

const $container: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
};

const $topContainer: ViewStyle = {
    flex: 1,
    position: 'relative',
    marginBottom: -30,
}

const $mapContainer: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
};