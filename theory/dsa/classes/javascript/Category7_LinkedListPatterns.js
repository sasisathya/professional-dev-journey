/**
 * Category 7: Linked List Patterns
 */

class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

function reverseList(head) {
  let prev = null;
  while (head) {
    const next = head.next;
    head.next = prev;
    prev = head;
    head = next;
  }
  return prev;
}

function mergeTwoLists(list1, list2) {
  const dummy = new ListNode(0);
  let current = dummy;
  
  while (list1 && list2) {
    if (list1.val <= list2.val) {
      current.next = list1;
      list1 = list1.next;
    } else {
      current.next = list2;
      list2 = list2.next;
    }
    current = current.next;
  }
  current.next = list1 || list2;
  return dummy.next;
}

function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}

function findMiddle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}

function isPalindrome(head) {
  const mid = findMiddle(head);
  let rev = reverseList(mid);
  
  while (head && rev) {
    if (head.val !== rev.val) return false;
    head = head.next;
    rev = rev.next;
  }
  return true;
}

module.exports = { ListNode, reverseList, mergeTwoLists, hasCycle, isPalindrome };
