import React, { FC } from "react";
import { observer } from "mobx-react-lite";
import { useStores } from "../../models";
import { View, ViewStyle, TextStyle } from "react-native";
import { Card, Text } from "app/components";
import { colors, spacing } from "../../theme"; // Adjust the import path accordingly

interface LocationCardProps {
    title: string;
    subtitle: string;
    icon: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
    distance: string;
}

export const LocationCard: FC<LocationCardProps> = observer(({ title, subtitle, icon, distance = "" }) => {
    const { userStateStore } = useStores();
    const isSelected = userStateStore.preSelectedParkingLot === title;

    const dynamicStyle: ViewStyle = {
        borderColor: isSelected ? "#7c7c7c" : undefined,
        borderWidth: isSelected ? 1.5 : undefined,
    };

    return (
        <Card
            style={[$item, dynamicStyle]}
            LeftComponent={
                icon
            }
            RightComponent={
                <View style={$metadata}>
                    <Text
                        style={$metadataText}
                        size="xxs"
                        accessibilityLabel="Address"
                    >
                        {distance}
                    </Text>
                </View>}
            ContentComponent={
                <View style={$metadata}>
                    <Text
                        style={$metadataText}
                        size="xxs"
                        weight="bold"
                        accessibilityLabel="Location"
                    >
                        {title}
                    </Text>
                    <Text
                        style={$metadataText}
                        size="xxs"
                        accessibilityLabel="Address"
                    >
                        {subtitle}
                    </Text>
                </View>
            }
            accessibilityHint="View location details"
        />
    );
});

// Styles for the LocationCard
const $item: ViewStyle = {
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 0,
    width: "100%",
    marginTop: spacing.md,
};

const $leftContainer: ViewStyle = {
    justifyContent: "center",
    alignItems: "flex-start", // Align the icon to the left
};

const $metadata: ViewStyle = {
    flexDirection: "column", // Stack the text vertically
    justifyContent: "center",
};

const $metadataText: TextStyle = {
    color: colors.textDim,
    marginBottom: 2, // Space between title and subtitle
};
