# Movie Ticket Booking System

## Requirements

- A `Show` has a fixed set of `Seat`s. `bookSeat(seatId, userId)` must succeed for **exactly one** caller when multiple users race for the same seat concurrently — this is the actual point of the exercise, not the CRUD around it.
- This is the LLD problem where "it compiles and looks right" and "it is actually correct" diverge the most — a solution that isn't tested under real thread contention will look fine and still double-book seats in production.

## Class Design Rationale

- **Locking is per-seat (`ReentrantLock` on each `Seat`), not one lock for the whole `Show`.** A single theater-wide lock would be correct but would serialize *every* booking in the theater behind *every other* booking, even for completely unrelated seats — unnecessary contention. Locking at the seat level means booking seat A1 and seat B2 can happen fully in parallel; only two threads racing for the *same* seat ever actually contend.
- **The check-and-set (`if AVAILABLE then BOOKED`) happens entirely inside the lock**, in a `try`/`finally` that guarantees `unlock()` even if something throws. This is the part that's easy to get subtly wrong: if you check `status == AVAILABLE` and set it to `BOOKED` as two separate un-synchronized statements, two threads can both pass the check before either writes the update — that's the double-booking bug this whole problem exists to catch.
- `Show.seats` is a `ConcurrentHashMap` so that looking up a seat by ID is itself safe under concurrent access, independent of the per-seat booking lock — two different concerns (finding the seat vs. booking it) get two different pieces of thread-safety.
- The demo doesn't just call `bookSeat` twice and eyeball the result — it fires **20 real threads at the same seat** via an `ExecutorService`, because a race condition that isn't exercised under actual concurrent execution can hide in a single-threaded test run indefinitely.

```java
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantLock;

public class MovieTicketBookingDemo {

    public enum SeatStatus { AVAILABLE, BOOKED }

    public static class Seat {
        final String seatId;
        private SeatStatus status = SeatStatus.AVAILABLE;
        private String bookedBy = null;
        private final ReentrantLock lock = new ReentrantLock();

        Seat(String seatId) { this.seatId = seatId; }

        boolean book(String userId) {
            lock.lock();
            try {
                if (status == SeatStatus.AVAILABLE) {
                    status = SeatStatus.BOOKED;
                    bookedBy = userId;
                    return true;
                }
                return false;
            } finally {
                lock.unlock();
            }
        }

        synchronized String getBookedBy() { return bookedBy; }
    }

    public static class Show {
        final String showId;
        final Map<String, Seat> seats = new ConcurrentHashMap<>();

        Show(String showId, List<String> seatIds) {
            this.showId = showId;
            for (String id : seatIds) seats.put(id, new Seat(id));
        }

        boolean bookSeat(String seatId, String userId) {
            Seat seat = seats.get(seatId);
            if (seat == null) return false;
            return seat.book(userId);
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Show show = new Show("SHOW-1", List.of("A1", "A2", "A3"));

        int concurrentUsers = 20;
        ExecutorService executor = Executors.newFixedThreadPool(concurrentUsers);
        AtomicInteger successCount = new AtomicInteger(0);
        CountDownLatch latch = new CountDownLatch(concurrentUsers);

        for (int i = 0; i < concurrentUsers; i++) {
            String userId = "user-" + i;
            executor.submit(() -> {
                try {
                    boolean booked = show.bookSeat("A1", userId); // all racing for the SAME seat
                    if (booked) successCount.incrementAndGet();
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();
        executor.shutdown();

        System.out.println("Successful bookings for seat A1: " + successCount.get()); // must be exactly 1
        System.out.println("Seat A1 booked by: " + show.seats.get("A1").getBookedBy());
    }
}
```

## What Interviewers Probe Next

- "This runs on one JVM — what about multiple API server instances behind a load balancer?" → The lock is only visible within one process; across processes you need the lock (or the check-and-set) to happen in a shared store — a Redis `SETNX`/Lua script, or a DB row with a unique constraint on `(show_id, seat_id, status='BOOKED')` and an optimistic-concurrency retry on conflict.
- "What if a user reserves a seat but doesn't pay — should it be held or released?" → Introduces a third state (`HELD` with a TTL) between `AVAILABLE` and `BOOKED`, and a background sweep (or Redis key expiry) to release stale holds — a good moment to reference the Vending Machine's State pattern shape ([06-vending-machine.md](06-vending-machine.md)).
- "Book multiple seats atomically — either all succeed or none do." → Naively locking seats one at a time in a loop can deadlock if two threads lock the same two seats in opposite order; the fix is to always acquire locks in a **consistent order** (e.g., sorted by `seatId`) across every caller.
- "How do you prove this is actually correct, not just 'usually works'?" → Point at the multi-threaded demo itself: running it repeatedly and asserting `successCount == 1` every time is the test; a version with the race condition (check and set as separate unsynchronized statements) would occasionally print `2` or higher.
