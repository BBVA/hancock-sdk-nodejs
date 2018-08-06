import { IHancockError } from './../hancock.model';

export class HancockError extends Error implements IHancockError {

    private static prefixApi: string = 'SDKAPI_';
    private static prefixInt: string = 'SDKINT_';

    public name: string = 'HancockError';
    public errorStack: HancockError[] = [];

    constructor(
      public typeError: string,
      public internalError: string,
      public error: number,
      public message: string,
      public extendedError?: HancockError | Error) {

      super(message);
      if (typeError.trim() === 'api') {
        this.internalError = `${HancockError.prefixApi}${internalError}`;
      } else {
        this.internalError = `${HancockError.prefixInt}${internalError}`;
      }
    }

    get extendedMessage() {
      return this.extendedError ? this.extendedError.message : '';
    }

  }

export const prefixApi = 'api';
export const prefixInt = 'internal';
export const hancockErrorNoKey = new HancockError(prefixInt, '002', 500, 'No key nor provider');
