class ZIndexManager {
  base = 1000;
  current = this.base;

  /** Returns the next z-index and increments (e.g. 1000, 1010, 1020, ...). */
  next(): number {
    const value = this.current;
    this.current += 10;
    return value;
  }

  /** Reset the counter to base. Useful in tests. */
  reset(): void {
    this.current = this.base;
  }
}

export const zIndexManager = new ZIndexManager();
