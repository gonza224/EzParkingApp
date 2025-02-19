import React, { FC } from "react";
import { observer } from "mobx-react-lite";
import { useStores } from "../../models";
import { View, Text, ViewStyle, TextStyle } from "react-native";
import { Spot } from "app/screens";
import { colors } from "app/theme";

interface ParkingSpotMarkerProps {
    text: string;
    spot: Spot;
    shouldReScale: boolean;
}

export const ParkingSpotMarker: FC<ParkingSpotMarkerProps> = observer(({ text, spot }) => {
    const { userStateStore } = useStores();

    const isSelected = userStateStore.selectedParkingSpot?.longitude === spot.longitude &&
        userStateStore.selectedParkingSpot?.latitude === spot.latitude;

    const dynamicStyle: ViewStyle = {
        transform: isSelected ? [{ scale: 1.7 }] : undefined,
        borderWidth: isSelected ? 1.5 : undefined,
        backgroundColor: spot.isReserved ? colors.palette.bad : undefined,
    };

    const dynamicTextStyle: TextStyle = {
    };

    return (
        <View style={[$ParkingSpotMarker, dynamicStyle]}>
            <Text style={[$ParkingSpotMarkerText, dynamicTextStyle]}>{text}</Text>
        </View>
    );
});

const $ParkingSpotMarker: ViewStyle = {
    width: 30, // Set an explicit width
    height: 30, // Set height equal to width
    borderRadius: 25, // Must be at least half of width/height for a perfect circle
    backgroundColor: colors.palette.good,
    alignItems: 'center', // Center the text horizontally
    justifyContent: 'center', // Center the text vertically
    borderColor: '#7c7c7c',
    borderWidth: 0,
    marginTop: 'auto',
    marginBottom: 3,
};


const $ParkingSpotMarkerText: TextStyle = {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: -1.5
};

export default ParkingSpotMarker;
