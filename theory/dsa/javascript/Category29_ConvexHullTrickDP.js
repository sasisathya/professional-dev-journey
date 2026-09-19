/**
 * Category 29: Convex Hull Trick (CHT) for DP Optimization
 */
class Line {
  constructor(m, c) {
    this.m = m;
    this.c = c;
  }
  
  eval(x) {
    return this.m * x + this.c;
  }
  
  isBad(l2, l3) {
    return (l2.c - this.c) * (this.m - l3.m) <= (l3.c - l2.c) * (l2.m - this.m);
  }
}

class ConvexHullTrickDynamic {
  constructor() {
    this.hull = [];
  }
  
  addLine(m, c) {
    const newLine = new Line(m, c);
    
    while (this.hull.length >= 2) {
      const last = this.hull[this.hull.length - 1];
      const secondLast = this.hull[this.hull.length - 2];
      if (secondLast.isBad(last, newLine)) {
        this.hull.pop();
      } else break;
    }
    
    if (this.hull.length >= 1) {
      const last = this.hull[this.hull.length - 1];
      if (last.m === newLine.m) {
        if (last.c >= newLine.c) {
          this.hull.pop();
        } else return;
      }
    }
    
    this.hull.push(newLine);
  }
  
  query(x) {
    if (!this.hull.length) return 0;
    let max = -Infinity;
    for (let line of this.hull) {
      max = Math.max(max, line.eval(x));
    }
    return max;
  }
}

module.exports = { Line, ConvexHullTrickDynamic };
