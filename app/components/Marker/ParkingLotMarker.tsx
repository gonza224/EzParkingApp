import React, { FC } from "react";
import { observer } from "mobx-react-lite";
import { useStores } from "../../models";
import { View, Text, ViewStyle, TextStyle } from "react-native";
import { ParkingLot } from "app/hooks/useNearbyParkingLots";

interface ParkingLotMarkerProps {
    parkingLot: ParkingLot;
    shouldReScale: boolean;
}

export const ParkingLotMarker: FC<ParkingLotMarkerProps> = observer(({ parkingLot, shouldReScale = false }) => {
    const { userStateStore } = useStores();

    const isSelected = userStateStore.preSelectedParkingLot === parkingLot.title;

    const dynamicStyle: ViewStyle = {
        transform: isSelected && shouldReScale ? [{ scale: 1.4 }] : undefined,
        borderWidth: isSelected ? 1.5 : undefined,
    };

    const dynamicTextStyle: TextStyle = {
    };

    return (
        <View style={[$parkingLotMarker, dynamicStyle, { backgroundColor: parkingLot.color }]}>
            <Text style={[$parkingLotMarkerText, dynamicTextStyle]}>P</Text>
        </View>
    );
});

const $parkingLotMarker: ViewStyle = {
    width: 35, // Set an explicit width
    height: 35, // Set height equal to width
    borderRadius: 25, // Must be at least half of width/height for a perfect circle
    backgroundColor: 'red',
    alignItems: 'center', // Center the text horizontally
    justifyContent: 'center', // Center the text vertically
    borderColor: '#7c7c7c',
    borderWidth: 0,
    marginTop: 'auto',
    marginBottom: 3,
};


const $parkingLotMarkerText: TextStyle = {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
};

export default ParkingLotMarker;
