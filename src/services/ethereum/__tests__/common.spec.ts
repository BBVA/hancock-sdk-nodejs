import * as common from '../common';
import { HancockError, hancockErrorType } from '../error';

jest.mock('../utils');

describe('common', async () => {

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should call checkStatus correctly', async () => {

    const checkstatusparam = {
      ok: true,
      json: () => 'response',
    };
    const result = await common.checkStatus(checkstatusparam);

    expect(result).toBe('response');

  });

  it('should call checkStatus and throw error', async () => {

    const checkstatusparam = {
      ok: false,
      json: () => 'response',
    };

    const answer = {
      body: 'response',
    };

    const checkStatusSpy = jest.spyOn(common, 'errorHandler')
      .mockImplementation((res) => Promise.resolve(res));

    const result = await common.checkStatus(checkstatusparam);

    expect(checkStatusSpy).toHaveBeenCalledTimes(1);
    expect(checkStatusSpy).toHaveBeenCalledWith(answer);

  });

  it('should call errorHandler with error correctly', async () => {

    try {
      common.errorHandler(new HancockError(hancockErrorType.Api, '001', 500, 'testError'));
      fail('it should fail');
    } catch (error) {
      expect(error).toEqual(new HancockError(hancockErrorType.Api, '001', 500, 'testError'));
    }

  });

  it('should call errorHandler without error correctly', async () => {

    try {
      common.errorHandler({ body: { message: 'testErrorBody' } });
      fail('it should fail');
    } catch (error) {
      expect(error).toEqual(new HancockError(hancockErrorType.Api, '001', 500, 'testErrorBody'));
    }

  });

});
