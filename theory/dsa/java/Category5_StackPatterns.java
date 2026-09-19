import java.util.*;

/**
 * Category 5: Stack Patterns
 * 20 implementations covering stack fundamentals and advanced uses
 */
public class Category5_StackPatterns {

    // 1. Valid Parentheses (LeetCode 20)
    static boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        Map<Character, Character> pairs = new HashMap<>();
        pairs.put(')', '(');
        pairs.put('}', '{');
        pairs.put(']', '[');

        for (char c : s.toCharArray()) {
            if (pairs.containsKey(c)) {
                if (stack.isEmpty() || stack.pop() != pairs.get(c)) return false;
            } else {
                stack.push(c);
            }
        }
        return stack.isEmpty();
    }

    // 2. Simplify Path (LeetCode 71)
    static String simplifyPath(String path) {
        Stack<String> stack = new Stack<>();
        String[] parts = path.split("/");
        for (String part : parts) {
            if (part.isEmpty() || part.equals(".")) continue;
            if (part.equals("..")) {
                if (!stack.isEmpty()) stack.pop();
            } else {
                stack.push(part);
            }
        }
        return "/" + String.join("/", stack);
    }

    // 3. Evaluate Reverse Polish Notation (LeetCode 150)
    static int evalRPN(String[] tokens) {
        Stack<Integer> stack = new Stack<>();
        Set<String> operators = new HashSet<>(Arrays.asList("+", "-", "*", "/"));
        for (String token : tokens) {
            if (operators.contains(token)) {
                int b = stack.pop();
                int a = stack.pop();
                int result = 0;
                if (token.equals("+")) result = a + b;
                else if (token.equals("-")) result = a - b;
                else if (token.equals("*")) result = a * b;
                else if (token.equals("/")) result = a / b;
                stack.push(result);
            } else {
                stack.push(Integer.parseInt(token));
            }
        }
        return stack.pop();
    }

    // 4. Daily Temperatures (LeetCode 739)
    static int[] dailyTemperatures(int[] temperatures) {
        int[] result = new int[temperatures.length];
        Stack<Integer> stack = new Stack<>();
        for (int i = temperatures.length - 1; i >= 0; i--) {
            while (!stack.isEmpty() && temperatures[stack.peek()] <= temperatures[i]) {
                stack.pop();
            }
            result[i] = stack.isEmpty() ? 0 : stack.peek() - i;
            stack.push(i);
        }
        return result;
    }

    // 5. Next Greater Element (LeetCode 496)
    static int[] nextGreaterElement(int[] nums1, int[] nums2) {
        Map<Integer, Integer> map = new HashMap<>();
        Stack<Integer> stack = new Stack<>();
        for (int num : nums2) {
            while (!stack.isEmpty() && stack.peek() < num) {
                map.put(stack.pop(), num);
            }
            stack.push(num);
        }
        int[] result = new int[nums1.length];
        for (int i = 0; i < nums1.length; i++) {
            result[i] = map.getOrDefault(nums1[i], -1);
        }
        return result;
    }

    // 6. Largest Rectangle in Histogram (LeetCode 84)
    static int largestRectangleArea(int[] heights) {
        Stack<Integer> stack = new Stack<>();
        int maxArea = 0;
        for (int i = 0; i < heights.length; i++) {
            while (!stack.isEmpty() && heights[stack.peek()] > heights[i]) {
                int h = heights[stack.pop()];
                int w = stack.isEmpty() ? i : i - stack.peek() - 1;
                maxArea = Math.max(maxArea, h * w);
            }
            stack.push(i);
        }
        while (!stack.isEmpty()) {
            int h = heights[stack.pop()];
            int w = stack.isEmpty() ? heights.length : heights.length - stack.peek() - 1;
            maxArea = Math.max(maxArea, h * w);
        }
        return maxArea;
    }

    // 7. Trapping Rain Water II (LeetCode 407)
    static int trap(int[] height) {
        int left = 0, right = height.length - 1, water = 0;
        int leftMax = 0, rightMax = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                if (height[left] >= leftMax) leftMax = height[left];
                else water += leftMax - height[left];
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }

    // 8. Remove K Digits (LeetCode 402)
    static String removeKdigits(String num, int k) {
        Stack<Character> stack = new Stack<>();
        for (char c : num.toCharArray()) {
            while (!stack.isEmpty() && k > 0 && stack.peek() > c) {
                stack.pop();
                k--;
            }
            stack.push(c);
        }
        while (k > 0) {
            stack.pop();
            k--;
        }
        StringBuilder sb = new StringBuilder();
        while (!stack.isEmpty()) sb.append(stack.pop());
        String result = sb.reverse().toString();
        int i = 0;
        while (i < result.length() && result.charAt(i) == '0') i++;
        return i == result.length() ? "0" : result.substring(i);
    }

    // 9. Min Stack (LeetCode 155)
    static class MinStack {
        private Stack<Integer> stack;
        private Stack<Integer> minStack;

        MinStack() {
            stack = new Stack<>();
            minStack = new Stack<>();
        }

        void push(int val) {
            stack.push(val);
            if (minStack.isEmpty() || val <= minStack.peek())
                minStack.push(val);
        }

        void pop() {
            if (stack.pop().equals(minStack.peek()))
                minStack.pop();
        }

        int top() { return stack.peek(); }

        int getMin() { return minStack.peek(); }
    }

    // 10. Decode String (LeetCode 394)
    static String decodeString(String s) {
        Stack<Integer> numStack = new Stack<>();
        Stack<String> strStack = new Stack<>();
        StringBuilder current = new StringBuilder();
        int num = 0;

        for (char c : s.toCharArray()) {
            if (Character.isDigit(c)) {
                num = num * 10 + (c - '0');
            } else if (c == '[') {
                numStack.push(num);
                strStack.push(current.toString());
                current = new StringBuilder();
                num = 0;
            } else if (c == ']') {
                int count = numStack.pop();
                String prev = strStack.pop();
                String temp = current.toString();
                current = new StringBuilder(prev);
                for (int i = 0; i < count; i++) current.append(temp);
            } else {
                current.append(c);
            }
        }
        return current.toString();
    }

    // 11. Asteroid Collision (LeetCode 735)
    static int[] asteroidCollision(int[] asteroids) {
        Stack<Integer> stack = new Stack<>();
        for (int ast : asteroids) {
            boolean alive = true;
            while (alive && ast < 0 && !stack.isEmpty() && stack.peek() > 0) {
                int right = stack.pop();
                if (right + ast == 0) {
                    alive = false;
                } else if (right + ast > 0) {
                    stack.push(right);
                    alive = false;
                }
            }
            if (alive) stack.push(ast);
        }
        int[] result = new int[stack.size()];
        for (int i = stack.size() - 1; i >= 0; i--) result[i] = stack.pop();
        return result;
    }

    // 12. Score of Parentheses (LeetCode 856)
    static int scoreOfParentheses(String s) {
        Stack<Integer> stack = new Stack<>();
        stack.push(0);
        for (char c : s.toCharArray()) {
            if (c == '(') {
                stack.push(0);
            } else {
                int v = stack.pop();
                int u = stack.pop();
                stack.push(u + Math.max(2 * v, 1));
            }
        }
        return stack.pop();
    }

    // 13. Minimum Removals for Valid Parentheses (LeetCode 1249)
    static int minRemoveToMakeValid(String s) {
        Stack<Integer> stack = new Stack<>();
        boolean[] toRemove = new boolean[s.length()];
        for (int i = 0; i < s.length(); i++) {
            if (s.charAt(i) == '(') {
                stack.push(i);
            } else if (s.charAt(i) == ')') {
                if (!stack.isEmpty()) {
                    stack.pop();
                } else {
                    toRemove[i] = true;
                }
            }
        }
        while (!stack.isEmpty()) toRemove[stack.pop()] = true;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            if (!toRemove[i]) sb.append(s.charAt(i));
        }
        return s.length() - sb.length();
    }

    // 14. Basic Calculator (LeetCode 224)
    static int calculate(String s) {
        Stack<Integer> stack = new Stack<>();
        int result = 0, num = 0;
        char sign = '+';
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (Character.isDigit(c)) {
                num = num * 10 + (c - '0');
            }
            if (c == '+' || c == '-' || c == '*' || c == '/' || i == s.length() - 1) {
                switch (sign) {
                    case '+': stack.push(num); break;
                    case '-': stack.push(-num); break;
                    case '*': stack.push(stack.pop() * num); break;
                    case '/': stack.push(stack.pop() / num); break;
                }
                sign = c;
                num = 0;
            }
        }
        while (!stack.isEmpty()) result += stack.pop();
        return result;
    }

    // 15. Flatten Nested List (LeetCode 341)
    static class NestedIterator {
        private Stack<Iterator<NestedInteger>> stack;

        NestedIterator(List<NestedInteger> nestedList) {
            stack = new Stack<>();
            stack.push(nestedList.iterator());
        }

        public int next() {
            return stack.peek().next().getInteger();
        }

        public boolean hasNext() {
            while (!stack.isEmpty()) {
                if (!stack.peek().hasNext()) {
                    stack.pop();
                    continue;
                }
                NestedInteger next = stack.peek().next();
                if (next.isInteger()) {
                    stack.push(Collections.singletonList(next).iterator());
                    return true;
                }
                stack.push(next.getList().iterator());
            }
            return false;
        }
    }

    interface NestedInteger {
        boolean isInteger();
        Integer getInteger();
        List<NestedInteger> getList();
    }

    // 16. Next Greater Element II (LeetCode 503)
    static int[] nextGreaterElements(int[] nums) {
        int[] result = new int[nums.length];
        Stack<Integer> stack = new Stack<>();
        for (int i = 2 * nums.length - 1; i >= 0; i--) {
            while (!stack.isEmpty() && stack.peek() <= nums[i % nums.length]) {
                stack.pop();
            }
            result[i % nums.length] = stack.isEmpty() ? -1 : stack.peek();
            stack.push(nums[i % nums.length]);
        }
        return result;
    }

    // 17. Remove All Adjacent Duplicates (LeetCode 1544)
    static String removeDuplicates(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (!stack.isEmpty() && stack.peek() == c) {
                stack.pop();
            } else {
                stack.push(c);
            }
        }
        StringBuilder sb = new StringBuilder();
        while (!stack.isEmpty()) sb.append(stack.pop());
        return sb.reverse().toString();
    }

    // 18. Exclusive Time (LeetCode 636)
    static int[] exclusiveTime(int n, List<String> logs) {
        int[] result = new int[n];
        Stack<Integer> stack = new Stack<>();
        int prevTime = 0;
        for (String log : logs) {
            String[] parts = log.split(":");
            int id = Integer.parseInt(parts[0]);
            int time = Integer.parseInt(parts[2]);
            if (parts[1].equals("start")) {
                if (!stack.isEmpty()) {
                    result[stack.peek()] += time - prevTime;
                }
                stack.push(id);
                prevTime = time;
            } else {
                result[stack.pop()] += time - prevTime + 1;
                prevTime = time + 1;
            }
        }
        return result;
    }

    // 19. Make The String Great (LeetCode 1544 variant)
    static String makeGoodString(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (!stack.isEmpty() && stack.peek() != c &&
                Character.toLowerCase(stack.peek()) == Character.toLowerCase(c)) {
                stack.pop();
            } else {
                stack.push(c);
            }
        }
        StringBuilder sb = new StringBuilder();
        while (!stack.isEmpty()) sb.append(stack.pop());
        return sb.reverse().toString();
    }

    // 20. Sum of Subarray Minimums (LeetCode 907)
    static int sumSubarrayMins(int[] arr) {
        int MOD = 1000000007;
        Stack<int[]> stack = new Stack<>();
        long result = 0;
        for (int i = 0; i < arr.length; i++) {
            int count = 1;
            while (!stack.isEmpty() && stack.peek()[0] >= arr[i]) {
                int[] top = stack.pop();
                result += (long)top[0] * top[1] % MOD;
                count += top[1];
            }
            stack.push(new int[]{arr[i], count});
        }
        while (!stack.isEmpty()) {
            int[] top = stack.pop();
            result += (long)top[0] * top[1] % MOD;
        }
        return (int)(result % MOD);
    }
}
