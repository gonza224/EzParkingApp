import React, { FC, useEffect } from "react";
import { Animated, FlatList, TouchableOpacity } from "react-native";
import { Location } from "../../data/locations";
import { spacing } from "app/theme";
import { ParkingLot } from "app/hooks/useNearbyParkingLots";

interface LocationListProps {
    locations: Location[] | ParkingLot[];
    handlePress: <T extends Location>(item: T | ParkingLot, index: number) => void;
    renderItem: <T extends Location>(
        item: T,
        index: number,
        animations: {
            easeInPosition: Animated.Value;
            easeInOpacity: Animated.Value
        }
    ) => JSX.Element;
}

export const LocationList: FC<LocationListProps> = ({ locations, handlePress, renderItem }) => {
    const animations = locations.map(() => ({
        easeInPosition: new Animated.Value(100), // Start 100px below the final position
        easeInOpacity: new Animated.Value(0), // Start invisible
    }));

    useEffect(() => {
        animations.forEach((animation, index) => {
            const delay = index * 100; // Delay each animation
            Animated.timing(animation.easeInPosition, {
                toValue: 0, // Final position
                duration: 500,
                delay,
                useNativeDriver: true,
            }).start();

            Animated.timing(animation.easeInOpacity, {
                toValue: 1, // Fully visible
                duration: 500,
                delay,
                useNativeDriver: true,
            }).start();
        });
    }, []);

    const defaultRenderItem = ({ item, index }: { item: Location; index: number }) => {
        const animation = animations[index];
        return (
            <Animated.View
                style={{
                    transform: [{ translateY: animation.easeInPosition }],
                    opacity: animation.easeInOpacity,
                    width: "100%",
                }}
            >
                <TouchableOpacity activeOpacity={0.3} onPress={() => handlePress(item, index)}>
                    {renderItem(item, index, animation)}
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <FlatList
            data={locations}
            renderItem={defaultRenderItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, margin: 0 }}
        />
    );
};
