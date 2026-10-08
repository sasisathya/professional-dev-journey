# Parking Lot

## Requirements

- The lot has multiple **floors**, each with a fixed number of **spots** of different **sizes** (small, medium, large).
- Vehicles come in different **types** (motorcycle, car, bus) and each type can only fit in a spot of sufficient size (a bus needs a large spot; a motorcycle can use any spot).
- `park(vehicle)` finds an available spot across the lot and returns a **ticket**; `unpark(ticket)` frees the spot.
- Out of scope for this pass: pricing/billing, payment, reservations.

## Class Design Rationale

- **`VehicleType` → `SpotSize` compatibility** is a simple lookup, not inheritance — a `Vehicle` doesn't need to know about `ParkingSpot` at all, keeping the two hierarchies decoupled.
- **`SpotAllocationStrategy`** is pulled out as an interface (Strategy pattern) even though there's one implementation today, because "how you pick a spot" is exactly the kind of decision an interviewer asks you to change in the last five minutes ("now prefer spots closest to the entrance"). Hardcoding the search loop into `ParkingLot` would make that a rewrite instead of a one-class swap.
- **`Floor`** owns its spots and exposes `findAvailableSpot`; `ParkingLot` just iterates floors. This keeps floor-level concerns (which spots exist) separate from lot-level concerns (which floor to try, ticket issuance).
- A **`Ticket`** is returned from `park()` instead of exposing the `ParkingSpot` directly — the caller shouldn't be able to mutate spot state except through `unpark()`.

