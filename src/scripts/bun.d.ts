// Type declarations for Bun runtime
declare global {
  namespace globalThis {
    const Bun: {
      spawn: (cmd: string[], options?: { stdio?: any; cwd?: string }) => {
        exited: Promise<void>;
      };
    };
  }
}

export {};