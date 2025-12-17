// Polyfill File API for Node.js < 20 (required by undici)
if (typeof globalThis.File === 'undefined') {
  // Simple File polyfill - undici just needs the constructor to exist
  globalThis.File = class File {
    constructor(parts, name, options) {
      this.parts = parts;
      this.name = name;
      this.options = options;
    }
  };
}

