import { IDevAddressToWrite, formatDevAddress, formatDevAddressV6, subnetMaskToCIDR } from "./dev-modify";

// device: string;
// address ?: string;
// subnet ?: string;
// gateway ?: string;
// dns ?: string[];

describe("device 설정 변경", () => {
    test("서브넷 마스크로 CIDR sider 값으로 변경해야 한다.", () => {
        const sider1 = subnetMaskToCIDR("255.255.255.0");
        expect(sider1).toBe("/24");
        const sider2 = subnetMaskToCIDR("255.255.0.0");
        expect(sider2).toBe("/16");
    })

    test("IDevAddressToWrite 값을 통해, nmcli 장치 변경 명령을 만든다.", () => {
        const devAddresses: IDevAddressToWrite[] = [
            {
                device: "eth0",
                address: "192.168.15.83"
            },
            {
                device: "eth0",
                address: "192.168.15.83",
                subnet: "255.255.0.0"
            },
            {
                device: "eth0",
                address: "192.168.15.83",
                gateway: "192.168.15.66"
            },
            {
                device: "eth0",
                address: "192.168.15.83",
                gateway: "192.168.15.66",
                dns: ["8.8.8.8"]
            },
            {
                device: "eth0",
                address: "192.168.15.83",
                dns: ["8.8.8.8"]
            }
        ]

        const expectedOutputs: string[] = [
            "ipv4.address 192.168.15.83/24",
            "ipv4.address 192.168.15.83/16",
            "ipv4.address 192.168.15.83/24 ipv4.gateway 192.168.15.66",
            'ipv4.address 192.168.15.83/24 ipv4.gateway 192.168.15.66 ipv4.dns "8.8.8.8"',
            'ipv4.address 192.168.15.83/24 ipv4.dns "8.8.8.8"',
        ];

        devAddresses.forEach((addr, index) => {
            const result = formatDevAddress(addr);
            expect(result).toBe(expectedOutputs[index]);
        })
    });

    test("IDevAddressToWrite 값을 통해, IPv6 nmcli 장치 변경 명령을 만든다.", () => {
        const devAddressesV6: IDevAddressToWrite[] = [
            {
                device: "eth0",
                address: "2001:db8::1"
            },
            {
                device: "eth0",
                address: "2001:db8::1",
                subnet: "ffff:ffff:ffff:ffff::"
            },
            {
                device: "eth0",
                address: "2001:db8::1",
                gateway: "2001:db8::fffe"
            },
            {
                device: "eth0",
                address: "2001:db8::1",
                gateway: "2001:db8::fffe",
                dns: ["2001:4860:4860::8888"]
            },
            {
                device: "eth0",
                address: "2001:db8::1",
                dns: ["2001:4860:4860::8888"]
            }
        ];

        const expectedOutputsV6: string[] = [
            "ipv6.address 2001:db8::1/64",
            "ipv6.address 2001:db8::1/64",
            "ipv6.address 2001:db8::1/64 ipv6.gateway 2001:db8::fffe",
            'ipv6.address 2001:db8::1/64 ipv6.gateway 2001:db8::fffe ipv6.dns "2001:4860:4860::8888"',
            'ipv6.address 2001:db8::1/64 ipv6.dns "2001:4860:4860::8888"',
        ];

        devAddressesV6.forEach((addr, index) => {
            const result = formatDevAddressV6(addr);
            expect(result).toBe(expectedOutputsV6[index]);
        });
    });

});