/**
 * Category 22: Interval Patterns
 * JavaScript implementation - Interval scheduling, overlapping, merging
 */

// 1. Merge Intervals (LeetCode 56)
function mergeIntervals(intervals) {
  if (intervals.length === 0) return [];

  intervals.sort((a, b) => a[0] - b[0]);
  const result = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const last = result[result.length - 1];
    if (intervals[i][0] <= last[1]) {
      last[1] = Math.max(last[1], intervals[i][1]);
    } else {
      result.push(intervals[i]);
    }
  }

  return result;
}

// 2. Insert Interval (LeetCode 57)
function insertInterval(intervals, newInterval) {
  const result = [];
  let i = 0;

  while (i < intervals.length && intervals[i][1] < newInterval[0]) {
    result.push(intervals[i]);
    i++;
  }

  while (i < intervals.length && intervals[i][0] <= newInterval[1]) {
    newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
    newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
    i++;
  }

  result.push(newInterval);

  while (i < intervals.length) {
    result.push(intervals[i]);
    i++;
  }

  return result;
}

// 3. Meeting Rooms (LeetCode 252)
function canAttendMeetings(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);

  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] < intervals[i - 1][1]) {
      return false;
    }
  }

  return true;
}

// 4. Meeting Rooms II (LeetCode 253)
function minMeetingRooms(intervals) {
  if (intervals.length === 0) return 0;

  const starts = intervals.map(i => i[0]).sort((a, b) => a - b);
  const ends = intervals.map(i => i[1]).sort((a, b) => a - b);

  let rooms = 0, maxRooms = 0;
  let i = 0, j = 0;

  while (i < starts.length) {
    if (starts[i] < ends[j]) {
      rooms++;
      maxRooms = Math.max(maxRooms, rooms);
      i++;
    } else {
      rooms--;
      j++;
    }
  }

  return maxRooms;
}

// 5. Non-overlapping Intervals (LeetCode 435)
function eraseOverlapIntervals(intervals) {
  if (intervals.length === 0) return 0;

  intervals.sort((a, b) => a[1] - b[1]);

  let count = 0;
  let lastEnd = intervals[0][1];

  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] < lastEnd) {
      count++;
    } else {
      lastEnd = intervals[i][1];
    }
  }

  return count;
}

// 6. Interval List Intersections (LeetCode 986)
function intervalIntersection(firstList, secondList) {
  const result = [];
  let i = 0, j = 0;

  while (i < firstList.length && j < secondList.length) {
    const start = Math.max(firstList[i][0], secondList[j][0]);
    const end = Math.min(firstList[i][1], secondList[j][1]);

    if (start <= end) {
      result.push([start, end]);
    }

    if (firstList[i][1] < secondList[j][1]) {
      i++;
    } else {
      j++;
    }
  }

  return result;
}

// 7. My Calendar I (LeetCode 729)
class MyCalendar {
  constructor() {
    this.events = [];
  }

  book(start, end) {
    for (let [s, e] of this.events) {
      if (Math.max(start, s) < Math.min(end, e)) {
        return false;
      }
    }
    this.events.push([start, end]);
    return true;
  }
}

// 8. Task Scheduler (LeetCode 621)
function leastInterval(tasks, n) {
  const count = Array(26).fill(0);
  for (let task of tasks) {
    count[task.charCodeAt(0) - 65]++;
  }

  const maxFreq = Math.max(...count);
  const maxCount = count.filter(c => c === maxFreq).length;

  return Math.max(tasks.length, (maxFreq - 1) * (n + 1) + maxCount);
}

// 9. Sky Line Problem (LeetCode 218)
function getSkyline(buildings) {
  const events = [];
  for (let [left, right, height] of buildings) {
    events.push([left, -height, 0]);
    events.push([right, height, 1]);
  }

  events.sort((a, b) => a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]);

  const result = [];
  const heightMap = new Map();
  heightMap.set(0, 1);

  for (let [pos, height, type] of events) {
    if (type === 0) {
      heightMap.set(-height, (heightMap.get(-height) || 0) + 1);
    } else {
      heightMap.set(height, heightMap.get(height) - 1);
      if (heightMap.get(height) === 0) {
        heightMap.delete(height);
      }
    }

    const maxHeight = Math.max(...heightMap.keys());
    if (!result.length || result[result.length - 1][1] !== maxHeight) {
      result.push([pos, maxHeight]);
    }
  }

  return result;
}

// 10. Video Stitching (LeetCode 1024)
function videoStitching(clips, time) {
  clips.sort((a, b) => a[0] - b[0]);

  let count = 0, currentEnd = 0, nextEnd = 0;

  for (let [start, end] of clips) {
    if (start > currentEnd) break;

    nextEnd = Math.max(nextEnd, end);

    if (end >= currentEnd) {
      if (currentEnd === nextEnd) break;
      count++;
      currentEnd = nextEnd;
    }

    if (currentEnd >= time) return count;
  }

  return currentEnd >= time ? count : -1;
}

module.exports = {
  mergeIntervals,
  insertInterval,
  canAttendMeetings,
  minMeetingRooms,
  eraseOverlapIntervals,
  intervalIntersection,
  MyCalendar,
  leastInterval,
  getSkyline,
  videoStitching,
};
