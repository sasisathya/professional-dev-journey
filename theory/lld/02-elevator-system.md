# Elevator System

## Requirements

- A building has **N elevators**. A rider on any floor can request a pickup (floor + desired direction); once inside, they select a destination floor.
- The system must **dispatch the best elevator** for each pickup request, not just the first one.
- Each elevator services its stops in **SCAN order** (like a disk scheduler: keep moving in one direction, servicing every stop along the way, only reversing when there's nothing left ahead) rather than a naive FIFO queue — FIFO would send an elevator bouncing between floor 1 and floor 20 repeatedly instead of sweeping through in one pass.

## Class Design Rationale

- **Two `TreeSet<Integer>` per elevator** (`upStops`, `downStops`) rather than one queue — a sorted set gives O(log n) "what's my next stop in this direction" for free (`first()`/`last()`), which is exactly what SCAN needs. A plain `Queue` would force FIFO order, which is the wrong algorithm here.
- **Dispatch cost function is a separate method (`costFor`)**, not inlined into the assignment loop — this is the piece an interviewer will ask you to change ("prefer elevators already moving toward the request"), so it needs to be swappable/testable in isolation, same reasoning as the Strategy pattern used in the Parking Lot problem.
- **Simplification, stated explicitly**: this demo combines "hall call" (pickup) and "car call" (destination) into one `requestTrip(pickup, destination)` for brevity. A production system treats them as two separate events (rider presses a hall button; only after boarding do they select a floor) — mention this distinction out loud in an interview, since it affects how you'd model multiple riders with different destinations in the same car.

```java
import java.util.*;

public class ElevatorSystemDemo {

    public enum Direction { UP, DOWN, IDLE }

    public static class ElevatorCar {
        final int id;
        int currentFloor;
        Direction direction = Direction.IDLE;
        final TreeSet<Integer> upStops = new TreeSet<>();
        final TreeSet<Integer> downStops = new TreeSet<>();

        ElevatorCar(int id, int startFloor) {
            this.id = id;
            this.currentFloor = startFloor;
        }

        void addStop(int floor) {
            if (floor > currentFloor) {
                upStops.add(floor);
                if (direction == Direction.IDLE) direction = Direction.UP;
            } else if (floor < currentFloor) {
                downStops.add(floor);
                if (direction == Direction.IDLE) direction = Direction.DOWN;
            }
        }

        // Moves exactly one floor per call, servicing a stop if reached — this is the SCAN sweep.
        void step() {
            if (direction == Direction.UP) {
                if (!upStops.isEmpty()) {
                    currentFloor++;
                    if (upStops.remove(currentFloor)) {
                        System.out.println("Elevator " + id + " opening doors at floor " + currentFloor);
                    }
                    if (upStops.isEmpty()) {
                        direction = downStops.isEmpty() ? Direction.IDLE : Direction.DOWN;
                    }
                } else {
                    direction = downStops.isEmpty() ? Direction.IDLE : Direction.DOWN;
                }
            } else if (direction == Direction.DOWN) {
                if (!downStops.isEmpty()) {
                    currentFloor--;
                    if (downStops.remove(currentFloor)) {
                        System.out.println("Elevator " + id + " opening doors at floor " + currentFloor);
                    }
                    if (downStops.isEmpty()) {
                        direction = upStops.isEmpty() ? Direction.IDLE : Direction.UP;
                    }
                } else {
                    direction = upStops.isEmpty() ? Direction.IDLE : Direction.UP;
                }
            }
        }

        boolean isIdle() { return direction == Direction.IDLE; }
    }

    public static class ElevatorSystem {
        private final List<ElevatorCar> cars;

        public ElevatorSystem(List<ElevatorCar> cars) { this.cars = cars; }

        // Cheap elevators (idle, or already heading toward the request in the right direction) score low;
        // everything else scores high enough to only be picked if nothing better exists.
        private int costFor(ElevatorCar car, int requestFloor, Direction requestedDirection) {
            int distance = Math.abs(car.currentFloor - requestFloor);
            if (car.direction == Direction.IDLE) return distance;

            boolean headingTowardInSameDirection =
                    car.direction == requestedDirection &&
                    ((requestedDirection == Direction.UP && requestFloor >= car.currentFloor) ||
                     (requestedDirection == Direction.DOWN && requestFloor <= car.currentFloor));

            return headingTowardInSameDirection ? distance : distance + 1000;
        }

        public void requestTrip(int pickupFloor, Direction requestedDirection, int destinationFloor) {
            ElevatorCar best = null;
            int bestCost = Integer.MAX_VALUE;
            for (ElevatorCar car : cars) {
                int cost = costFor(car, pickupFloor, requestedDirection);
                if (cost < bestCost) {
                    bestCost = cost;
                    best = car;
                }
            }
            System.out.println("Dispatching elevator " + best.id + " for pickup at floor " + pickupFloor);
            best.addStop(pickupFloor);
            best.addStop(destinationFloor);
        }

        public boolean allIdle() {
            for (ElevatorCar car : cars) if (!car.isIdle()) return false;
            return true;
        }

        public void stepAll() {
            for (ElevatorCar car : cars) car.step();
        }
    }

    public static void main(String[] args) {
        ElevatorCar car1 = new ElevatorCar(1, 1);
        ElevatorCar car2 = new ElevatorCar(2, 10);
        ElevatorSystem system = new ElevatorSystem(new ArrayList<>(List.of(car1, car2)));

        system.requestTrip(5, Direction.UP, 9);   // car1 (floor 1) is closer and idle -> should be chosen
        system.requestTrip(8, Direction.DOWN, 2); // car2 (floor 10) is closer -> should be chosen

        int safetyLimit = 50;
        while (!system.allIdle() && safetyLimit-- > 0) {
            system.stepAll();
        }
        System.out.println("Final floor - car1: " + car1.currentFloor + ", car2: " + car2.currentFloor);
    }
}
```

## What Interviewers Probe Next

- "Separate hall calls from car calls" — model a `HallRequest` (floor + direction) distinct from a `CarRequest` (destination floor selected only after boarding); the dispatch algorithm only sees hall requests.
- "What if two riders in the same car want different floors?" — `upStops`/`downStops` already support multiple pending stops per car; the interesting extension is capacity limits (reject `addStop` beyond max occupancy).
- "Make dispatch fair — no elevator should be starved." — add an aging factor to `costFor` so requests waiting longest gradually lower any car's effective cost.
- "This needs to run for real elevators — where's the concurrency risk?" — `requestTrip` and `stepAll` mutating the same `ElevatorCar` from different threads (a dispatch thread and a movement-simulation thread) needs synchronization per car, same class of problem as [08-movie-ticket-booking.md](08-movie-ticket-booking.md).
