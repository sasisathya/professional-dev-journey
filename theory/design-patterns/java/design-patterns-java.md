# Java Design Patterns — Complete Reference

All 23 classic Gang-of-Four (GoF) design patterns. Each entry has:
**Definition** → **When to use** → **Full runnable code** → **Real-world example** it maps to.

Every code block is a single, compilable `.java` file (copy the whole block into a file named after its `public class` and run it).

---

## Table of Contents

### Creational (how objects get created)
1. [Singleton](#1-singleton)
2. [Factory Method](#2-factory-method)
3. [Abstract Factory](#3-abstract-factory)
4. [Builder](#4-builder)
5. [Prototype](#5-prototype)

### Structural (how objects/classes are composed)
6. [Adapter](#6-adapter)
7. [Bridge](#7-bridge)
8. [Composite](#8-composite)
9. [Decorator](#9-decorator)
10. [Facade](#10-facade)
11. [Flyweight](#11-flyweight)
12. [Proxy](#12-proxy)

### Behavioral (how objects communicate/behave)
13. [Chain of Responsibility](#13-chain-of-responsibility)
14. [Command](#14-command)
15. [Interpreter](#15-interpreter)
16. [Iterator](#16-iterator)
17. [Mediator](#17-mediator)
18. [Memento](#18-memento)
19. [Observer](#19-observer)
20. [State](#20-state)
21. [Strategy](#21-strategy)
22. [Template Method](#22-template-method)
23. [Visitor](#23-visitor)

---

# Creational Patterns

## 1. Singleton

**Definition:** Ensures a class has exactly one instance in the whole JVM and provides a single global access point to it.

**When to use:**
- Exactly one shared resource must exist (DB connection pool, logger, config, cache).
- You need lazy creation but global access without passing the instance around everywhere.

**Real-world example:** A `DatabaseConnectionPool` — creating a new pool per request would exhaust connections; every part of the app must share the same one.

```java
import java.util.HashMap;
import java.util.Map;

public class SingletonDemo {

    // Thread-safe lazy singleton via double-checked locking
    public static class DatabaseConnection {
        private static volatile DatabaseConnection instance;
        private final String connectionId;

        private DatabaseConnection() {
            connectionId = "conn-" + System.nanoTime();
            System.out.println("Creating new DB connection: " + connectionId);
        }

        public static DatabaseConnection getInstance() {
            if (instance == null) {                    // 1st check: avoid locking once created
                synchronized (DatabaseConnection.class) {
                    if (instance == null) {            // 2nd check: avoid race between threads
                        instance = new DatabaseConnection();
                    }
                }
            }
            return instance;
        }

        public void query(String sql) {
            System.out.println("[" + connectionId + "] Running: " + sql);
        }
    }

    // Simplest JVM-guaranteed-safe singleton: the enum singleton
    public enum ConfigManager {
        INSTANCE;

        private final Map<String, String> settings = new HashMap<>();

        public void set(String key, String value) { settings.put(key, value); }
        public String get(String key) { return settings.get(key); }
    }

    public static void main(String[] args) {
        DatabaseConnection a = DatabaseConnection.getInstance();
        DatabaseConnection b = DatabaseConnection.getInstance();
        System.out.println("Same instance? " + (a == b));
        a.query("SELECT * FROM users");

        ConfigManager.INSTANCE.set("env", "production");
        System.out.println("Config env = " + ConfigManager.INSTANCE.get("env"));
    }
}
```

**Interview tip:** Know why the `volatile` + double-check matters (visibility + avoiding a half-constructed instance being read by another thread), and that enum singleton is the safest against reflection/serialization attacks.

---

## 2. Factory Method

**Definition:** Defines a method for creating an object but lets subclasses (or a parameter) decide which concrete class gets instantiated.

**When to use:**
- Caller shouldn't know the concrete class it needs, only the interface.
- You expect to add new types over time without touching caller code.

**Real-world example:** A `NotificationFactory` that returns an `Email`, `SMS`, or `Push` notifier based on user preference, without the caller ever seeing the concrete classes.

```java
public class FactoryMethodDemo {

    public interface Notification {
        void notifyUser(String message);
    }

    public static class EmailNotification implements Notification {
        public void notifyUser(String message) {
            System.out.println("Sending EMAIL: " + message);
        }
    }

    public static class SMSNotification implements Notification {
        public void notifyUser(String message) {
            System.out.println("Sending SMS: " + message);
        }
    }

    public static class PushNotification implements Notification {
        public void notifyUser(String message) {
            System.out.println("Sending PUSH: " + message);
        }
    }

    public enum NotificationType { EMAIL, SMS, PUSH }

    public static class NotificationFactory {
        public static Notification create(NotificationType type) {
            switch (type) {
                case EMAIL: return new EmailNotification();
                case SMS:   return new SMSNotification();
                case PUSH:  return new PushNotification();
                default: throw new IllegalArgumentException("Unknown type: " + type);
            }
        }
    }

    public static void main(String[] args) {
        Notification n = NotificationFactory.create(NotificationType.SMS);
        n.notifyUser("Your OTP is 482913");
    }
}
```

---

## 3. Abstract Factory

**Definition:** Provides an interface for creating *families* of related objects, without exposing their concrete classes. (Factory Method makes one product; Abstract Factory makes a matched set.)

**When to use:**
- You must guarantee a set of objects are used together and stay consistent (e.g., all "dark theme" widgets, never mixing dark button + light checkbox).

**Real-world example:** A cross-platform UI toolkit that must produce a `Button` + `Checkbox` that match (both Mac-style or both Windows-style) — never mixed.

```java
public class AbstractFactoryDemo {

    public interface Button { void render(); }
    public interface Checkbox { void render(); }

    // ---- Windows family ----
    public static class WindowsButton implements Button {
        public void render() { System.out.println("Rendering Windows button"); }
    }
    public static class WindowsCheckbox implements Checkbox {
        public void render() { System.out.println("Rendering Windows checkbox"); }
    }

    // ---- Mac family ----
    public static class MacButton implements Button {
        public void render() { System.out.println("Rendering Mac button"); }
    }
    public static class MacCheckbox implements Checkbox {
        public void render() { System.out.println("Rendering Mac checkbox"); }
    }

    public interface UIFactory {
        Button createButton();
        Checkbox createCheckbox();
    }

    public static class WindowsFactory implements UIFactory {
        public Button createButton() { return new WindowsButton(); }
        public Checkbox createCheckbox() { return new WindowsCheckbox(); }
    }

    public static class MacFactory implements UIFactory {
        public Button createButton() { return new MacButton(); }
        public Checkbox createCheckbox() { return new MacCheckbox(); }
    }

    public static void renderUI(UIFactory factory) {
        Button button = factory.createButton();
        Checkbox checkbox = factory.createCheckbox();
        button.render();
        checkbox.render();
    }

    public static void main(String[] args) {
        String os = "mac"; // imagine this comes from System.getProperty("os.name")
        UIFactory factory = os.equals("mac") ? new MacFactory() : new WindowsFactory();
        renderUI(factory); // guaranteed to render a matching pair
    }
}
```

---

## 4. Builder

**Definition:** Separates the construction of a complex object from its representation, building it step by step, so the same construction process can create different representations.

**When to use:**
- Constructor has many optional parameters (telescoping constructor problem).
- You want an immutable object with a readable, fluent construction API.

**Real-world example:** Building an `HttpRequest` with optional headers, query params, body, timeout — instead of a 10-argument constructor.

```java
import java.util.HashMap;
import java.util.Map;

public class BuilderDemo {

    public static final class HttpRequest {
        private final String url;
        private final String method;
        private final Map<String, String> headers;
        private final String body;
        private final int timeoutMs;

        private HttpRequest(Builder b) {
            this.url = b.url;
            this.method = b.method;
            this.headers = b.headers;
            this.body = b.body;
            this.timeoutMs = b.timeoutMs;
        }

        @Override
        public String toString() {
            return method + " " + url + " headers=" + headers +
                   " body=" + body + " timeoutMs=" + timeoutMs;
        }

        public static class Builder {
            private final String url;                  // required
            private String method = "GET";              // sensible defaults
            private final Map<String, String> headers = new HashMap<>();
            private String body = null;
            private int timeoutMs = 5000;

            public Builder(String url) { this.url = url; }

            public Builder method(String method) { this.method = method; return this; }
            public Builder header(String key, String value) { this.headers.put(key, value); return this; }
            public Builder body(String body) { this.body = body; return this; }
            public Builder timeoutMs(int timeoutMs) { this.timeoutMs = timeoutMs; return this; }

            public HttpRequest build() {
                if (url == null || url.isEmpty()) {
                    throw new IllegalStateException("url is required");
                }
                return new HttpRequest(this);
            }
        }
    }

    public static void main(String[] args) {
        HttpRequest request = new HttpRequest.Builder("https://api.example.com/users")
                .method("POST")
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer token123")
                .body("{\"name\":\"Krishna\"}")
                .timeoutMs(3000)
                .build();

        System.out.println(request);
    }
}
```

---

## 5. Prototype

**Definition:** Creates new objects by copying (cloning) an existing "prototype" instance instead of building from scratch — useful when construction is expensive or the exact runtime type is unknown ahead of time.

**When to use:**
- Object creation is costly (heavy computation, DB/network hit) and a similar object already exists.
- You need a copy that is independent of the original (deep copy) to mutate safely.

**Real-world example:** Cloning a fully-configured `GameCharacter` template (base stats already computed) to spawn 100 enemies instantly, instead of recomputing stats each time.

```java
import java.util.ArrayList;
import java.util.List;

public class PrototypeDemo {

    public interface Prototype<T> {
        T deepCopy();
    }

    public static class Weapon implements Prototype<Weapon> {
        String name;
        int damage;

        Weapon(String name, int damage) { this.name = name; this.damage = damage; }

        @Override
        public Weapon deepCopy() { return new Weapon(name, damage); }

        @Override
        public String toString() { return name + "(dmg=" + damage + ")"; }
    }

    public static class GameCharacter implements Prototype<GameCharacter> {
        String type;
        int health;
        List<Weapon> inventory;

        GameCharacter(String type, int health, List<Weapon> inventory) {
            this.type = type;
            this.health = health;
            this.inventory = inventory;
        }

        @Override
        public GameCharacter deepCopy() {
            List<Weapon> copiedInventory = new ArrayList<>();
            for (Weapon w : inventory) {
                copiedInventory.add(w.deepCopy());     // deep copy each weapon too
            }
            return new GameCharacter(type, health, copiedInventory);
        }

        @Override
        public String toString() {
            return type + " hp=" + health + " inventory=" + inventory;
        }
    }

    public static void main(String[] args) {
        GameCharacter orcTemplate = new GameCharacter(
                "Orc", 100, new ArrayList<>(List.of(new Weapon("Axe", 15))));

        GameCharacter orc1 = orcTemplate.deepCopy();
        GameCharacter orc2 = orcTemplate.deepCopy();

        orc1.inventory.get(0).damage = 25; // mutate the clone
        System.out.println("Template: " + orcTemplate); // unaffected
        System.out.println("Orc1:     " + orc1);
        System.out.println("Orc2:     " + orc2);
    }
}
```

---

# Structural Patterns

## 6. Adapter

**Definition:** Converts the interface of a class into another interface that the client expects, letting incompatible classes work together without modifying either.

**When to use:**
- You must integrate a third-party/legacy class whose interface doesn't match what your code expects.

**Real-world example:** Your app expects a `PaymentGateway` interface, but the legacy `LegacyStripeClient` has a totally different method signature — wrap it in an adapter instead of rewriting either side.

```java
public class AdapterDemo {

    // Target interface your application code expects
    public interface PaymentGateway {
        void pay(double amountInDollars);
    }

    // Existing legacy/third-party class you cannot change
    public static class LegacyStripeClient {
        public void makeChargeInCents(long amountInCents, String currency) {
            System.out.println("LegacyStripeClient charging " + amountInCents + " " + currency);
        }
    }

    // Adapter bridges LegacyStripeClient -> PaymentGateway
    public static class StripeAdapter implements PaymentGateway {
        private final LegacyStripeClient legacyClient;

        public StripeAdapter(LegacyStripeClient legacyClient) {
            this.legacyClient = legacyClient;
        }

        @Override
        public void pay(double amountInDollars) {
            long cents = Math.round(amountInDollars * 100);
            legacyClient.makeChargeInCents(cents, "USD");
        }
    }

    public static void checkout(PaymentGateway gateway, double amount) {
        gateway.pay(amount); // client code only knows PaymentGateway
    }

    public static void main(String[] args) {
        PaymentGateway gateway = new StripeAdapter(new LegacyStripeClient());
        checkout(gateway, 49.99);
    }
}
```

---

## 7. Bridge

**Definition:** Decouples an abstraction from its implementation so the two can vary and evolve independently — instead of an exploding class hierarchy for every combination.

**When to use:**
- You have two dimensions of variation (e.g., "what" and "how") and don't want `N × M` subclasses.

**Real-world example:** A `RemoteControl` (abstraction: basic/advanced) that must work with any `Device` (implementation: TV/Radio) — without a class for every remote×device combination.

```java
public class BridgeDemo {

    // Implementation hierarchy
    public interface Device {
        void turnOn();
        void turnOff();
        void setVolume(int level);
    }

    public static class TV implements Device {
        public void turnOn() { System.out.println("TV: ON"); }
        public void turnOff() { System.out.println("TV: OFF"); }
        public void setVolume(int level) { System.out.println("TV volume -> " + level); }
    }

    public static class Radio implements Device {
        public void turnOn() { System.out.println("Radio: ON"); }
        public void turnOff() { System.out.println("Radio: OFF"); }
        public void setVolume(int level) { System.out.println("Radio volume -> " + level); }
    }

    // Abstraction hierarchy — holds a reference (the "bridge") to a Device
    public static abstract class RemoteControl {
        protected final Device device;

        protected RemoteControl(Device device) { this.device = device; }

        public void togglePower() { /* left simple for demo */ }
        public abstract void volumeUp();
    }

    public static class BasicRemote extends RemoteControl {
        public BasicRemote(Device device) { super(device); }

        @Override
        public void volumeUp() { device.setVolume(1); }
    }

    public static class AdvancedRemote extends RemoteControl {
        public AdvancedRemote(Device device) { super(device); }

        @Override
        public void volumeUp() { device.setVolume(5); } // bigger jump + extra features possible
    }

    public static void main(String[] args) {
        RemoteControl remote1 = new BasicRemote(new TV());
        RemoteControl remote2 = new AdvancedRemote(new Radio());

        remote1.device.turnOn();
        remote1.volumeUp();

        remote2.device.turnOn();
        remote2.volumeUp();
    }
}
```

---

## 8. Composite

**Definition:** Composes objects into tree structures so clients can treat individual objects (leaves) and groups of objects (composites) uniformly through one interface.

**When to use:**
- Data is naturally a part-whole hierarchy (file system, UI component tree, org chart) and you want recursive operations (e.g., "total size") without type-checking everywhere.

**Real-world example:** A file system where `getSize()` on a `Directory` recursively sums files and sub-directories, exactly like calling it on a single `File`.

```java
import java.util.ArrayList;
import java.util.List;

public class CompositeDemo {

    public interface FileSystemNode {
        long getSize();
        void print(String indent);
    }

    public static class FileNode implements FileSystemNode {
        private final String name;
        private final long size;

        public FileNode(String name, long size) { this.name = name; this.size = size; }

        @Override
        public long getSize() { return size; }

        @Override
        public void print(String indent) {
            System.out.println(indent + "- " + name + " (" + size + " bytes)");
        }
    }

    public static class DirectoryNode implements FileSystemNode {
        private final String name;
        private final List<FileSystemNode> children = new ArrayList<>();

        public DirectoryNode(String name) { this.name = name; }

        public void add(FileSystemNode node) { children.add(node); }

        @Override
        public long getSize() {
            long total = 0;
            for (FileSystemNode child : children) {
                total += child.getSize();   // recursion — leaf or composite, same call
            }
            return total;
        }

        @Override
        public void print(String indent) {
            System.out.println(indent + "+ " + name + "/");
            for (FileSystemNode child : children) {
                child.print(indent + "  ");
            }
        }
    }

    public static void main(String[] args) {
        DirectoryNode root = new DirectoryNode("project");
        DirectoryNode src = new DirectoryNode("src");
        src.add(new FileNode("Main.java", 1200));
        src.add(new FileNode("Utils.java", 800));

        DirectoryNode docs = new DirectoryNode("docs");
        docs.add(new FileNode("README.md", 300));

        root.add(src);
        root.add(docs);
        root.add(new FileNode("pom.xml", 500));

        root.print("");
        System.out.println("Total size: " + root.getSize() + " bytes");
    }
}
```

---

## 9. Decorator

**Definition:** Attaches new responsibilities to an object dynamically by wrapping it, without altering its class or affecting other instances of the same class.

**When to use:**
- You need to add combinations of optional behaviors (logging + caching + retry) without a subclass explosion.
- Classic real usage: `java.io` streams (`new BufferedReader(new FileReader(...))`).

**Real-world example:** A coffee-ordering system where any combination of `Milk`, `Sugar`, `Whip` can be added to a base `Coffee`, each adding its own cost/description.

```java
public class DecoratorDemo {

    public interface Coffee {
        double cost();
        String description();
    }

    public static class Espresso implements Coffee {
        public double cost() { return 2.0; }
        public String description() { return "Espresso"; }
    }

    // Base decorator — wraps a Coffee, delegates by default
    public static abstract class CoffeeDecorator implements Coffee {
        protected final Coffee wrapped;
        protected CoffeeDecorator(Coffee wrapped) { this.wrapped = wrapped; }
    }

    public static class MilkDecorator extends CoffeeDecorator {
        public MilkDecorator(Coffee wrapped) { super(wrapped); }
        public double cost() { return wrapped.cost() + 0.5; }
        public String description() { return wrapped.description() + " + Milk"; }
    }

    public static class SugarDecorator extends CoffeeDecorator {
        public SugarDecorator(Coffee wrapped) { super(wrapped); }
        public double cost() { return wrapped.cost() + 0.2; }
        public String description() { return wrapped.description() + " + Sugar"; }
    }

    public static class WhipDecorator extends CoffeeDecorator {
        public WhipDecorator(Coffee wrapped) { super(wrapped); }
        public double cost() { return wrapped.cost() + 0.7; }
        public String description() { return wrapped.description() + " + Whip"; }
    }

    public static void main(String[] args) {
        Coffee order = new WhipDecorator(new MilkDecorator(new SugarDecorator(new Espresso())));
        System.out.println(order.description() + " = $" + order.cost());
    }
}
```

---

## 10. Facade

**Definition:** Provides a single, simplified interface to a complex subsystem of classes, hiding the wiring between them.

**When to use:**
- Clients shouldn't need to know/orchestrate many subsystem classes for a common workflow.

**Real-world example:** An `OrderFacade.placeOrder()` that internally coordinates `Inventory`, `Payment`, and `Shipping` — the caller sees one method call.

```java
public class FacadeDemo {

    public static class InventoryService {
        public boolean reserve(String sku, int qty) {
            System.out.println("Inventory: reserved " + qty + " of " + sku);
            return true;
        }
    }

    public static class PaymentService {
        public boolean charge(String customerId, double amount) {
            System.out.println("Payment: charged $" + amount + " to " + customerId);
            return true;
        }
    }

    public static class ShippingService {
        public void schedule(String customerId, String sku) {
            System.out.println("Shipping: scheduled delivery of " + sku + " to " + customerId);
        }
    }

    // Facade — the only thing client code needs to talk to
    public static class OrderFacade {
        private final InventoryService inventory = new InventoryService();
        private final PaymentService payment = new PaymentService();
        private final ShippingService shipping = new ShippingService();

        public void placeOrder(String customerId, String sku, int qty, double amount) {
            if (!inventory.reserve(sku, qty)) {
                throw new IllegalStateException("Out of stock");
            }
            if (!payment.charge(customerId, amount)) {
                throw new IllegalStateException("Payment failed");
            }
            shipping.schedule(customerId, sku);
            System.out.println("Order placed successfully!");
        }
    }

    public static void main(String[] args) {
        OrderFacade facade = new OrderFacade();
        facade.placeOrder("cust-42", "SKU-100", 2, 39.98);
    }
}
```

---

## 11. Flyweight

**Definition:** Minimizes memory usage by sharing common, immutable ("intrinsic") state across many objects instead of storing it redundantly in each one; unique ("extrinsic") state is passed in at use-time.

**When to use:**
- You need huge numbers of similar objects and most of their data is identical/shareable (characters in a text editor, tree instances in a forest renderer).

**Real-world example:** Rendering millions of trees in a game — instead of a full `Tree` object per tree, share one `TreeType` (mesh + texture) and store only per-instance `x, y` coordinates.

```java
import java.util.HashMap;
import java.util.Map;

public class FlyweightDemo {

    // Flyweight: heavy, shared, immutable state
    public static class TreeType {
        private final String name;
        private final String texture; // imagine this is a big loaded asset

        public TreeType(String name, String texture) {
            this.name = name;
            this.texture = texture;
            System.out.println("Loading heavy texture for type: " + name);
        }

        public void render(int x, int y) {
            System.out.println("Rendering " + name + " at (" + x + "," + y + ") using " + texture);
        }
    }

    // Factory that caches/shares flyweights
    public static class TreeTypeFactory {
        private static final Map<String, TreeType> cache = new HashMap<>();

        public static TreeType get(String name, String texture) {
            return cache.computeIfAbsent(name, k -> new TreeType(name, texture));
        }
    }

    // Extrinsic state: lightweight, unique per instance
    public static class Tree {
        private final int x, y;
        private final TreeType type; // shared reference, not a copy

        public Tree(int x, int y, TreeType type) {
            this.x = x; this.y = y; this.type = type;
        }

        public void render() { type.render(x, y); }
    }

    public static void main(String[] args) {
        TreeType oak = TreeTypeFactory.get("Oak", "oak_texture.png");
        TreeType pine = TreeTypeFactory.get("Pine", "pine_texture.png");

        Tree[] forest = {
            new Tree(1, 2, oak),
            new Tree(5, 8, oak),   // reuses the same oak TreeType — no reload
            new Tree(3, 3, pine),
        };

        for (Tree t : forest) t.render();
    }
}
```

---

## 12. Proxy

**Definition:** Provides a stand-in/surrogate for another object to control access to it — for lazy loading, access control, caching, or logging, transparently to the client.

**When to use:**
- The real object is expensive to create (lazy-load it), or access needs a guard (permissions), or you want to add caching/logging without touching the real class.

**Real-world example:** An `ImageProxy` that defers loading a large image from disk until `display()` is actually called.

```java
public class ProxyDemo {

    public interface Image {
        void display();
    }

    // Real, expensive object
    public static class RealImage implements Image {
        private final String filename;

        public RealImage(String filename) {
            this.filename = filename;
            loadFromDisk(); // expensive
        }

        private void loadFromDisk() {
            System.out.println("Loading " + filename + " from disk (expensive!)");
        }

        @Override
        public void display() {
            System.out.println("Displaying " + filename);
        }
    }

    // Proxy — defers creation of RealImage until actually needed
    public static class LazyImageProxy implements Image {
        private final String filename;
        private RealImage realImage; // null until first use

        public LazyImageProxy(String filename) { this.filename = filename; }

        @Override
        public void display() {
            if (realImage == null) {
                realImage = new RealImage(filename); // lazy init
            }
            realImage.display();
        }
    }

    public static void main(String[] args) {
        Image image = new LazyImageProxy("vacation.jpg");
        System.out.println("Proxy created, image not loaded yet.");
        image.display(); // loads now
        image.display(); // reuses already-loaded RealImage
    }
}
```

---

# Behavioral Patterns

## 13. Chain of Responsibility

**Definition:** Passes a request along a chain of handlers; each handler decides either to process the request or pass it to the next handler in the chain.

**When to use:**
- Multiple objects might handle a request and you don't want the sender to know which one will, or want to change the chain order dynamically.

**Real-world example:** A support-ticket system that escalates: `L1Support` → `L2Support` → `L3Support`, each handling what it can and passing the rest up.

```java
public class ChainOfResponsibilityDemo {

    public enum Severity { LOW, MEDIUM, HIGH }

    public static class Ticket {
        String issue;
        Severity severity;
        Ticket(String issue, Severity severity) { this.issue = issue; this.severity = severity; }
    }

    public static abstract class SupportHandler {
        protected SupportHandler next;

        public SupportHandler setNext(SupportHandler next) {
            this.next = next;
            return next; // allows chaining: h1.setNext(h2).setNext(h3)
        }

        public void handle(Ticket ticket) {
            if (canHandle(ticket)) {
                resolve(ticket);
            } else if (next != null) {
                next.handle(ticket);
            } else {
                System.out.println("No handler could resolve: " + ticket.issue);
            }
        }

        protected abstract boolean canHandle(Ticket ticket);
        protected abstract void resolve(Ticket ticket);
    }

    public static class L1Support extends SupportHandler {
        protected boolean canHandle(Ticket t) { return t.severity == Severity.LOW; }
        protected void resolve(Ticket t) { System.out.println("L1 resolved: " + t.issue); }
    }

    public static class L2Support extends SupportHandler {
        protected boolean canHandle(Ticket t) { return t.severity == Severity.MEDIUM; }
        protected void resolve(Ticket t) { System.out.println("L2 resolved: " + t.issue); }
    }

    public static class L3Support extends SupportHandler {
        protected boolean canHandle(Ticket t) { return t.severity == Severity.HIGH; }
        protected void resolve(Ticket t) { System.out.println("L3 resolved: " + t.issue); }
    }

    public static void main(String[] args) {
        SupportHandler l1 = new L1Support();
        l1.setNext(new L2Support()).setNext(new L3Support());

        l1.handle(new Ticket("Password reset", Severity.LOW));
        l1.handle(new Ticket("Data corruption", Severity.HIGH));
    }
}
```

---

## 14. Command

**Definition:** Encapsulates a request (an action + its parameters) as an object, so it can be queued, logged, passed around, or undone — decoupling the invoker from the executor.

**When to use:**
- You need undo/redo, request queues, macro recording, or to parameterize objects with an action.

**Real-world example:** A text editor's toolbar buttons each hold a `Command` object (`TypeCommand`, `DeleteCommand`) that supports `execute()`/`undo()`, enabling a global undo stack.

```java
import java.util.ArrayDeque;
import java.util.Deque;

public class CommandDemo {

    public static class TextDocument {
        private final StringBuilder content = new StringBuilder();

        public void append(String text) { content.append(text); }
        public void delete(int length) {
            content.delete(content.length() - length, content.length());
        }
        public String getContent() { return content.toString(); }
    }

    public interface Command {
        void execute();
        void undo();
    }

    public static class AppendTextCommand implements Command {
        private final TextDocument doc;
        private final String text;

        public AppendTextCommand(TextDocument doc, String text) {
            this.doc = doc; this.text = text;
        }

        @Override public void execute() { doc.append(text); }
        @Override public void undo() { doc.delete(text.length()); }
    }

    public static class CommandInvoker {
        private final Deque<Command> history = new ArrayDeque<>();

        public void run(Command command) {
            command.execute();
            history.push(command);
        }

        public void undoLast() {
            if (!history.isEmpty()) {
                history.pop().undo();
            }
        }
    }

    public static void main(String[] args) {
        TextDocument doc = new TextDocument();
        CommandInvoker invoker = new CommandInvoker();

        invoker.run(new AppendTextCommand(doc, "Hello, "));
        invoker.run(new AppendTextCommand(doc, "World!"));
        System.out.println(doc.getContent()); // Hello, World!

        invoker.undoLast();
        System.out.println(doc.getContent()); // Hello,
    }
}
```

---

## 15. Interpreter

**Definition:** Given a simple grammar/language, defines a class-based representation for its rules and an interpreter that evaluates sentences in that language.

**When to use:**
- You have a small, well-defined grammar to evaluate repeatedly (search filters, rule engines, simple expression languages) — not a replacement for a full parser generator on complex grammars.

**Real-world example:** Evaluating simple boolean/arithmetic expressions built at runtime, like a rules engine: `age > 18 AND country == "US"`.

```java
import java.util.Map;

public class InterpreterDemo {

    public interface Expression {
        int interpret(Map<String, Integer> context);
    }

    // Terminal expression: a variable lookup
    public static class Variable implements Expression {
        private final String name;
        public Variable(String name) { this.name = name; }
        public int interpret(Map<String, Integer> context) { return context.get(name); }
    }

    // Terminal expression: a literal number
    public static class Number implements Expression {
        private final int value;
        public Number(int value) { this.value = value; }
        public int interpret(Map<String, Integer> context) { return value; }
    }

    // Non-terminal expression: addition of two sub-expressions
    public static class Add implements Expression {
        private final Expression left, right;
        public Add(Expression left, Expression right) { this.left = left; this.right = right; }
        public int interpret(Map<String, Integer> context) {
            return left.interpret(context) + right.interpret(context);
        }
    }

    // Non-terminal expression: multiplication
    public static class Multiply implements Expression {
        private final Expression left, right;
        public Multiply(Expression left, Expression right) { this.left = left; this.right = right; }
        public int interpret(Map<String, Integer> context) {
            return left.interpret(context) * right.interpret(context);
        }
    }

    public static void main(String[] args) {
        // Represents: (price * quantity) + shippingFee
        Expression expr = new Add(
                new Multiply(new Variable("price"), new Variable("quantity")),
                new Variable("shippingFee"));

        Map<String, Integer> context = Map.of("price", 20, "quantity", 3, "shippingFee", 5);
        System.out.println("Total = " + expr.interpret(context)); // 20*3 + 5 = 65
    }
}
```

---

## 16. Iterator

**Definition:** Provides a way to sequentially access elements of a collection without exposing its underlying representation (array, linked list, tree, etc.).

**When to use:**
- You want to traverse a custom data structure using a standard interface (`hasNext()`/`next()`) — this is exactly what Java's `Iterable`/`Iterator` interfaces standardize.

**Real-world example:** A custom `CircularBuffer` collection that needs its own traversal order/logic while still being usable in a `for-each` loop.

```java
import java.util.Iterator;
import java.util.NoSuchElementException;

public class IteratorDemo {

    public static class CircularBuffer<T> implements Iterable<T> {
        private final Object[] items;
        private int size = 0;
        private int start = 0;

        public CircularBuffer(int capacity) { items = new Object[capacity]; }

        public void add(T item) {
            int index = (start + size) % items.length;
            if (size < items.length) {
                items[index] = item;
                size++;
            } else {
                items[index] = item;    // overwrite oldest
                start = (start + 1) % items.length;
            }
        }

        @Override
        public Iterator<T> iterator() {
            return new Iterator<T>() {
                private int count = 0;

                @Override
                public boolean hasNext() { return count < size; }

                @Override
                @SuppressWarnings("unchecked")
                public T next() {
                    if (!hasNext()) throw new NoSuchElementException();
                    T item = (T) items[(start + count) % items.length];
                    count++;
                    return item;
                }
            };
        }
    }

    public static void main(String[] args) {
        CircularBuffer<Integer> buffer = new CircularBuffer<>(3);
        buffer.add(1);
        buffer.add(2);
        buffer.add(3);
        buffer.add(4); // overwrites 1

        for (int value : buffer) { // works because CircularBuffer implements Iterable
            System.out.println(value);
        }
    }
}
```

---

## 17. Mediator

**Definition:** Defines an object that encapsulates how a set of objects interact, so those objects don't reference each other directly, reducing many-to-many coupling to many-to-one.

**When to use:**
- Many objects need to talk to each other in complex ways; a mediator centralizes that communication logic.

**Real-world example:** A `ChatRoom` mediator through which all `User` objects send messages — users never hold references to each other directly.

```java
import java.util.ArrayList;
import java.util.List;

public class MediatorDemo {

    public interface ChatRoomMediator {
        void sendMessage(String message, User sender);
        void addUser(User user);
    }

    public static class ChatRoom implements ChatRoomMediator {
        private final List<User> users = new ArrayList<>();

        @Override
        public void addUser(User user) { users.add(user); }

        @Override
        public void sendMessage(String message, User sender) {
            for (User user : users) {
                if (user != sender) {
                    user.receive(message, sender.getName());
                }
            }
        }
    }

    public static class User {
        private final String name;
        private final ChatRoomMediator mediator;

        public User(String name, ChatRoomMediator mediator) {
            this.name = name;
            this.mediator = mediator;
            mediator.addUser(this);
        }

        public String getName() { return name; }

        public void send(String message) {
            System.out.println(name + " sends: " + message);
            mediator.sendMessage(message, this);
        }

        public void receive(String message, String senderName) {
            System.out.println(name + " received from " + senderName + ": " + message);
        }
    }

    public static void main(String[] args) {
        ChatRoomMediator room = new ChatRoom();
        User alice = new User("Alice", room);
        User bob = new User("Bob", room);
        new User("Carol", room);

        alice.send("Hey everyone!");
        bob.send("Hi Alice!");
    }
}
```

---

## 18. Memento

**Definition:** Captures and externalizes an object's internal state (without violating encapsulation) so it can be restored to that state later.

**When to use:**
- You need undo/rollback/checkpoint functionality but don't want the object's internals exposed to the code managing history.

**Real-world example:** An undo feature in a text editor that saves snapshots of the document and restores them on request.

```java
import java.util.ArrayDeque;
import java.util.Deque;

public class MementoDemo {

    // Memento — immutable snapshot, opaque to everyone except the originator
    public static final class DocumentMemento {
        private final String content;
        private DocumentMemento(String content) { this.content = content; }
    }

    // Originator — the object whose state we snapshot/restore
    public static class Document {
        private String content = "";

        public void write(String text) { content += text; }
        public String getContent() { return content; }

        public DocumentMemento save() { return new DocumentMemento(content); }

        public void restore(DocumentMemento memento) { this.content = memento.content; }
    }

    // Caretaker — holds history, never inspects memento internals
    public static class History {
        private final Deque<DocumentMemento> snapshots = new ArrayDeque<>();

        public void push(DocumentMemento memento) { snapshots.push(memento); }

        public DocumentMemento pop() { return snapshots.pop(); }
    }

    public static void main(String[] args) {
        Document doc = new Document();
        History history = new History();

        doc.write("Hello");
        history.push(doc.save());  // checkpoint 1

        doc.write(", World!");
        history.push(doc.save());  // checkpoint 2

        doc.write(" Extra text that we regret.");
        System.out.println("Before undo: " + doc.getContent());

        doc.restore(history.pop()); // undo to checkpoint 2
        System.out.println("After 1 undo: " + doc.getContent());

        doc.restore(history.pop()); // undo to checkpoint 1
        System.out.println("After 2 undos: " + doc.getContent());
    }
}
```

---

## 19. Observer

**Definition:** Defines a one-to-many dependency between objects so that when one object (the subject) changes state, all its dependents (observers) are notified and updated automatically.

**When to use:**
- Multiple parts of a system need to react to an event/state change without the source knowing who's listening — pub/sub, event listeners, reactive UIs.

**Real-world example:** A `StockPrice` subject that notifies multiple registered `PriceObserver`s (a mobile app, an email alert service) whenever the price changes.

```java
import java.util.ArrayList;
import java.util.List;

public class ObserverDemo {

    public interface PriceObserver {
        void onPriceChanged(String symbol, double newPrice);
    }

    public static class StockPrice {
        private final String symbol;
        private double price;
        private final List<PriceObserver> observers = new ArrayList<>();

        public StockPrice(String symbol, double initialPrice) {
            this.symbol = symbol;
            this.price = initialPrice;
        }

        public void subscribe(PriceObserver observer) { observers.add(observer); }
        public void unsubscribe(PriceObserver observer) { observers.remove(observer); }

        public void setPrice(double newPrice) {
            this.price = newPrice;
            notifyObservers();
        }

        private void notifyObservers() {
            for (PriceObserver observer : observers) {
                observer.onPriceChanged(symbol, price);
            }
        }
    }

    public static class MobileAppAlert implements PriceObserver {
        public void onPriceChanged(String symbol, double newPrice) {
            System.out.println("[Mobile App] " + symbol + " is now $" + newPrice);
        }
    }

    public static class EmailAlert implements PriceObserver {
        public void onPriceChanged(String symbol, double newPrice) {
            System.out.println("[Email] Alert: " + symbol + " changed to $" + newPrice);
        }
    }

    public static void main(String[] args) {
        StockPrice googleStock = new StockPrice("GOOG", 150.0);

        PriceObserver mobile = new MobileAppAlert();
        googleStock.subscribe(mobile);
        googleStock.subscribe(new EmailAlert());

        googleStock.setPrice(152.5);

        googleStock.unsubscribe(mobile);
        googleStock.setPrice(149.0); // only email alert fires now
    }
}
```

---

## 20. State

**Definition:** Allows an object to alter its behavior when its internal state changes, by delegating state-specific behavior to separate state objects — the object appears to change its class at runtime.

**When to use:**
- An object's behavior depends heavily on a mode/status, and you'd otherwise need a big `if/switch` on that status scattered across many methods.

**Real-world example:** An `Order` that behaves differently when `PENDING`, `SHIPPED`, `DELIVERED`, or `CANCELLED` — each state decides what transitions are legal.

```java
public class StateDemo {

    public interface OrderState {
        void next(OrderContext order);
        void cancel(OrderContext order);
        String name();
    }

    public static class PendingState implements OrderState {
        public void next(OrderContext order) {
            System.out.println("Order shipped.");
            order.setState(new ShippedState());
        }
        public void cancel(OrderContext order) {
            System.out.println("Order cancelled.");
            order.setState(new CancelledState());
        }
        public String name() { return "PENDING"; }
    }

    public static class ShippedState implements OrderState {
        public void next(OrderContext order) {
            System.out.println("Order delivered.");
            order.setState(new DeliveredState());
        }
        public void cancel(OrderContext order) {
            System.out.println("Cannot cancel — already shipped.");
        }
        public String name() { return "SHIPPED"; }
    }

    public static class DeliveredState implements OrderState {
        public void next(OrderContext order) {
            System.out.println("Order already delivered — nothing to do.");
        }
        public void cancel(OrderContext order) {
            System.out.println("Cannot cancel — already delivered.");
        }
        public String name() { return "DELIVERED"; }
    }

    public static class CancelledState implements OrderState {
        public void next(OrderContext order) {
            System.out.println("Cannot progress — order is cancelled.");
        }
        public void cancel(OrderContext order) {
            System.out.println("Order already cancelled.");
        }
        public String name() { return "CANCELLED"; }
    }

    public static class OrderContext {
        private OrderState state = new PendingState();

        public void setState(OrderState state) { this.state = state; }
        public void next() { state.next(this); }
        public void cancel() { state.cancel(this); }
        public String currentState() { return state.name(); }
    }

    public static void main(String[] args) {
        OrderContext order = new OrderContext();
        System.out.println("State: " + order.currentState());

        order.next();  // PENDING -> SHIPPED
        order.cancel(); // rejected, already shipped
        order.next();  // SHIPPED -> DELIVERED
        System.out.println("Final state: " + order.currentState());
    }
}
```

---

## 21. Strategy

**Definition:** Defines a family of interchangeable algorithms, encapsulates each behind a common interface, and lets the client select/swap the algorithm at runtime.

**When to use:**
- Multiple ways to do the same task exist (sort, compress, pay) and you want to switch between them without `if/else` chains or subclassing the context.

**Real-world example:** A `Checkout` process that can pay via `CreditCardStrategy`, `PayPalStrategy`, or `UpiStrategy` chosen at runtime by the user.

```java
public class StrategyDemo {

    public interface PaymentStrategy {
        void pay(double amount);
    }

    public static class CreditCardStrategy implements PaymentStrategy {
        private final String cardNumber;
        public CreditCardStrategy(String cardNumber) { this.cardNumber = cardNumber; }
        public void pay(double amount) {
            System.out.println("Paid $" + amount + " using Credit Card ending " +
                    cardNumber.substring(cardNumber.length() - 4));
        }
    }

    public static class PayPalStrategy implements PaymentStrategy {
        private final String email;
        public PayPalStrategy(String email) { this.email = email; }
        public void pay(double amount) {
            System.out.println("Paid $" + amount + " using PayPal account " + email);
        }
    }

    public static class UpiStrategy implements PaymentStrategy {
        private final String upiId;
        public UpiStrategy(String upiId) { this.upiId = upiId; }
        public void pay(double amount) {
            System.out.println("Paid $" + amount + " using UPI id " + upiId);
        }
    }

    public static class Checkout {
        private PaymentStrategy strategy;

        public void setStrategy(PaymentStrategy strategy) { this.strategy = strategy; }

        public void checkout(double amount) {
            if (strategy == null) throw new IllegalStateException("No payment method selected");
            strategy.pay(amount);
        }
    }

    public static void main(String[] args) {
        Checkout checkout = new Checkout();

        checkout.setStrategy(new CreditCardStrategy("4111111111111234"));
        checkout.checkout(99.99);

        checkout.setStrategy(new UpiStrategy("krishna@upi"));
        checkout.checkout(20.00); // swapped strategy at runtime, no other code changed
    }
}
```

---

## 22. Template Method

**Definition:** Defines the skeleton of an algorithm in a base-class method, deferring specific steps to subclasses — subclasses redefine steps without changing the overall algorithm structure.

**When to use:**
- Several classes follow the exact same overall process but differ in a few steps (report generation, data pipelines, game turns).

**Real-world example:** A `DataPipeline` template with fixed steps `readData() -> processData() -> writeData()`, where `CsvPipeline` and `JsonPipeline` only override `readData`/`writeData`.

```java
public class TemplateMethodDemo {

    public static abstract class DataPipeline {

        // Template method — defines the fixed skeleton; marked final so subclasses can't reorder it
        public final void run() {
            String raw = readData();
            String processed = processData(raw);
            writeData(processed);
        }

        protected abstract String readData();

        // Shared default step — subclasses may override if they need something different
        protected String processData(String raw) {
            return raw.trim().toUpperCase();
        }

        protected abstract void writeData(String data);
    }

    public static class CsvPipeline extends DataPipeline {
        protected String readData() {
            System.out.println("Reading CSV file...");
            return "  name,age\nkrishna,32  ";
        }
        protected void writeData(String data) {
            System.out.println("Writing to CSV output: " + data);
        }
    }

    public static class JsonPipeline extends DataPipeline {
        protected String readData() {
            System.out.println("Reading JSON file...");
            return "  {\"name\":\"krishna\"}  ";
        }
        protected String processData(String raw) {
            System.out.println("Custom JSON processing (skip uppercase)");
            return raw.trim();
        }
        protected void writeData(String data) {
            System.out.println("Writing to JSON output: " + data);
        }
    }

    public static void main(String[] args) {
        DataPipeline csv = new CsvPipeline();
        csv.run();

        DataPipeline json = new JsonPipeline();
        json.run();
    }
}
```

---

## 23. Visitor

**Definition:** Lets you define a new operation over a set of related element classes without modifying those classes — the operation "visits" each element, and each element accepts the visitor and calls back the right method for its type.

**When to use:**
- You need to add many unrelated operations (tax calculation, discount, export) across a fixed set of element types, and don't want to keep editing every element class each time.

**Real-world example:** A shopping cart with `Book`, `Electronics`, and `Grocery` items where a `TaxVisitor` computes tax differently per item type — without putting tax logic inside the item classes.

```java
import java.util.List;

public class VisitorDemo {

    public interface Visitor {
        double visit(Book book);
        double visit(Electronics electronics);
        double visit(Grocery grocery);
    }

    public interface CartItem {
        double accept(Visitor visitor); // double-dispatch: picks the right visit() overload
    }

    public static class Book implements CartItem {
        double price;
        Book(double price) { this.price = price; }
        public double accept(Visitor visitor) { return visitor.visit(this); }
    }

    public static class Electronics implements CartItem {
        double price;
        Electronics(double price) { this.price = price; }
        public double accept(Visitor visitor) { return visitor.visit(this); }
    }

    public static class Grocery implements CartItem {
        double price;
        Grocery(double price) { this.price = price; }
        public double accept(Visitor visitor) { return visitor.visit(this); }
    }

    // A concrete operation, kept entirely outside the item classes
    public static class TaxVisitor implements Visitor {
        public double visit(Book book) { return book.price * 1.0; }              // books: no tax
        public double visit(Electronics electronics) { return electronics.price * 1.18; } // 18% tax
        public double visit(Grocery grocery) { return grocery.price * 1.05; }    // 5% tax
    }

    public static void main(String[] args) {
        List<CartItem> cart = List.of(
                new Book(20.0),
                new Electronics(100.0),
                new Grocery(10.0)
        );

        Visitor taxVisitor = new TaxVisitor();
        double total = 0;
        for (CartItem item : cart) {
            total += item.accept(taxVisitor); // each item routes to the correct visit() overload
        }
        System.out.println("Total with tax: $" + total);
    }
}
```

---

## Quick Reference Table

| # | Pattern | Category | One-line intent |
|---|---------|----------|------------------|
| 1 | Singleton | Creational | One instance, global access |
| 2 | Factory Method | Creational | Subclass/param decides concrete class |
| 3 | Abstract Factory | Creational | Create matched families of objects |
| 4 | Builder | Creational | Step-by-step construction of complex objects |
| 5 | Prototype | Creational | Clone existing object instead of building new |
| 6 | Adapter | Structural | Make incompatible interfaces work together |
| 7 | Bridge | Structural | Decouple abstraction from implementation |
| 8 | Composite | Structural | Treat tree of objects uniformly (part-whole) |
| 9 | Decorator | Structural | Add behavior dynamically via wrapping |
| 10 | Facade | Structural | Simple interface over a complex subsystem |
| 11 | Flyweight | Structural | Share state to save memory across many objects |
| 12 | Proxy | Structural | Control/defer access to a real object |
| 13 | Chain of Responsibility | Behavioral | Pass request along a chain of handlers |
| 14 | Command | Behavioral | Encapsulate a request as an object (undo/queue) |
| 15 | Interpreter | Behavioral | Evaluate sentences in a small grammar |
| 16 | Iterator | Behavioral | Sequential access without exposing internals |
| 17 | Mediator | Behavioral | Centralize communication between objects |
| 18 | Memento | Behavioral | Snapshot/restore state without breaking encapsulation |
| 19 | Observer | Behavioral | Notify dependents automatically on state change |
| 20 | State | Behavioral | Change behavior based on internal state |
| 21 | Strategy | Behavioral | Swap interchangeable algorithms at runtime |
| 22 | Template Method | Behavioral | Fixed algorithm skeleton, overridable steps |
| 23 | Visitor | Behavioral | New operations over fixed element types, no edits |
