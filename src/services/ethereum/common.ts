import { HancockError, hancockErrorType, hancockGenericApiError } from './error';
import { error } from './utils';

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
    module.exports.errorHandler({body: response.json()});
  }

  return response.json();
};
