import { HancockError, hancockErrorType, hancockGenericApiError } from './error';

export enum SupportedPlatforms {
  'bitcoin' = 'bitcoin',
  'ethereum' = 'ethereum',
}

/**
 * @hidden
 */
export const errorHandler = (err: any) => {

  const out: HancockError = err instanceof HancockError
    ? err
    : err.body
      ? error(new HancockError(hancockErrorType.Api, err.body.internalError, err.body.error, err.body.message), err)
      : error(hancockGenericApiError, err);

  throw out;
};

/**
 * @hidden
 */
export const checkStatus = async (response: any): Promise<any> => {
  // HTTP status code between 200 and 299
  if (!response.ok) {
    errorHandler({body: response.json()});
  }

  return response.json();
};

/**
 * @hidden
 */
export function error(hancockError: HancockError, originalError?: HancockError | Error): HancockError {

  let retError: HancockError = hancockError;

  if (originalError instanceof HancockError) {

    retError = originalError;
    retError.errorStack.push(hancockError);

  } else {

    retError.extendedError = originalError;

  }

  return retError;

}
