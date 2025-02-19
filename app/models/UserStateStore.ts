import { Instance, SnapshotOut, types } from "mobx-state-tree";

const Location = types.model("Location", {
  title: types.optional(types.union(types.string, types.undefined), undefined),
  subtitle: types.optional(types.union(types.string, types.undefined), undefined),
  latitude: types.number,
  longitude: types.number,
});
const Spot = types.model("Spot", {
  index: types.number,
  isReserved: types.boolean,
  latitude: types.number,
  longitude: types.number,
});

export const UserStateStoreModel = types
  .model("UserStateStore")
  .props({
    searchQuery: "",
    selectedDestination: types.maybeNull(Location),
    preSelectedParkingLot: "",
    selectedParkingSpot: types.maybeNull(Spot),
    rideStatus: types.enumeration("RideStatus", ["idle", "in-progress", "completed"]),
    rideStartTime: types.maybeNull(types.Date),
    estimatedArrivalTime: types.maybeNull(types.Date),
    rideDetails: types.optional(types.map(types.string), {}),
  })
  .views((store) => ({
    get rideDuration() {
      if (store.rideStartTime && store.estimatedArrivalTime) {
        const differenceInMillis =
          store.estimatedArrivalTime.getTime() - store.rideStartTime.getTime();
        const differenceInMinutes = differenceInMillis / 1000 / 60;
        return differenceInMinutes;
      }
      return null;
    },
    get isRideInProgress() {
      return store.rideStatus === "in-progress";
    },
    get hasValidDestination() {
      return store.selectedDestination !== null;
    },
  }))
  .actions((store) => ({
    // Action to update the search query
    setSearchQuery(value: string) {
      store.searchQuery = value;
    },
    setPreSelectedParkingLot(value: string) {
      store.preSelectedParkingLot = value;
    },
    setSelectedParkingSpot(value: Instance<typeof Spot>) {
      store.selectedParkingSpot = value;
    },
    // Action to set the selected destination with full details
    setSelectedDestination(destination: {
      title: string;
      subtitle: string;
      latitude: number;
      longitude: number;
    }) {
      store.selectedDestination = destination;
    },
    // Action to start the ride
    startRide(destination: string, estimatedArrival: Date) {
      store.rideStatus = "in-progress";
      store.rideStartTime = new Date(); // Current time
      store.estimatedArrivalTime = estimatedArrival;
    },
    // Action to complete the ride
    completeRide() {
      store.rideStatus = "completed";
      store.selectedDestination = null;
      store.rideStartTime = null;
      store.estimatedArrivalTime = null;
    },
    // Action to reset the ride state
    resetParkingState() {
      store.selectedDestination = null;
      store.preSelectedParkingLot = "";
      store.selectedParkingSpot = null;
    },
  }));

// Optional: TypeScript interfaces
export interface UserStateStore extends Instance<typeof UserStateStoreModel> { }
export interface UserStateStoreSnapshot extends SnapshotOut<typeof UserStateStoreModel> { }
