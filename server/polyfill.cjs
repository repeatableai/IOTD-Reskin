// Load environment variables FIRST, before any other modules
require('dotenv').config();

// Polyfill File API for Node.js < 20 (required by undici)
// This must run BEFORE any modules that use undici are loaded
if (typeof globalThis.File === 'undefined') {
  // Ensure Blob exists first (File extends Blob)
  if (typeof globalThis.Blob === 'undefined') {
    // Simple Blob polyfill
    globalThis.Blob = class Blob {
      constructor(parts = [], options = {}) {
        this.parts = parts;
        this.type = options.type || '';
        this.size = 0;
      }
    };
  }
  
  // Create File polyfill that extends Blob (as per Web API spec)
  globalThis.File = class File extends globalThis.Blob {
    constructor(parts, name, options = {}) {
      super(parts, options);
      this.name = name;
      this.lastModified = options.lastModified || Date.now();
    }
  };
  
  // Ensure FileReader exists (sometimes needed)
  if (typeof globalThis.FileReader === 'undefined') {
    globalThis.FileReader = class FileReader {
      constructor() {
        this.result = null;
        this.error = null;
        this.readyState = 0; // EMPTY
      }
      readAsText(file) {
        this.result = file.toString();
        this.readyState = 2; // DONE
      }
      readAsDataURL(file) {
        this.result = 'data:text/plain;base64,' + Buffer.from(file).toString('base64');
        this.readyState = 2; // DONE
      }
    };
  }
}

// Polyfill DOMMatrix for pdf-parse (required by pdf-parse)
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    constructor(init) {
      if (init) {
        this.a = init.a || 1;
        this.b = init.b || 0;
        this.c = init.c || 0;
        this.d = init.d || 1;
        this.e = init.e || 0;
        this.f = init.f || 0;
      } else {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.e = 0;
        this.f = 0;
      }
    }
  };
}
