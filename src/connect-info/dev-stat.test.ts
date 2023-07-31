import { NetworkInfo } from "./connection";
import { IDevAddress, extractDevAddress, extractIPInfo, getDeviceStats, getSubnetMask, parseDeviceStat } from "./dev-stat"
import { getDeviceStat } from "../connection";

jest.mock('../connection');

describe("device state", () => {
    test("장치 상태로부터 key/value로 분리해낸다.", () => {
        const inputDevStat = `GENERAL.DEVICE:                         eth0
GENERAL.TYPE:                           ethernet
GENERAL.HWADDR:                         48:B0:2D:D8:BC:D2
GENERAL.MTU:                            1500
GENERAL.STATE:                          100 (connected)
GENERAL.CONNECTION:                     Wired connection 1
GENERAL.CON-PATH:                       /org/freedesktop/NetworkManager/ActiveConnection/6
WIRED-PROPERTIES.CARRIER:               on
IP4.ADDRESS[1]:                         192.168.15.83/24
IP4.GATEWAY:                            192.168.15.66
IP4.ROUTE[1]:                           dst = 192.168.15.0/24, nh = 0.0.0.0, mt = 100
IP4.ROUTE[2]:                           dst = 0.0.0.0/0, nh = 192.168.15.66, mt = 100
IP4.DNS[1]:                             8.8.8.8
IP6.ADDRESS[1]:                         fe80::7fb7:1e8f:34da:9c18/64
IP6.GATEWAY:                            --
IP6.ROUTE[1]:                           dst = fe80::/64, nh = ::, mt = 100`;

        const expectedOutput: Record<string, string> = {
            "GENERAL.DEVICE": "eth0",
            "GENERAL.TYPE": "ethernet",
            "GENERAL.HWADDR": "48:B0:2D:D8:BC:D2",
            "GENERAL.MTU": "1500",
            "GENERAL.STATE": "100 (connected)",
            "GENERAL.CONNECTION": "Wired connection 1",
            "GENERAL.CON-PATH": "/org/freedesktop/NetworkManager/ActiveConnection/6",
            "WIRED-PROPERTIES.CARRIER": "on",
            "IP4.ADDRESS[1]": "192.168.15.83/24",
            "IP4.GATEWAY": "192.168.15.66",
            "IP4.ROUTE[1]": "dst = 192.168.15.0/24, nh = 0.0.0.0, mt = 100",
            "IP4.ROUTE[2]": "dst = 0.0.0.0/0, nh = 192.168.15.66, mt = 100",
            "IP4.DNS[1]": "8.8.8.8",
            "IP6.ADDRESS[1]": "fe80::7fb7:1e8f:34da:9c18/64",
            "IP6.GATEWAY": "--",
            "IP6.ROUTE[1]": "dst = fe80::/64, nh = ::, mt = 100",
        };
        const result = parseDeviceStat(inputDevStat);
        expect(result).toEqual(expectedOutput);
    });

    test("sider 표기 숫자를 통해 서브넷 마스크 문자를 구해야 한다.", () => {
        const mask1 = getSubnetMask(24);
        expect(mask1).toBe("255.255.255.0");
        const mask2 = getSubnetMask(16);
        expect(mask2).toBe("255.255.0.0");
    })

    test("cidr 표기 IP를 통해 IP와 서브넷 마스크를 구해야 한다.", () => {
        const { ipAddress, subnet } = extractIPInfo("192.168.15.238/24");
        expect(ipAddress).toBe("192.168.15.238");
        expect(subnet).toBe("255.255.255.0");
    })

    test("key/value로 분리된 장치 정보에 대해 IDevAddres 정보로 얻어낸다.", () => {
        const inputRecord: Record<string, string> = {
            "GENERAL.DEVICE": "eth0",
            "GENERAL.TYPE": "ethernet",
            "GENERAL.HWADDR": "48:B0:2D:D8:BC:D2",
            "GENERAL.MTU": "1500",
            "GENERAL.STATE": "100 (connected)",
            "GENERAL.CONNECTION": "Wired connection 1",
            "GENERAL.CON-PATH": "/org/freedesktop/NetworkManager/ActiveConnection/6",
            "WIRED-PROPERTIES.CARRIER": "on",
            "IP4.ADDRESS[1]": "192.168.15.83/24",
            "IP4.GATEWAY": "192.168.15.66",
            "IP4.ROUTE[1]": "dst = 192.168.15.0/24, nh = 0.0.0.0, mt = 100",
            "IP4.ROUTE[2]": "dst = 0.0.0.0/0, nh = 192.168.15.66, mt = 100",
            "IP4.DNS[1]": "8.8.8.8",
            "IP6.ADDRESS[1]": "fe80::7fb7:1e8f:34da:9c18/64",
            "IP6.GATEWAY": "--",
            "IP6.ROUTE[1]": "dst = fe80::/64, nh = ::, mt = 100",
        };

        const expectedOutput: IDevAddress = {
            device: "eth0",
            address: "192.168.15.83",
            subnet: "255.255.255.0",
            gateway: "192.168.15.66",
            dns: ["8.8.8.8"],
            mac: "48:B0:2D:D8:BC:D2"
        }
        const result = extractDevAddress(inputRecord);
        expect(result).toEqual(expectedOutput);
    })

    test("NetworkInfo 리스트를 통해 장치의 IDevAddress 리스트를 얻어내야 한다.", async () => {

        const inputNetworkInfo: NetworkInfo[] = [{
            name: "Wired connection 1",
            uuid: "aebcbe81-7e4d-3be6-853c-d59f25ac5e19",
            type: "ethernet",
            device: "eth0"
        },
        {
            name: "docker0",
            uuid: "51de33c3-d28d-44fd-a5fe-4a6147bdc39f",
            type: "bridge",
            device: "docker0"
        }];

        const expectedStatForEth0 =
            `GENERAL.DEVICE:                         eth0
            GENERAL.TYPE:                           ethernet
            GENERAL.HWADDR:                         48:B0:2D:D8:BC:D2
            GENERAL.MTU:                            1500
            GENERAL.STATE:                          100 (connected)
            GENERAL.CONNECTION:                     Wired connection 1
            GENERAL.CON-PATH:                       /org/freedesktop/NetworkManager/ActiveConnection/6
            WIRED-PROPERTIES.CARRIER:               on
            IP4.ADDRESS[1]:                         192.168.15.83/24
            IP4.GATEWAY:                            192.168.15.66
            IP4.ROUTE[1]:                           dst = 192.168.15.0/24, nh = 0.0.0.0, mt = 100
            IP4.ROUTE[2]:                           dst = 0.0.0.0/0, nh = 192.168.15.66, mt = 100
            IP4.DNS[1]:                             8.8.8.8
            IP6.ADDRESS[1]:                         fe80::7fb7:1e8f:34da:9c18/64
            IP6.GATEWAY:                            --
            IP6.ROUTE[1]:                           dst = fe80::/64, nh = ::, mt = 100`;
        const expectedStatForDocker0 =
            `GENERAL.DEVICE:                         docker0
            GENERAL.TYPE:                           bridge
            GENERAL.HWADDR:                         02:42:1A:80:39:48
            GENERAL.MTU:                            1500
            GENERAL.STATE:                          100 (connected)
            GENERAL.CONNECTION:                     docker0
            GENERAL.CON-PATH:                       /org/freedesktop/NetworkManager/ActiveConnection/1
            IP4.ADDRESS[1]:                         172.17.0.1/16
            IP4.GATEWAY:                            --
            IP4.ROUTE[1]:                           dst = 172.17.0.0/16, nh = 0.0.0.0, mt = 0
            IP4.ROUTE[2]:                           dst = 169.254.0.0/16, nh = 0.0.0.0, mt = 1000
            IP6.GATEWAY:                            --`;

        (getDeviceStat as jest.MockedFunction<typeof getDeviceStat>).mockImplementation((devName: string) => {
            if (devName === 'eth0') {
                return Promise.resolve(expectedStatForEth0);
            } else if (devName === 'docker0') {
                return Promise.resolve(expectedStatForDocker0);
            }
            // Add more conditions as needed for other devices
            return Promise.resolve('not defined result');
        });

        const expectedOutput: IDevAddress[] = [
            {
                device: 'eth0',
                address: '192.168.15.83',
                subnet: '255.255.255.0',
                gateway: '192.168.15.66',
                dns: ['8.8.8.8'],
                mac: '48:B0:2D:D8:BC:D2'
            },
            {
                device: 'docker0',
                address: '172.17.0.1',
                subnet: '255.255.0.0',
                gateway: '--',
                dns: [],
                mac: '02:42:1A:80:39:48'
            }

        ]
        const result = await getDeviceStats(inputNetworkInfo);
        expect(result).toEqual(expectedOutput);
    })

});