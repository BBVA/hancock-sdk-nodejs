import 'jest';

process.env.NODE_ENV = 'test';

global.console = {
  debug: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  // log: jest.fn(),
  log: console.log,
} as any;
