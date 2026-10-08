# Splitwise (Expense Splitting)

## Requirements

- Track running balances between N users as expenses are added.
- Support three split types: **EQUAL** (divide evenly), **EXACT** (caller specifies each person's exact share), **PERCENT** (caller specifies each person's percentage).
- `settleUp()` produces a list of "who pays whom how much" transactions that zeroes out every balance, minimizing the number of transactions.

## Class Design Rationale

- Balances are stored as a **single signed number per user** (`Map<String, Double>`), not a full N×N ledger of "who owes whom" — this is the key modeling insight. If Alice owes Bob $10 and Bob owes Alice $6, the ledger only needs to know Alice's net is -4 and Bob's net is +4; the *history* of individual debts doesn't matter for settlement, only the net.
- `computeShares` is a `switch` on split type here rather than a `SplitStrategy` interface (contrast with the Strategy pattern used in [01-parking-lot.md](01-parking-lot.md)) because interviewers usually only expect 2-3 split types and the branches are short — pulling it into separate classes would be premature abstraction for this problem's actual scope. If asked to support many more split types, that's the moment to extract the interface.
- `settleUp()` uses a **greedy max-creditor-meets-max-debtor** approach. This is worth stating explicitly is *not* provably minimal in all cases — true minimum-transaction settlement is a partition-style problem that's NP-hard in general — but the greedy approach is simple, always correct (it does zero out every balance), and produces at most `n-1` transactions for `n` users, which is what almost every real product (including the actual Splitwise app) settles for.

```java
import java.util.*;

public class SplitwiseDemo {

    public enum SplitType { EQUAL, EXACT, PERCENT }

    public static class ExpenseSplitter {
        private final Map<String, Double> balances = new HashMap<>();

        public void addExpense(String payer, double amount, List<String> participants,
                                SplitType type, List<Double> splitValues) {
            Map<String, Double> shares = computeShares(amount, participants, type, splitValues);

            balances.merge(payer, amount, Double::sum);
            for (Map.Entry<String, Double> entry : shares.entrySet()) {
                balances.merge(entry.getKey(), -entry.getValue(), Double::sum);
            }
        }

        private Map<String, Double> computeShares(double amount, List<String> participants,
                                                     SplitType type, List<Double> splitValues) {
            Map<String, Double> shares = new LinkedHashMap<>();
            switch (type) {
                case EQUAL: {
                    double share = amount / participants.size();
                    for (String p : participants) shares.put(p, share);
                    break;
                }
                case EXACT: {
                    double sum = splitValues.stream().mapToDouble(Double::doubleValue).sum();
                    if (Math.abs(sum - amount) > 0.01) {
                        throw new IllegalArgumentException("Exact splits must sum to the total amount");
                    }
                    for (int i = 0; i < participants.size(); i++) {
                        shares.put(participants.get(i), splitValues.get(i));
                    }
                    break;
                }
                case PERCENT: {
                    double sum = splitValues.stream().mapToDouble(Double::doubleValue).sum();
                    if (Math.abs(sum - 100.0) > 0.01) {
                        throw new IllegalArgumentException("Percent splits must sum to 100");
                    }
                    for (int i = 0; i < participants.size(); i++) {
                        shares.put(participants.get(i), amount * splitValues.get(i) / 100.0);
                    }
                    break;
                }
            }
            return shares;
        }

        public List<String> settleUp() {
            List<String> transactions = new ArrayList<>();
            Map<String, Double> working = new HashMap<>(balances);

            while (true) {
                String maxCreditor = null, maxDebtor = null;
                double maxCredit = 0.01, maxDebt = 0.01; // epsilon threshold to stop

                for (Map.Entry<String, Double> entry : working.entrySet()) {
                    if (entry.getValue() > maxCredit) {
                        maxCredit = entry.getValue();
                        maxCreditor = entry.getKey();
                    }
                    if (-entry.getValue() > maxDebt) {
                        maxDebt = -entry.getValue();
                        maxDebtor = entry.getKey();
                    }
                }

                if (maxCreditor == null || maxDebtor == null) break;

                double settleAmount = Math.min(maxCredit, maxDebt);
                transactions.add(String.format("%s pays %s: %.2f", maxDebtor, maxCreditor, settleAmount));

                working.merge(maxCreditor, -settleAmount, Double::sum);
                working.merge(maxDebtor, settleAmount, Double::sum);
            }
            return transactions;
        }

        public Map<String, Double> getBalances() { return balances; }
    }

    public static void main(String[] args) {
        ExpenseSplitter splitter = new ExpenseSplitter();

        splitter.addExpense("Alice", 300, List.of("Alice", "Bob", "Carol"), SplitType.EQUAL, null);
        splitter.addExpense("Bob", 100, List.of("Alice", "Bob"), SplitType.EXACT, List.of(40.0, 60.0));
        splitter.addExpense("Carol", 200, List.of("Alice", "Bob", "Carol"), SplitType.PERCENT, List.of(50.0, 25.0, 25.0));

        System.out.println("Balances: " + splitter.getBalances());
        System.out.println("Settlement plan:");
        for (String transaction : splitter.settleUp()) {
            System.out.println("  " + transaction);
        }
    }
}
```

## What Interviewers Probe Next

- "Money as `double` will bite you eventually." → Real systems use integer cents (or `BigDecimal`) precisely because floating-point rounding compounds across many expenses; be ready to say this unprompted even though the demo above uses `double` for readability.
- "Groups, not just pairwise expenses." → Add a `Group` entity owning a subset of users and expenses; balances would need to be scoped per-group (a user can owe different amounts to different groups independently).
- "Support simplifying debts across a whole group automatically, like the real app does." → That's exactly what `settleUp()` already does — walk through *why* the greedy approach terminates (every iteration zeroes out at least one balance, so it terminates in at most `n-1` steps) since interviewers will ask you to prove termination, not just claim it.
- "What if two expenses are added concurrently by different users?" → `balances.merge(...)` is not atomic across the payer update and the participant updates as a whole — you'd need a lock (or a single-writer queue) per group to keep an expense's effect atomic, same class of problem as [08-movie-ticket-booking.md](08-movie-ticket-booking.md).
