# Annotations in Java

## What are Annotations?

**Annotations** provide **metadata** about the code. They don't directly affect program execution but provide information to the compiler or runtime.

Think of them as **labels** or **tags** on your code!

## Built-in Annotations

### @Override
Indicates method is overriding a parent method.

```java
class Animal {
    void makeSound() {
        System.out.println("Some sound");
    }
}

class Dog extends Animal {
    @Override
    void makeSound() {  // Overriding parent method
        System.out.println("Bark!");
    }
}
```

### @Deprecated
Marks code as outdated (shouldn't be used).

```java
class Calculator {
    @Deprecated
    int oldAdd(int a, int b) {
        return a + b;
    }

    int add(int a, int b) {
        return a + b;
    }
}
```

### @SuppressWarnings
Tells compiler to suppress specific warnings.

```java
@SuppressWarnings("unchecked")
public void myMethod() {
    // Code that generates warnings
}
```

### @FunctionalInterface
Indicates interface is a functional interface (only one abstract method).

```java
@FunctionalInterface
interface Calculator {
    int calculate(int a, int b);
}
```

## Creating Custom Annotations

```java
import java.lang.annotation.*;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface MyAnnotation {
    String value() default "Default value";
    int priority() default 1;
}

class Demo {
    @MyAnnotation(value = "Important method", priority = 5)
    public void myMethod() {
        System.out.println("Method with annotation");
    }
}
```

## Common Use Cases

✅ **@Override** - Ensure method overriding
✅ **@Deprecated** - Mark old code
✅ **@SuppressWarnings** - Suppress compiler warnings
✅ **@Entity** - JPA entity (database)
✅ **@Controller** - Spring controller
✅ **@Test** - JUnit test method

## Meta-Annotations

### @Retention
How long annotation is kept.
- `SOURCE` - Discarded by compiler
- `CLASS` - In .class file, not runtime
- `RUNTIME` - Available at runtime

### @Target
Where annotation can be used.
- `TYPE` - Class, interface
- `METHOD` - Method
- `FIELD` - Field
- `PARAMETER` - Parameter

## Quick Tips

💡 Annotations start with `@`
💡 Use `@Override` to catch errors early
💡 Custom annotations need meta-annotations
💡 Annotations provide metadata, not behavior

---

**Previous:** [File I/O](./04-File-IO.md)

**🎉 You've completed the Java Documentation!**

Start from the [Main README](../README.md)
