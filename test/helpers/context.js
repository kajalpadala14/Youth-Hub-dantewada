const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createBrowserEnv() {
  const store = new Map();
  const sessionStore = new Map();

  const localStorageMock = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };

  const sessionStorageMock = {
    getItem: (k) => (sessionStore.has(k) ? sessionStore.get(k) : null),
    setItem: (k, v) => sessionStore.set(k, String(v)),
    removeItem: (k) => sessionStore.delete(k),
    clear: () => sessionStore.clear(),
  };

  const context = {
    window: {},
    document: {
      addEventListener: () => {},
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      createElement: () => ({ appendChild: () => {}, setAttribute: () => {} }),
    },
    localStorage: localStorageMock,
    sessionStorage: sessionStorageMock,
    console,
    setTimeout,
    clearTimeout,
  };
  context.window = context;
  vm.createContext(context);
  return context;
}

function loadScript(relativePath, context = createBrowserEnv(), suffix = '') {
  const fullPath = path.resolve(__dirname, '../../', relativePath);
  const code = fs.readFileSync(fullPath, 'utf8');
  return vm.runInContext(code + '\n' + suffix, context);
}

module.exports = {
  createBrowserEnv,
  loadScript,
};
