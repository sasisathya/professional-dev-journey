# File I/O in Java

## What is File I/O?

**File I/O** (Input/Output) is reading from and writing to files.

## Writing to a File

```java
import java.io.*;

public class FileWriteDemo {
    public static void main(String[] args) {
        try {
            FileWriter writer = new FileWriter("output.txt");
            writer.write("Hello, World!\n");
            writer.write("This is Java File I/O\n");
            writer.close();
            System.out.println("File written successfully!");
        } catch (IOException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}
```

## Reading from a File

```java
import java.io.*;

public class FileReadDemo {
    public static void main(String[] args) {
        try {
            BufferedReader reader = new BufferedReader(new FileReader("output.txt"));
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
            reader.close();
        } catch (IOException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}
```

## Using try-with-resources

```java
import java.io.*;

public class TryWithResourcesDemo {
    public static void main(String[] args) {
        // Writing
        try (FileWriter writer = new FileWriter("data.txt")) {
            writer.write("Auto-closed resource!");
        } catch (IOException e) {
            e.printStackTrace();
        }

        // Reading
        try (BufferedReader reader = new BufferedReader(new FileReader("data.txt"))) {
            String line = reader.readLine();
            System.out.println(line);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

## File Operations

```java
import java.io.File;

public class FileOperations {
    public static void main(String[] args) {
        File file = new File("test.txt");

        // Check if exists
        if (file.exists()) {
            System.out.println("File exists!");
            System.out.println("Name: " + file.getName());
            System.out.println("Path: " + file.getAbsolutePath());
            System.out.println("Size: " + file.length() + " bytes");
            System.out.println("Readable: " + file.canRead());
            System.out.println("Writable: " + file.canWrite());
        } else {
            System.out.println("File does not exist!");
        }

        // Create new file
        try {
            if (file.createNewFile()) {
                System.out.println("File created!");
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        // Delete file
        // file.delete();
    }
}
```

## Quick Tips

💡 Always close files after use
💡 Use **try-with-resources** for auto-closing
💡 Handle **IOException**
💡 Check if file exists before reading

---

**Previous:** [Streams API](./03-Streams-API.md) | **Next:** [Annotations](./05-Annotations.md)
