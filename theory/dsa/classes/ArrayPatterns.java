class ArrayPatterns {

    // 1. First occurrence
    static int firstOccurrence(int[] a, int x) {
        for (int i = 0; i < a.length; i++)
            if (a[i] == x) return i;
        return -1;
    }

    // 2. Last occurrence
    static int lastOccurrence(int[] a, int x) {
        for (int i = a.length - 1; i >= 0; i--)
            if (a[i] == x) return i;
        return -1;
    }

    // 3. Second largest distinct element
    static int secondLargest(int[] a) {
        int largest = Integer.MIN_VALUE;
        int second = Integer.MIN_VALUE;

        for (int x : a) {
            if (x > largest) {
                second = largest;
                largest = x;
            } else if (x > second && x != largest) {
                second = x;
            }
        }
        return second;
    }

    // 4. Count positive, negative, even and odd
    static void countTypes(int[] a) {
        int positive = 0, negative = 0, even = 0, odd = 0;

        for (int x : a) {
            if (x > 0) positive++;
            if (x < 0) negative++;
            if (x % 2 == 0) even++;
            else odd++;
        }

        System.out.println(positive + " " + negative + " " + even + " " + odd);
    }

    // 5. Sum and average
    static double average(int[] a) {
        long sum = 0;

        for (int x : a) sum += x;

        return (double) sum / a.length;
    }

    // 6. Check duplicates
    static boolean hasDuplicates(int[] a) {
        Set<Integer> set = new HashSet<>();

        for (int x : a)
            if (!set.add(x)) return true;

        return false;
    }

    // 7. Missing number from 1 to n
    static int missingNumber(int[] a, int n) {
        int expected = n * (n + 1) / 2;
        int actual = 0;

        for (int x : a) actual += x;

        return expected - actual;
    }

    // 8. Unique element: every other element appears twice
    static int uniqueElement(int[] a) {
        int result = 0;

        for (int x : a) result ^= x;

        return result;
    }

    // 9. Frequency of each element
    static Map<Integer, Integer> frequency(int[] a) {
        Map<Integer, Integer> map = new HashMap<>();

        for (int x : a)
            map.put(x, map.getOrDefault(x, 0) + 1);

        return map;
    }

    // 10. Move zeros to the end
    static void moveZeros(int[] a) {
        int index = 0;

        for (int x : a)
            if (x != 0) a[index++] = x;

        while (index < a.length)
            a[index++] = 0;
    }

    // 11. Separate positive and negative numbers
    static int[] separatePositiveNegative(int[] a) {
        int[] result = new int[a.length];
        int index = 0;

        for (int x : a)
            if (x < 0) result[index++] = x;

        for (int x : a)
            if (x >= 0) result[index++] = x;

        return result;
    }

    // 12. Remove duplicates from sorted array
    // Returns new logical length
    static int removeDuplicatesSorted(int[] a) {
        if (a.length == 0) return 0;

        int index = 1;

        for (int i = 1; i < a.length; i++)
            if (a[i] != a[i - 1])
                a[index++] = a[i];

        return index;
    }

    // 13. Common elements in two arrays
    static Set<Integer> commonElements(int[] a, int[] b) {
        Set<Integer> first = new HashSet<>();
        Set<Integer> common = new HashSet<>();

        for (int x : a) first.add(x);
        for (int x : b)
            if (first.contains(x)) common.add(x);

        return common;
    }

    // 14. Intersection
    static Set<Integer> intersection(int[] a, int[] b) {
        return commonElements(a, b);
    }

    // 15. Union
    static Set<Integer> union(int[] a, int[] b) {
        Set<Integer> result = new HashSet<>();

        for (int x : a) result.add(x);
        for (int x : b) result.add(x);

        return result;
    }

    // 16. Leaders: all elements greater than everything on right
    static List<Integer> leaders(int[] a) {
        List<Integer> result = new ArrayList<>();
        int maxRight = Integer.MIN_VALUE;

        for (int i = a.length - 1; i >= 0; i--) {
            if (a[i] >= maxRight) {
                result.add(a[i]);
                maxRight = a[i];
            }
        }

        Collections.reverse(result);
        return result;
    }

    // 17. Equilibrium index
    static int equilibriumIndex(int[] a) {
        long total = 0;
        for (int x : a) total += x;

        long leftSum = 0;

        for (int i = 0; i < a.length; i++) {
            total -= a[i];

            if (leftSum == total) return i;

            leftSum += a[i];
        }

        return -1;
    }

    // 18. Majority element
    static int majorityElement(int[] a) {
        int candidate = 0;
        int count = 0;

        for (int x : a) {
            if (count == 0) candidate = x;
            count += (x == candidate) ? 1 : -1;
        }

        count = 0;
        for (int x : a)
            if (x == candidate) count++;

        return count > a.length / 2 ? candidate : -1;
    }

    // 19. Maximum difference: a[j] - a[i], where j > i
    static int maxDifference(int[] a) {
        int minValue = a[0];
        int maxDifference = Integer.MIN_VALUE;

        for (int i = 1; i < a.length; i++) {
            maxDifference = Math.max(maxDifference, a[i] - minValue);
            minValue = Math.min(minValue, a[i]);
        }

        return maxDifference;
    }

    // 20. Palindrome array
    static boolean isPalindrome(int[] a) {
        int left = 0, right = a.length - 1;

        while (left < right) {
            if (a[left++] != a[right--]) return false;
        }

        return true;
    }

    // 21. All values are unique
    static boolean areUnique(int[] a) {
        Set<Integer> set = new HashSet<>();

        for (int x : a)
            if (!set.add(x)) return false;

        return true;
    }

    // 22. No consecutive duplicates
    static boolean noConsecutiveDuplicates(int[] a) {
        for (int i = 1; i < a.length; i++)
            if (a[i] == a[i - 1]) return false;

        return true;
    }

    // 23. Values within a range
    static boolean valuesWithinRange(int[] a, int min, int max) {
        for (int x : a)
            if (x < min || x > max) return false;

        return true;
    }

    // 24. Strictly increasing array
    static boolean strictlyIncreasing(int[] a) {
        for (int i = 1; i < a.length; i++)
            if (a[i] <= a[i - 1]) return false;

        return true;
    }

    // 25. Running maximum and minimum
    static void runningMinMax(int[] a) {
        int min = Integer.MAX_VALUE;
        int max = Integer.MIN_VALUE;

        for (int x : a) {
            min = Math.min(min, x);
            max = Math.max(max, x);
            System.out.println("Min: " + min + ", Max: " + max);
        }
    }

    // 26. Next greater element on the right
    static int[] nextGreater(int[] a) {
        int[] result = new int[a.length];
        Arrays.fill(result, -1);
        Stack<Integer> stack = new Stack<>();

        for (int i = a.length - 1; i >= 0; i--) {
            while (!stack.isEmpty() && stack.peek() <= a[i])
                stack.pop();

            if (!stack.isEmpty()) result[i] = stack.peek();

            stack.push(a[i]);
        }

        return result;
    }

    // 27. Next smaller element on the right
    static int[] nextSmaller(int[] a) {
        int[] result = new int[a.length];
        Arrays.fill(result, -1);
        Stack<Integer> stack = new Stack<>();

        for (int i = a.length - 1; i >= 0; i--) {
            while (!stack.isEmpty() && stack.peek() >= a[i])
                stack.pop();

            if (!stack.isEmpty()) result[i] = stack.peek();

            stack.push(a[i]);
        }

        return result;
    }
}