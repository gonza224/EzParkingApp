import { observer } from "mobx-react-lite";
import React, { FC, useRef } from "react";
import { useStores } from "../../models";
import { View, ViewStyle } from "react-native";
import { Button, Text } from "app/components";
import { AppStackScreenProps, navigate } from "../../navigators";
import { colors, spacing } from "../../theme";
import MapView, { Marker } from 'app/components/mymap';
import Constants from 'expo-constants';
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { LocationList } from "app/components/Location/LocationList";
import { Location } from "../../data/locations";
import { LocationCard } from "app/components/Location/LocationCard";
import { useNearbyParkingLots } from "app/hooks/useNearbyParkingLots";
import { ParkingLot } from "app/hooks/useNearbyParkingLots";
import { ParkingLotMarker } from "app/components/Marker/ParkingLotMarker";

export const customMapStyle = [
  {
    "featureType": "poi",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "off" }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "off" }
    ]
  }
]


interface MapScreenProps extends AppStackScreenProps<"map"> { }

export const MapScreen: FC<MapScreenProps> = observer(function MapScreen(_props) {

  const mapView = useRef<MapView>(null);
  const markerRefs = useRef<MapView.Marker[]>([]);

  const { userStateStore } = useStores();
  const initialRegion = {
    latitude: userStateStore.selectedDestination?.latitude || 0,
    longitude: userStateStore.selectedDestination?.longitude || 0
  }

  const { navigation } = _props;

  const { mapApiKey } = Constants.manifest.extra;
  // const mapApiKey = "";

  const { data, isLoading, isError } = useNearbyParkingLots({
    ...initialRegion,
    radius: 1000,
  });

  const hideAllCallouts = (exceptIndex: number = -1) => {
    if (!markerRefs.current || markerRefs.current.length === 0) return;

    markerRefs.current.forEach((marker, index) => {
      if (index !== exceptIndex) marker?.hideCallout();
    });
  };


  const handleParkingLotPress = (parkingLot: ParkingLot, index: number) => {
    hideAllCallouts();
    userStateStore.setPreSelectedParkingLot(parkingLot.title ?? "");
    focusParkingLot(parkingLot);
    markerRefs.current[index].showCallout();
  }

  const focusParkingLot = (parkingLot: Location) => {
    userStateStore.setPreSelectedParkingLot(parkingLot.title ?? "");

    if (!mapView.current) return;
    mapView.current.setCamera(
      {
        zoom: 18,
        center: { latitude: parkingLot.latitude, longitude: parkingLot.longitude }
      }
    );
  }

  const ParkingLotsList = () => {
    if (isLoading) return <Text>Loading...</Text>;
    if (data && data.length > 0) {
      setTimeout(() => {
        focusParkingLot(data[0]);
      }, 1);
    }
    return <LocationList
      locations={data ?? []}
      handlePress={handleParkingLotPress}
      renderItem={(item, index, animations) => (
        <LocationCard
          icon={
            <ParkingLotMarker parkingLot={item} />
          }
          title={item.title || ""}
          subtitle={item.subtitle || ""}
          distance={item.distance + "m"}
        />
      )}
    />
  }

  let isMapReady = false;
  const handleMapReady = () => {
    if (markerRefs.current && markerRefs.current[0]) {
      markerRefs.current[0]?.showCallout();
    }

    isMapReady = true;
  };

  const handlePanDrag = () => {
    if (isMapReady) hideAllCallouts();
  }

  const handleMarkerPress = (index: number) => {
    if (!data || data.length <= 0) return;

    focusParkingLot(data[index]);
  }
  const LeftArrowAccessory: React.FC = () => (
    <FiArrowRight
      style={{
        marginTop: 0,
        marginRight: 8,
        color: 'white'
      }} fontSize={spacing.lg} />
  );

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
          initialRegion={initialRegion}
          initialCamera={{
            zoom: 16,
            center: {
              latitude: userStateStore.selectedDestination?.latitude,
              longitude: userStateStore.selectedDestination?.longitude,
            },
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
          style={$mapContainer}
          onMapReady={handleMapReady}
          onPanDrag={handlePanDrag}
        >
          {data?.map((location, index) => (
            <Marker
              ref={(ref: Marker) => (markerRefs.current[index] = ref!)}
              key={index}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Lot M"
              onPress={() => handleMarkerPress(index)}
            >
              <ParkingLotMarker parkingLot={location} shouldReScale={true} />
              {/* <Callout >
                <View style={{ minWidth: 180, minHeight: 120 }}>
                  <Text
                    size="xxs"
                    weight="bold"
                    accessibilityLabel="Location"
                  >
                    {location.title}
                  </Text>
                  <Text
                    size="xxs"
                    accessibilityLabel="Address"
                  >
                    {location.latitude}
                  </Text>
                  <Text
                    size="xxs"
                    accessibilityLabel="Address"
                  >
                    {location.longitude}
                  </Text>
                </View>
              </Callout> */}
            </Marker>
          ))}
        </MapView>
        <Button style={$actionButton} preset="reversed"
          LeftAccessory={LeftArrowAccessory} onPress={() => navigation.navigate("parkingLot")}>
          Find a spot
        </Button>
      </View>


      <View style={$bottomContainer}>
        <Text style={{ marginBottom: spacing.md }}>Nearby parking lots</Text>
        <ParkingLotsList />
      </View>
    </View>
  );
});


const $actionButton: ViewStyle = {
  position: "absolute",
  bottom: 40,
  right: 12,
  paddingHorizontal: 26,
  minHeight: 50,
  borderRadius: 16
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
}

const $mapContainer: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
};

const $bottomContainer: ViewStyle = {
  flexBasis: "40%",
  justifyContent: "flex-start",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.lg,
  marginTop: -25,
  marginBottom: spacing.md,
  backgroundColor: colors.background,
};
