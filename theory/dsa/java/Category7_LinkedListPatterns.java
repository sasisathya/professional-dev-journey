import java.util.*;

/**
 * Category 7: Linked List Patterns
 * 20+ implementations covering traversal, reversal, merging, and advanced operations
 */
public class Category7_LinkedListPatterns {

    static class ListNode {
        int val;
        ListNode next;
        ListNode(int val) { this.val = val; }
    }

    // 1. Reverse Linked List (LeetCode 206)
    static ListNode reverseList(ListNode head) {
        ListNode prev = null, curr = head;
        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }

    // 2. Reverse Linked List II (LeetCode 92)
    static ListNode reverseBetween(ListNode head, int left, int right) {
        if (left == right) return head;
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode prev = dummy;
        for (int i = 0; i < left - 1; i++) prev = prev.next;

        ListNode curr = prev.next;
        for (int i = 0; i < right - left; i++) {
            ListNode next = curr.next;
            curr.next = next.next;
            next.next = prev.next;
            prev.next = next;
        }
        return dummy.next;
    }

    // 3. Merge Two Sorted Lists (LeetCode 21)
    static ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        ListNode dummy = new ListNode(0), curr = dummy;
        while (list1 != null && list2 != null) {
            if (list1.val <= list2.val) {
                curr.next = list1;
                list1 = list1.next;
            } else {
                curr.next = list2;
                list2 = list2.next;
            }
            curr = curr.next;
        }
        curr.next = list1 != null ? list1 : list2;
        return dummy.next;
    }

    // 4. Merge K Sorted Lists (LeetCode 23)
    static ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);
        for (ListNode list : lists) {
            if (list != null) pq.offer(list);
        }

        ListNode dummy = new ListNode(0), curr = dummy;
        while (!pq.isEmpty()) {
            ListNode node = pq.poll();
            curr.next = node;
            curr = curr.next;
            if (node.next != null) pq.offer(node.next);
        }
        return dummy.next;
    }

    // 5. Linked List Cycle Detection (LeetCode 141)
    static boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }

    // 6. Find Cycle Start (LeetCode 142)
    static ListNode detectCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) break;
        }
        if (fast == null || fast.next == null) return null;

        slow = head;
        while (slow != fast) {
            slow = slow.next;
            fast = fast.next;
        }
        return slow;
    }

    // 7. Find Middle of Linked List (LeetCode 876)
    static ListNode findMiddle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        return slow;
    }

    // 8. Palindrome Linked List (LeetCode 234)
    static boolean isPalindrome(ListNode head) {
        ListNode mid = findMiddle(head);
        ListNode rev = reverseList(mid);
        while (head != null && rev != null) {
            if (head.val != rev.val) return false;
            head = head.next;
            rev = rev.next;
        }
        return true;
    }

    // 9. Reorder List (LeetCode 143)
    static void reorderList(ListNode head) {
        ListNode mid = findMiddle(head);
        ListNode rev = reverseList(mid);
        while (head != null && rev != null) {
            ListNode nextHead = head.next;
            ListNode nextRev = rev.next;
            head.next = rev;
            if (rev != null) rev.next = nextHead;
            head = nextHead;
            rev = nextRev;
        }
    }

    // 10. Remove Nth Node From End (LeetCode 19)
    static ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode first = dummy, second = dummy;
        for (int i = 0; i <= n; i++) first = first.next;
        while (first != null) {
            first = first.next;
            second = second.next;
        }
        second.next = second.next.next;
        return dummy.next;
    }

    // 11. Intersection of Two Linked Lists (LeetCode 160)
    static ListNode getIntersectionNode(ListNode headA, ListNode headB) {
        ListNode p1 = headA, p2 = headB;
        while (p1 != p2) {
            p1 = p1 == null ? headB : p1.next;
            p2 = p2 == null ? headA : p2.next;
        }
        return p1;
    }

    // 12. Clone Linked List with Random Pointer (LeetCode 138)
    static class Node {
        int val;
        Node next, random;
        Node(int val) { this.val = val; }
    }

    static Node copyRandomList(Node head) {
        Map<Node, Node> map = new HashMap<>();
        for (Node curr = head; curr != null; curr = curr.next) {
            map.put(curr, new Node(curr.val));
        }
        for (Node curr = head; curr != null; curr = curr.next) {
            map.get(curr).next = map.get(curr.next);
            map.get(curr).random = map.get(curr.random);
        }
        return map.get(head);
    }

    // 13. Odd Even Linked List (LeetCode 328)
    static ListNode oddEvenList(ListNode head) {
        if (head == null) return null;
        ListNode odd = head, even = head.next, evenHead = even;
        while (even != null && even.next != null) {
            odd.next = even.next;
            odd = odd.next;
            even.next = odd.next;
            even = even.next;
        }
        odd.next = evenHead;
        return head;
    }

    // 14. Sort List (LeetCode 148)
    static ListNode sortList(ListNode head) {
        if (head == null || head.next == null) return head;
        ListNode mid = findMiddle(head);
        ListNode midNext = mid.next;
        mid.next = null;
        ListNode left = sortList(head);
        ListNode right = sortList(midNext);
        return mergeTwoLists(left, right);
    }

    // 15. Delete Duplicates from Sorted List (LeetCode 83)
    static ListNode deleteDuplicates(ListNode head) {
        ListNode curr = head;
        while (curr != null && curr.next != null) {
            if (curr.val == curr.next.val) {
                curr.next = curr.next.next;
            } else {
                curr = curr.next;
            }
        }
        return head;
    }

    // 16. Remove Duplicates II (LeetCode 82)
    static ListNode deleteDuplicatesII(ListNode head) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode curr = dummy;
        while (curr.next != null && curr.next.next != null) {
            if (curr.next.val == curr.next.next.val) {
                int val = curr.next.val;
                while (curr.next != null && curr.next.val == val) {
                    curr.next = curr.next.next;
                }
            } else {
                curr = curr.next;
            }
        }
        return dummy.next;
    }

    // 17. Reverse Nodes in K Group (LeetCode 25)
    static ListNode reverseKGroup(ListNode head, int k) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode prev = dummy;
        while (true) {
            ListNode kth = prev;
            for (int i = 0; i < k; i++) {
                kth = kth.next;
                if (kth == null) return dummy.next;
            }
            ListNode nextHead = kth.next;
            ListNode curr = prev.next, next;
            for (int i = 0; i < k; i++) {
                next = curr.next;
                curr.next = nextHead;
                nextHead = curr;
                curr = next;
            }
            prev.next = kth;
            prev = curr;
        }
    }

    // 18. Rotate List (LeetCode 61)
    static ListNode rotateRight(ListNode head, int k) {
        if (head == null || head.next == null) return head;
        int len = 1;
        ListNode curr = head;
        while (curr.next != null) {
            len++;
            curr = curr.next;
        }
        k = k % len;
        if (k == 0) return head;
        curr.next = head;
        for (int i = 0; i < len - k; i++) curr = curr.next;
        ListNode newHead = curr.next;
        curr.next = null;
        return newHead;
    }

    // 19. Add Two Numbers (LeetCode 2)
    static ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        int carry = 0;
        while (l1 != null || l2 != null || carry > 0) {
            int sum = (l1 != null ? l1.val : 0) + (l2 != null ? l2.val : 0) + carry;
            curr.next = new ListNode(sum % 10);
            carry = sum / 10;
            l1 = l1 != null ? l1.next : null;
            l2 = l2 != null ? l2.next : null;
            curr = curr.next;
        }
        return dummy.next;
    }

    // 20. Swapping Nodes in Pairs (LeetCode 24)
    static ListNode swapPairs(ListNode head) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode prev = dummy;
        while (prev.next != null && prev.next.next != null) {
            ListNode first = prev.next;
            ListNode second = prev.next.next;
            prev.next = second;
            first.next = second.next;
            second.next = first;
            prev = first;
        }
        return dummy.next;
    }

    public static void main(String[] args) {
        // Test: Create sample list
        ListNode head = new ListNode(1);
        head.next = new ListNode(2);
        head.next.next = new ListNode(3);
        head.next.next.next = new ListNode(4);

        System.out.println("Palindrome: " + isPalindrome(head));
        System.out.println("Cycle: " + hasCycle(head));
    }
}