```java
import java.time.Instant;
import java.util.*;

public class ParkingLotDemo {

    public enum VehicleType { MOTORCYCLE, CAR, BUS }
    public enum SpotSize { SMALL, MEDIUM, LARGE }

    // Encodes "what size spot can this vehicle type use" — smallest sufficient size.
    static SpotSize minimumSpotSize(VehicleType type) {
        switch (type) {
            case MOTORCYCLE: return SpotSize.SMALL;
            case CAR: return SpotSize.MEDIUM;
            case BUS: return SpotSize.LARGE;
            default: throw new IllegalArgumentException("Unknown vehicle type: " + type);
        }
    }

    // Size ordering — a spot fits a vehicle if spot.size >= vehicle's minimum required size.
    static boolean fits(SpotSize spotSize, VehicleType vehicleType) {
        return spotSize.ordinal() >= minimumSpotSize(vehicleType).ordinal();
    }

    public static class Vehicle {
        final String licensePlate;
        final VehicleType type;

        Vehicle(String licensePlate, VehicleType type) {
            this.licensePlate = licensePlate;
            this.type = type;
        }
    }

    public static class ParkingSpot {
        final String id;
        final SpotSize size;
        Vehicle occupiedBy;

        ParkingSpot(String id, SpotSize size) {
            this.id = id;
            this.size = size;
        }

        boolean isAvailable() { return occupiedBy == null; }
    }

    public static class Ticket {
        final String id;
        final ParkingSpot spot;
        final Vehicle vehicle;
        final Instant entryTime;

        Ticket(ParkingSpot spot, Vehicle vehicle) {
            this.id = "T-" + UUID.randomUUID().toString().substring(0, 8);
            this.spot = spot;
            this.vehicle = vehicle;
            this.entryTime = Instant.now();
        }
    }

    public static class Floor {
        final int level;
        final List<ParkingSpot> spots;

        Floor(int level, List<ParkingSpot> spots) {
            this.level = level;
            this.spots = spots;
        }
    }

    public interface SpotAllocationStrategy {
        Optional<ParkingSpot> findSpot(List<Floor> floors, VehicleType type);
    }

    // Simplest correct strategy: first available spot, floor by floor, that's big enough.
    // Swapping in a "nearest to entrance" or "smallest sufficient size" strategy is a one-class change.
    public static class FirstAvailableStrategy implements SpotAllocationStrategy {
        @Override
        public Optional<ParkingSpot> findSpot(List<Floor> floors, VehicleType type) {
            for (Floor floor : floors) {
                for (ParkingSpot spot : floor.spots) {
                    if (spot.isAvailable() && fits(spot.size, type)) {
                        return Optional.of(spot);
                    }
                }
            }
            return Optional.empty();
        }
    }

    public static class ParkingLot {
        private final List<Floor> floors;
        private final SpotAllocationStrategy allocationStrategy;
        private final Map<String, Ticket> activeTickets = new HashMap<>();

        public ParkingLot(List<Floor> floors, SpotAllocationStrategy allocationStrategy) {
            this.floors = floors;
            this.allocationStrategy = allocationStrategy;
        }

        public Optional<Ticket> park(Vehicle vehicle) {
            Optional<ParkingSpot> spot = allocationStrategy.findSpot(floors, vehicle.type);
            if (spot.isEmpty()) return Optional.empty();

            ParkingSpot chosen = spot.get();
            chosen.occupiedBy = vehicle;
            Ticket ticket = new Ticket(chosen, vehicle);
            activeTickets.put(ticket.id, ticket);
            return Optional.of(ticket);
        }

        public boolean unpark(Ticket ticket) {
            if (!activeTickets.containsKey(ticket.id)) return false;
            ticket.spot.occupiedBy = null;
            activeTickets.remove(ticket.id);
            return true;
        }

        public long availableCount(SpotSize size) {
            long count = 0;
            for (Floor floor : floors) {
                for (ParkingSpot spot : floor.spots) {
                    if (spot.isAvailable() && spot.size == size) count++;
                }
            }
            return count;
        }
    }

    public static void main(String[] args) {
        Floor floor1 = new Floor(1, List.of(
                new ParkingSpot("1-S1", SpotSize.SMALL),
                new ParkingSpot("1-M1", SpotSize.MEDIUM),
                new ParkingSpot("1-L1", SpotSize.LARGE)
        ));

        ParkingLot lot = new ParkingLot(new ArrayList<>(List.of(floor1)), new FirstAvailableStrategy());

        Vehicle car = new Vehicle("CAR-1", VehicleType.CAR);
        Vehicle bus = new Vehicle("BUS-1", VehicleType.BUS);

        Optional<Ticket> carTicket = lot.park(car);
        Optional<Ticket> busTicket = lot.park(bus);

        System.out.println("Car parked: " + carTicket.isPresent() + " at " + carTicket.get().spot.id);
        System.out.println("Bus parked: " + busTicket.isPresent() + " at " + busTicket.get().spot.id);

        Vehicle secondBus = new Vehicle("BUS-2", VehicleType.BUS);
        Optional<Ticket> secondBusTicket = lot.park(secondBus);
        System.out.println("Second bus parked: " + secondBusTicket.isPresent() + " (lot has only one LARGE spot)");

        lot.unpark(busTicket.get());
        Optional<Ticket> secondBusRetry = lot.park(secondBus);
        System.out.println("Second bus after first bus left: " + secondBusRetry.isPresent());

        System.out.println("Available SMALL spots: " + lot.availableCount(SpotSize.SMALL));
    }
}
```

## What Interviewers Probe Next

- "Now add pricing that charges by duration and vehicle type." → Add a `PricingStrategy` interface (same Strategy-pattern shape as allocation), invoked in `unpark()` using `Ticket.entryTime`.
- "What if a motorcycle should prefer small spots but can use a large one if that's all that's free?" → Change `fits()` to a preference-ordered search rather than strict minimum, or make `FirstAvailableStrategy` sort candidate spots by size ascending.
- "Multiple entry points need to park concurrently without double-booking a spot." → `park()`/`unpark()` need synchronization per-spot (or a `ConcurrentHashMap`-backed spot registry with atomic compare-and-set on `occupiedBy`) — see [08-movie-ticket-booking.md](08-movie-ticket-booking.md) for the same concurrency problem solved in depth.
- "Support reservations ahead of time." → A spot's state becomes an enum (`FREE`, `RESERVED`, `OCCUPIED`) instead of a boolean, and `park()` needs to check reservation ownership.
