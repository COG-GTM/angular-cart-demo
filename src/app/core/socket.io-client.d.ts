/**
 * Minimal type declarations for the (untyped) `socket.io-client` v1.x package.
 * We import its self-contained browser build (`dist/socket.io.js`) so the modern
 * Angular/esbuild bundler does not try to bundle the package's Node-only
 * transports (`ws` and friends). Only the surface used by `SocketService` is
 * declared here.
 */
declare module 'socket.io-client/dist/socket.io.js' {
  export interface SocketOptions {
    path?: string;
    query?: string | Record<string, string>;
    reconnection?: boolean;
    forceNew?: boolean;
    [option: string]: unknown;
  }

  export interface Socket {
    on(event: string, listener: (data: unknown) => void): Socket;
    off(event: string, listener?: (data: unknown) => void): Socket;
    emit(event: string, ...args: unknown[]): Socket;
    removeAllListeners(event?: string): Socket;
    connect(): Socket;
    disconnect(): Socket;
    connected: boolean;
  }

  const io: (uri?: string, opts?: SocketOptions) => Socket;

  export default io;
}
