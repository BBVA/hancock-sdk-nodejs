import { __socketInstance__ } from '../../common/__mocks__/socket';

__socketInstance__.addContract = jest.fn().mockReturnThis();

export { __socketInstance__ };

// tslint:disable-next-line:variable-name
export const HancockEthereumSocket = jest.fn().mockImplementation(() => __socketInstance__);
