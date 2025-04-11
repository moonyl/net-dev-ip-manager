import { runCommand } from "../command";

export async function getActiveConnections(): Promise<string> {
    const result = await runCommand('nmcli c show --active');
    // console.log(result); // The result as a string
    return result;
}

export async function modifyDevAddress(uuid: string, command: string) {
    const result = await runCommand(`nmcli c mod uuid ${uuid} ${command}`);
    console.log({ result }); // The result as a string
    return result;
}

export async function applyDevAddress(devName: string) {
    const result = await runCommand(`nmcli c up ifname ${devName}`);
    console.log({ result }); // The result as a string
    return result;
}

export async function getDeviceStat(devName: string): Promise<string> {
    const result = await runCommand(`nmcli dev show ${devName}`);
    // console.log(result);
    return result;
}
