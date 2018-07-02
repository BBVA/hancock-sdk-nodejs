export const __WebSocketInstance__ = {
  handlers: {},
  _on(event: string, handler: any) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
  },
  _trigger(event: string, ...args: any[]) {
    if (this.handlers[event]) {
      this.handlers[event].forEach((handler: any) => {
        handler(...args);
      });
    }
  },
  _clear() {
    this.handlers = {};
  },

  addEventListener: jest.fn().mockImplementation((...args: any[]) => {
    __WebSocketInstance__._on(...args);
    return __WebSocketInstance__;
  }),
  on: jest.fn().mockImplementation((...args: any[]) => {
    __WebSocketInstance__._on(...args);
    return __WebSocketInstance__;
  }),
  send: jest.fn().mockReturnThis(),
  close: jest.fn().mockReturnThis(),
  readyState: 1,
}

export const __WebSocketConstructor__ = jest.fn().mockImplementation((url: string) => __WebSocketInstance__);
(__WebSocketConstructor__ as any).OPEN = 1;

export default __WebSocketConstructor__;