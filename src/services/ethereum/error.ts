import { IHancockError } from './../hancock.model';

export class HancockError extends Error implements IHancockError {

    private static prefixApi: string = 'SDKAPI_';
    private static prefixInt: string = 'SDKINT_';

    public name: string = 'HancockError';
    public errorStack: HancockError[] = [];

    constructor(
      public typeError: hancockErrorType,
      public internalError: string,
      public error: number,
      public message: string,
      public extendedError?: HancockError | Error) {

      super(message);
      if (typeError === hancockErrorType.Api) {
        this.internalError = `${HancockError.prefixApi}${internalError}`;
      } else {
        this.internalError = `${HancockError.prefixInt}${internalError}`;
      }
    }

    get extendedMessage() {
      return this.extendedError ? this.extendedError.message : '';
    }

  }

export enum hancockErrorType {
  Api,
  Internal,
  }
export const hancockGenericApiError = new HancockError(hancockErrorType.Internal, '50001', 500, 'Error calling Api');
export const hancockNoKeyNorProviderError = new HancockError(hancockErrorType.Internal, '50002', 500, 'No key nor provider');
