
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
            (getActiveConnections as jest.Mock).mockResolvedValue(
                `NAME                UUID                                  TYPE      DEVICE   
Wired connection 3  f9c0d3b5-e604-329c-9e2a-d82fef5a28f6  ethernet  enP8p1s0 
docker0             c94781ee-b5db-4ca6-8a7e-9c8425c19ce1  bridge    docker0  `
            );

            const mockAddressInfo = {
                device: 'enP8p1s0',
                address: '192.168.1.100',
                subnet: '255.255.255.0',
            };
            mockNetworkOps.modifyDevAddress.mockResolvedValue('success');
            mockNetworkOps.applyDevAddress.mockResolvedValue('success');
            await NetworkDeviceModule.setIpAddress(mockAddressInfo);
            expect(mockNetworkOps.modifyDevAddress).toHaveBeenCalled();
            expect(mockNetworkOps.applyDevAddress).toHaveBeenCalledWith('enP8p1s0');
        });
    });

    describe('setIpAddressV6', () => {
        it('should call network operations in correct order for IPv6', async () => {
            (getActiveConnections as jest.Mock).mockResolvedValue(
                `NAME                UUID                                  TYPE      DEVICE    \nWired connection 3  f9c0d3b5-e604-329c-9e2a-d82fef5a28f6  ethernet  enP8p1s0  \ndocker0             c94781ee-b5db-4ca6-8a7e-9c8425c19ce1  bridge    docker0  `
            );

            const mockAddressInfoV6 = {
                device: 'enP8p1s0',
                address: '2001:db8::1',
                subnet: 'ffff:ffff:ffff:ffff::',
            };

            mockNetworkOps.modifyDevAddress.mockResolvedValue('success');
            mockNetworkOps.applyDevAddress.mockResolvedValue('success');

            await NetworkDeviceModule.setIpAddressV6(mockAddressInfoV6);

            expect(mockNetworkOps.modifyDevAddress).toHaveBeenCalled();
            expect(mockNetworkOps.applyDevAddress).toHaveBeenCalledWith('enP8p1s0');
        });
    });    
});
