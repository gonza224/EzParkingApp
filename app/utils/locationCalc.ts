import { ParkingLot } from "app/hooks/useNearbyParkingLots";
import { Location } from "app/data/locations";
import { colors } from "app/theme";

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const toRad = (value: number) => (value * Math.PI) / 180;

    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round((R * c) * 1000); //Distance in meters
}

export const classifyParkingLots = (parkingLots: ParkingLot[]): ParkingLot[] => {
    if (!parkingLots || parkingLots.length === 0) return [];

    // Calculate dynamic thresholds
    const distances = parkingLots.map((loc) => loc.distance);
    // const minDistance = distances[0];
    // const maxDistance = distances[distances.length - 1];
    // const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;

    // Quartiles
    const Q1 = distances[Math.floor(distances.length * 0.25)];
    const Q3 = distances[Math.floor(distances.length * 0.75)];

    // Classify each parking lot
    return parkingLots.map((location) => {
        if (location.distance <= Q1) {
            return { ...location, color: colors.palette.good };
        } else if (location.distance > Q1 && location.distance <= Q3) {
            return { ...location, color: colors.palette.neutral };
        } else {
            return { ...location, color: colors.palette.bad };
        }
    });
};

export const calculateCentroid = (spots: Location[]): Location => {
    const totalSpots = spots.length;
    const avgLatitude =
        spots.reduce((sum, spot) => sum + spot.latitude, 0) / totalSpots;
    const avgLongitude =
        spots.reduce((sum, spot) => sum + spot.longitude, 0) / totalSpots;

    return { latitude: avgLatitude, longitude: avgLongitude };
};

const padding = 0.00003;
// const padding = 0.003;
export const getLocationsBounds = (spots: Location[]) => {
    const bounds = spots.reduce(
        (acc, spot) => {
            acc.minLat = Math.min(acc.minLat, spot.latitude);
            acc.maxLat = Math.max(acc.maxLat, spot.latitude);
            acc.minLng = Math.min(acc.minLng, spot.longitude);
            acc.maxLng = Math.max(acc.maxLng, spot.longitude);
            return acc;
        },
        {
            minLat: Infinity,
            maxLat: -Infinity,
            minLng: Infinity,
            maxLng: -Infinity,
        }
    );
    return {
        minLat: bounds.minLat - padding,
        maxLat: bounds.maxLat + padding,
        minLng: bounds.minLng - padding,
        maxLng: bounds.maxLng + padding,
    };
}
