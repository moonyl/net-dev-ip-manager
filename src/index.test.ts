
import NetworkDeviceModule from './index';
import { getActiveConnections, modifyDevAddress } from './connection';

jest.mock('./connection', () => ({
    getActiveConnections: jest.fn(),
}));

describe('NetworkDeviceModule', () => {
    const mockNetworkOps = {
        modifyDevAddress: jest.fn(),
        applyDevAddress: jest.fn(),
    }
    beforeEach(() => {
        jest.clearAllMocks();
        NetworkDeviceModule.setNetworkOperations(mockNetworkOps);
    });

    describe('setIpAddress', () => {
        it('should call network operations in correct order', async () => {
            const mockAddressInfo = {
                device: 'eth0',
                address: '192.168.1.100',
                subnet: '255.255.255.0',
            };
            mockNetworkOps.modifyDevAddress.mockResolvedValue('success');
            mockNetworkOps.applyDevAddress.mockResolvedValue('success');
            await NetworkDeviceModule.setIpAddress(mockAddressInfo);
            expect(mockNetworkOps.modifyDevAddress).toHaveBeenCalled();
            expect(mockNetworkOps.applyDevAddress).toHaveBeenCalledWith('eth0');
        });
    });
});
