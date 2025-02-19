import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Constants from "expo-constants";
import { Location } from "../data/locations";
import { calculateDistance, classifyParkingLots } from "../utils/locationCalc";

const { mapApiKey } = Constants.manifest.extra;
const BASE_URL = "https://places.googleapis.com/v1/places:searchNearby";

interface UseNearbyParkingLotsProps {
    latitude: number;
    longitude: number;
    radius?: number;
    maxResultCount?: number;
    includedTypes?: string[];
}

export interface ParkingLot extends Location {
    distance: number;
    color: string;
    isSelected: boolean;
}

const fetchNearbyParkingLots = async ({
    latitude,
    longitude,
    radius = 1000,
    maxResultCount = 10,
    includedTypes = ["parking"],
}: UseNearbyParkingLotsProps): Promise<ParkingLot[]> => {
    const payload = {
        includedTypes,
        maxResultCount,
        locationRestriction: {
            circle: {
                center: {
                    latitude,
                    longitude,
                },
                radius,
            },
        },
        rankPreference: "DISTANCE"
    };

    const headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": mapApiKey,
        "X-Goog-FieldMask": "places.displayName,places.location,places.formattedAddress",
    };

    const response = await axios.post(BASE_URL, payload, { headers });

    if (response.status !== 200 || !response.data.places) {
        throw new Error(
            response.data.error?.message || "Failed to fetch nearby places"
        );
    }

    return classifyParkingLots(response.data.places.map((place: any) => ({
        title: place.displayName.text,
        subtitle: place.formattedAddress,
        latitude: place.location?.latitude,
        longitude: place.location?.longitude,
        distance: calculateDistance(
            latitude,
            longitude,
            place.location?.latitude,
            place.location?.longitude
        )
    })
    ));
};

export const useNearbyParkingLots = (props: UseNearbyParkingLotsProps) =>
    useQuery({
        queryKey: ["nearbyParkingLots", props],
        queryFn: () => fetchNearbyParkingLots(props),
        enabled: Boolean(props.latitude && props.longitude), // Only run query if coordinates are valid
    });
