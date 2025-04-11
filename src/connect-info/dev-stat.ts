import { getDeviceStat } from "../connection";
import { NetworkInfo } from "./connection";

export function parseDeviceStat(stat: string): Record<string, string> {
    // console.log({ stat });
    const lines = stat.split('\n');
    const result: Record<string, string> = {};

    lines.forEach((line) => {
        const [key, ...values] = line.split(': ');
        // console.log({ key });
        const value = values.join(': ').trim();
        result[key.trim()] = value;
    });

    return result;
}

export interface IPInfo {
    ipAddress: string | null;
    subnet: string | null;
}

export function getSubnetMask(prefix: number): string {
    const numBits = 32 - prefix;
    const subnetMask = (0xffffffff << numBits) >>> 0;
    return [
        (subnetMask >>> 24) & 0xff,
        (subnetMask >>> 16) & 0xff,
        (subnetMask >>> 8) & 0xff,
        subnetMask & 0xff,
    ].join('.');
}

export function extractIPInfo(input: string): IPInfo {
    console.log({ input })
    if (!input) {
        return { ipAddress: null, subnet: null };
    }
    const [ipAddress, subnetPrefix] = input.split('/');
    const subnetMask = getSubnetMask(parseInt(subnetPrefix, 10));
    return { ipAddress, subnet: subnetMask };
}

export interface IPInfoV6 {
    ipAddress: string | null;
    subnetPrefix: number | null;
}
// CIDR 표기법으로 된 IPv6 주소로 부터 IPv6 주소와 CIDR 표기법의 서브넷을 추출한다.
export function extractIPInfoV6(input: string): IPInfoV6 {
    console.log({ input })
    if (!input) {
        return { ipAddress: null, subnetPrefix: null };
    }
    const [ipAddress, subnetPrefixStr] = input.split('/');
    
    return { ipAddress, subnetPrefix: parseInt(subnetPrefixStr, 10)};
}   

export interface IDevAddress {
    device: string;
    address: string | null;
    subnet: string | null;
    gateway: string;
    dns: string[];
    mac: string;
}

export function extractDevAddress(input: Record<string, string>): IDevAddress {
    // console.log({ input });
    // console.log(input['GENERAL.TYPE']);
    const { ipAddress, subnet } = extractIPInfo(input['IP4.ADDRESS[1]']);
    const devAddress: IDevAddress = {
        device: input['GENERAL.DEVICE'],
        address: ipAddress,
        subnet,
        gateway: input['IP4.GATEWAY'],
        dns: [input['IP4.DNS[1]']],
        mac: input['GENERAL.HWADDR'],
    };

    return devAddress;
    // return { device: "", address: "", subnet: "", gateway: "", dns: [], mac: "" };
}

export interface IDevAddressV6 {
    device: string;
    address: string | null;
    subnetPrefix: number | null;
    gateway: string;
    dns: string[];
    mac: string;
}

export function extractDevAddressV6(input: Record<string, string>): IDevAddressV6 {
    // console.log({ input });
    // console.log(input['GENERAL.TYPE']);
    const { ipAddress, subnetPrefix } = extractIPInfoV6(input['IP6.ADDRESS[1]']);
    const devAddress: IDevAddressV6 = {
        device: input['GENERAL.DEVICE'],
        address: ipAddress,
        subnetPrefix,
        gateway: input['IP6.GATEWAY'] === '--' ? '' : input['IP6.GATEWAY'],
        dns: input['IP6.DNS[1]'] ? [ input['IP6.DNS[1]'] ] : [],
        mac: input['GENERAL.HWADDR'],
    };

    return devAddress;
    // return { device: "", address: "", subnet: "", gateway: "", dns: [], mac: "" };
}

export async function getDeviceStats(connectObjs: NetworkInfo[]): Promise<IDevAddress[]> {
    const stats = await Promise.all(
        connectObjs.map(con => getDeviceStat(con.device))
    );
    // console.log(stats.length);
    const records: Record<string, string>[] = stats.map(stat => parseDeviceStat(stat));

    // records.map(record => console.log(record['GENERAL.DEVICE']));
    // console.log("after");
    // records.forEach(record => console.log(record['GENERAL.DEVICE']));

    const devAddresses: IDevAddress[] = records.map(record => extractDevAddress(record));
    // console.log(devAddresses)
    // return devAddresses.filter(dev => dev.address !== null);
    return devAddresses;
}

export async function getDeviceV6Stats(connectObjs: NetworkInfo[]): Promise<IDevAddressV6[]> {
    const stats = await Promise.all(
        connectObjs.map(con => getDeviceStat(con.device))
    );
    // console.log(stats.length);
    const records: Record<string, string>[] = stats.map(stat => parseDeviceStat(stat));

    // records.map(record => console.log(record['GENERAL.DEVICE']));
    // console.log("after");
    // records.forEach(record => console.log(record['GENERAL.DEVICE']));

    const devAddresses: IDevAddressV6[] = records.map(record => extractDevAddressV6(record));
    // console.log(devAddresses)
    // return devAddresses.filter(dev => dev.address !== null);
    return devAddresses;
}
