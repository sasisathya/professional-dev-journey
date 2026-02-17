# Generics in Java

## What are Generics?

**Generics** allow you to write code that works with different types while maintaining type safety.

Think of it like a **flexible container** that can hold any type, but you specify which type!

## Without Generics

```java
ArrayList list = new ArrayList();
list.add("Hello");
list.add(10);
list.add(3.14);

String str = (String) list.get(0);  // Need casting
Integer num = (Integer) list.get(1);  // Need casting
```

## With Generics

```java
ArrayList<String> list = new ArrayList<String>();
list.add("Hello");
list.add("World");
// list.add(10);  // ERROR! Only String allowed

String str = list.get(0);  // No casting needed!
```

## Generic Class

```java
class Box<T> {
    private T content;

    void set(T content) {
        this.content = content;
    }

    T get() {
        return content;
    }
}

public class GenericsDemo {
    public static void main(String[] args) {
        // Box for String
        Box<String> stringBox = new Box<>();
        stringBox.set("Hello");
        String str = stringBox.get();
        System.out.println(str);

        // Box for Integer
        Box<Integer> intBox = new Box<>();
        intBox.set(123);
        Integer num = intBox.get();
        System.out.println(num);
    }
}
```

## Generic Method

```java
public class GenericMethod {
    static <T> void printArray(T[] array) {
        for (T element : array) {
            System.out.print(element + " ");
        }
        System.out.println();
    }

    public static void main(String[] args) {
        Integer[] intArray = {1, 2, 3, 4, 5};
        String[] strArray = {"Hello", "World"};

        printArray(intArray);  // 1 2 3 4 5
        printArray(strArray);  // Hello World
    }
}
```

## Benefits

✅ **Type safety** - Catch errors at compile time
✅ **No casting** - Type is known
✅ **Reusable code** - Works with multiple types
✅ **Cleaner code** - More readable

## Quick Tips

💡 Use `<T>` for type parameter (T = Type)
💡 Common names: T (Type), E (Element), K (Key), V (Value)
💡 Generics are checked at compile time
💡 Cannot use primitive types (use wrapper classes)

---

**Previous:** [Synchronization](../05-Multithreading/04-Synchronization.md) | **Next:** [Lambda Expressions](./02-Lambda-Expressions.md)
