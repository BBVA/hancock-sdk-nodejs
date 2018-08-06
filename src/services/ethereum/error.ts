import { IHancockError } from './../hancock.model';

export class HancockError extends Error implements IHancockError {

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
      this.internalError = `${hancockErrorType.Api}${internalError}`;
    } else {
      this.internalError = `${hancockErrorType.Internal}${internalError}`;
    }
  }

  get extendedMessage() {
    return this.extendedError ? this.extendedError.message : '';
  }

}

export enum hancockErrorType {
  Api = 'SDKAPI_',
  Internal = 'SDKINT_',
}

export const hancockGenericApiError = new HancockError(hancockErrorType.Internal, '50001', 500, 'Error calling Api');
export const hancockNoKeyNorProviderError = new HancockError(hancockErrorType.Internal, '50002', 500, 'No key nor provider');
export const hancockWalletError = new HancockError(hancockErrorType.Internal, '50003', 500, 'Error generating wallet');
