/**
 * Category 4: Binary Search Patterns
 * JavaScript implementation
 */

function binarySearch(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

function searchFirstLast(nums, target) {
  function findFirst() {
    let left = 0, right = nums.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (nums[mid] === target) right = mid - 1;
      else if (nums[mid] < target) left = mid + 1;
      else right = mid - 1;
    }
    return left;
  }

  function findLast() {
    let left = 0, right = nums.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (nums[mid] === target) left = mid + 1;
      else if (nums[mid] < target) left = mid + 1;
      else right = mid - 1;
    }
    return right;
  }

  const first = findFirst();
  if (first === nums.length || nums[first] !== target) return [-1, -1];
  return [first, findLast()];
}

function searchInRotated(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;

    if (nums[left] <= nums[mid]) {
      if (target >= nums[left] && target < nums[mid]) right = mid - 1;
      else left = mid + 1;
    } else {
      if (target > nums[mid] && target <= nums[right]) left = mid + 1;
      else right = mid - 1;
    }
  }
  return -1;
}

function findPeakElement(nums) {
  let left = 0, right = nums.length - 1;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] > nums[mid + 1]) right = mid;
    else left = mid + 1;
  }
  return left;
}

console.log('Binary Search:', binarySearch([1, 3, 5, 6], 5));
console.log('First/Last:', searchFirstLast([5, 7, 7, 8, 8, 10], 8));
console.log('Rotated Search:', searchInRotated([4, 5, 6, 7, 0, 1, 2], 0));

module.exports = { binarySearch, searchFirstLast, searchInRotated, findPeakElement };
