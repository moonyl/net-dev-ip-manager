export function subnetMaskToCIDR(subnetMask: string): string {
    const subnetParts = subnetMask.split('.').map(Number);
    let cidr = 0;

    for (let i = 0; i < subnetParts.length; i++) {
        const binary = subnetParts[i].toString(2);
        cidr += (binary.match(/1/g) || []).length;
    }

    return `/${cidr}`;
}

export interface IDevAddressToWrite {
    device: string;
    address?: string;
    subnet?: string;
    gateway?: string;
    dns?: string[];
}

export function formatDevAddress(devAddress: IDevAddressToWrite): string {
    const subnetCIDR = subnetMaskToCIDR(devAddress.subnet || "255.255.255.0");

    let result = "";
    if (devAddress.address) {
        result = `ipv4.address ${devAddress.address}${subnetCIDR} `;
    }

    if (devAddress.gateway) {
        result += `ipv4.gateway ${devAddress.gateway} `;
    }

    if (devAddress.dns) {
        result += `ipv4.dns "${devAddress.dns.join(' ')}" `;
    }

    return result.trim();
}