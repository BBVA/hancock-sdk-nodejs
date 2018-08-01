import { IHancockError } from './../hancock.model';

export class HancockError extends Error implements IHancockError {

    public name: string = 'HancockError';
    // private prefix: string = 'SDKAPI';

    // public errorStack: HancockError[] = [];

    constructor(
      public internalError: string,
      public error: number,
      public message: string,
      public extendedError?: HancockError | Error) {

      super(message);
      // this.internalError = `${this.prefix}${internalError}`;

    }

    get extendedMessage() {
      return this.extendedError ? this.extendedError.message : '';
    }

  }
