# Vending Machine

## Requirements

- States: **Idle** (no money inserted) → **HasMoney** (accepting coins / product selection) → **Dispensing** (releasing product + change) → back to Idle, or **OutOfStock** if inventory hits zero.
- `insertCoin`, `selectProduct`, and `dispense` all behave differently depending on which state the machine is in — the same button press means something different depending on where you are in the workflow.

## Class Design Rationale

- This is the textbook case for the **State pattern** (see [`theory/design-patterns/java/design-patterns-java.md#20-state`](../design-patterns/java/design-patterns-java.md#20-state)): instead of one giant method full of `if (state == IDLE) ... else if (state == HAS_MONEY) ...` branches repeated for every action, each state is its own class implementing the same interface, and the machine just delegates to whichever state object is current.
- The alternative — an `enum State` field checked with `switch` inside every method — works for 3-4 states but stops scaling the moment a state needs its own data or the transition logic gets nontrivial (this problem already needs that: `DispensingState` needs to know the selected product and compute change). Explicit state *objects* scale better than an enum once behavior, not just a label, varies per state.
- `VendingMachine.setState()` logs the transition — in an interview, saying "I want every transition to be visible/logged for debugging" is a small but real signal of production thinking.

```java
import java.util.HashMap;
import java.util.Map;

public class VendingMachineDemo {

    public interface VendingMachineState {
        void insertCoin(VendingMachine machine, int amount);
        void selectProduct(VendingMachine machine, String productId);
        void dispense(VendingMachine machine);
    }

    public static class IdleState implements VendingMachineState {
        public void insertCoin(VendingMachine machine, int amount) {
            machine.balance += amount;
            System.out.println("Inserted " + amount + ". Balance: " + machine.balance);
            machine.setState(new HasMoneyState());
        }
        public void selectProduct(VendingMachine machine, String productId) {
            System.out.println("Insert coins before selecting a product.");
        }
        public void dispense(VendingMachine machine) {
            System.out.println("Select a product first.");
        }
    }

    public static class HasMoneyState implements VendingMachineState {
        public void insertCoin(VendingMachine machine, int amount) {
            machine.balance += amount;
            System.out.println("Inserted " + amount + ". Balance: " + machine.balance);
        }
        public void selectProduct(VendingMachine machine, String productId) {
            Integer stock = machine.inventory.get(productId);
            Integer price = machine.prices.get(productId);
            if (stock == null || price == null || stock == 0) {
                System.out.println("Product " + productId + " unavailable.");
                return;
            }
            if (machine.balance < price) {
                System.out.println("Insufficient funds. Need " + (price - machine.balance) + " more.");
                return;
            }
            machine.selectedProduct = productId;
            machine.setState(new DispensingState());
        }
        public void dispense(VendingMachine machine) {
            System.out.println("Select a product first.");
        }
    }

    public static class DispensingState implements VendingMachineState {
        public void insertCoin(VendingMachine machine, int amount) {
            System.out.println("Already dispensing -- please wait.");
        }
        public void selectProduct(VendingMachine machine, String productId) {
            System.out.println("Already dispensing -- please wait.");
        }
        public void dispense(VendingMachine machine) {
            String productId = machine.selectedProduct;
            int price = machine.prices.get(productId);
            int change = machine.balance - price;

            machine.inventory.put(productId, machine.inventory.get(productId) - 1);
            System.out.println("Dispensing " + productId + ". Change returned: " + change);

            machine.balance = 0;
            machine.selectedProduct = null;
            machine.setState(machine.totalStock() > 0 ? new IdleState() : new OutOfStockState());
        }
    }

    public static class OutOfStockState implements VendingMachineState {
        public void insertCoin(VendingMachine machine, int amount) {
            System.out.println("Machine out of stock. Coin returned.");
        }
        public void selectProduct(VendingMachine machine, String productId) {
            System.out.println("Machine out of stock.");
        }
        public void dispense(VendingMachine machine) {
            System.out.println("Machine out of stock.");
        }
    }

    public static class VendingMachine {
        final Map<String, Integer> inventory = new HashMap<>();
        final Map<String, Integer> prices = new HashMap<>();
        int balance = 0;
        String selectedProduct = null;
        private VendingMachineState state = new IdleState();

        void addProduct(String id, int stock, int price) {
            inventory.put(id, stock);
            prices.put(id, price);
        }

        void setState(VendingMachineState state) {
            this.state = state;
            System.out.println("[State -> " + state.getClass().getSimpleName() + "]");
        }

        int totalStock() {
            int total = 0;
            for (int count : inventory.values()) total += count;
            return total;
        }

        void insertCoin(int amount) { state.insertCoin(this, amount); }
        void selectProduct(String productId) { state.selectProduct(this, productId); }
        void dispense() { state.dispense(this); }
    }

    public static void main(String[] args) {
        VendingMachine machine = new VendingMachine();
        machine.addProduct("SODA", 1, 150);

        machine.selectProduct("SODA");   // rejected -- Idle state, no coins yet
        machine.insertCoin(100);         // Idle -> HasMoney
        machine.selectProduct("SODA");   // insufficient funds
        machine.insertCoin(100);         // HasMoney, balance now 200
        machine.selectProduct("SODA");   // HasMoney -> Dispensing
        machine.dispense();              // Dispensing -> OutOfStock (last soda)

        machine.insertCoin(150);         // OutOfStock -- coin returned
    }
}
```

## What Interviewers Probe Next

- "Support multiple product slots with independent stock." → Already handled — `inventory`/`prices` are keyed by `productId`; `OutOfStockState` only triggers when the *entire machine* (`totalStock()`) hits zero. Ask whether the interviewer wants per-slot out-of-stock instead (a `selectProduct` check, not a global state).
- "What if a coin gets stuck mid-insert, or the user cancels?" → Add a `cancel()` action to every state that refunds `balance` and returns to `IdleState` — a good check for whether you actually understand each state independently or just copy-pasted a template.
- "Make refill an explicit action." → Add a `RefillState`-triggering `restock()` method; note that it can be called from `OutOfStockState` (and arguably `IdleState`) but should probably be rejected mid-`DispensingState`.
- "This needs to work with real coin hardware that can jam." → The interesting design question becomes error/exception states — is a hardware failure a fifth `VendingMachineState`, or an exception that any state can throw and the machine catches centrally? Either is defensible; know the trade-off (state explosion vs. losing the "which state was I in" context).
