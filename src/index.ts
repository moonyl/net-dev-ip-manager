import { IDevAddress, IDevAddressToWrite, formatDevAddress, getDeviceStats, getNetworkInfoFromConnections } from "./connect-info";
import { getActiveConnections, modifyDevAddress, applyDevAddress } from "./connection";

export { IDevAddress, IDevAddressToWrite }

export default class NetworkDeviceModule {
    static async getIpAddress(): Promise<IDevAddress[]> {
        // connection 정보를 얻는다.
        const connectionStat = await getActiveConnections();
        // 정보를 담은 객체 배열로 파싱한다.
        const connectObjs = getNetworkInfoFromConnections(connectionStat);
        // ethernet 타입만 필터링한다.
        const filtered = connectObjs.filter(con => con.type === 'ethernet');
        // device 정보를 얻는다.
        const devAddresses = await getDeviceStats(filtered);
        return devAddresses;
    }

    static async setIpAddress(addressInfo: IDevAddressToWrite) {
        // connection 정보를 얻는다.
        const connectionStat = await getActiveConnections();
        // 정보를 담은 객체 배열로 파싱한다.
        const connectObjs = getNetworkInfoFromConnections(connectionStat);
        console.log(connectObjs)
        // addressInfo에서 지정한 device 정보로 uuid를 찾는다.
        const connObj = connectObjs.filter(conn => conn.device === addressInfo.device);
        const uuid = connObj[0].uuid;
        console.log({ uuid });
        const formatted = formatDevAddress(addressInfo);
        console.log(formatted);
        const modiResult = await modifyDevAddress(uuid, formatted);
        const applyResult = await applyDevAddress(addressInfo.device);
    }
}