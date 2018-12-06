/* eslint-disable no-console */

class Util {

  static hashCode(s) {
    let hash = 0;
    for(let i = 0; i < s.length; i++)
      hash = Math.imul(31, hash) + s.charCodeAt(i) | 0;
    return hash;
  }

  static showUsedResources() {
    const used = process.memoryUsage();
    for (let key in used) {
      console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
    }
  }

  static trimString(str) {
    if (str) {
      return str.trim();
    } else {
      return '';
    }
  }
}

export default Util;
