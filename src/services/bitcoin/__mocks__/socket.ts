import { __socketInstance__ } from '../../common/__mocks__/socket';

__socketInstance__.addContract = jest.fn().mockReturnThis();

// tslint:disable-next-line:variable-name
export const HancockBitcoinSocket = jest.fn().mockImplementation(() => __socketInstance__);
