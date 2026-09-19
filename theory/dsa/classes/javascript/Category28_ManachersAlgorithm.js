/**
 * Category 28: Manacher's Algorithm
 */
class ManachersAlgorithm {
  constructor(s) {
    this.s = s;
    this.preprocess();
    this.findPalindromes();
  }
  
  preprocess() {
    this.processed = '^#' + [...this.s].join('#') + '#$';
    this.p = Array(this.processed.length).fill(0);
  }
  
  findPalindromes() {
    let center = 0, right = 0;
    
    for (let i = 1; i < this.processed.length - 1; i++) {
      const mirror = 2 * center - i;
      
      if (i < right) {
        this.p[i] = Math.min(right - i, this.p[mirror]);
      }
      
      while (this.processed[i + this.p[i] + 1] === this.processed[i - this.p[i] - 1]) {
        this.p[i]++;
      }
      
      if (i + this.p[i] > right) {
        center = i;
        right = i + this.p[i];
      }
    }
  }
  
  longestPalindrome() {
    let maxLen = 0, centerIndex = 0;
    for (let i = 1; i < this.p.length - 1; i++) {
      if (this.p[i] > maxLen) {
        maxLen = this.p[i];
        centerIndex = i;
      }
    }
    
    const start = Math.floor((centerIndex - maxLen) / 2);
    return this.s.substring(start, start + maxLen);
  }
  
  countAllPalindromes() {
    let count = 0;
    for (let i = 1; i < this.p.length - 1; i++) {
      count += Math.floor((this.p[i] + 1) / 2);
    }
    return count;
  }
}

module.exports = { ManachersAlgorithm };
