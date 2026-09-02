declare global {
  interface SymbolConstructor {
    readonly metadata: symbol;
  }
}

if (typeof Symbol.metadata !== 'symbol') {
  Object.defineProperty(Symbol, 'metadata', { value: Symbol('Symbol.metadata') });
}

export {};
