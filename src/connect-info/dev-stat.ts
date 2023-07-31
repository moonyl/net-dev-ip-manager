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
    ipAddress: string;
    subnet: string;
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
    // console.log({ input })
    const [ipAddress, subnetPrefix] = input.split('/');
    const subnetMask = getSubnetMask(parseInt(subnetPrefix, 10));
    return { ipAddress, subnet: subnetMask };
}


export interface IDevAddress {
    device: string;
    address: string;
    subnet: string;
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
    return devAddresses;
}