import {
  IDevAddress,
  IDevAddressToWrite,
  formatDevAddress,
  getDeviceStats,
  getNetworkInfoFromConnections,
  getDeviceV6Stats,
  IDevAddressV6ToWrite,
  IDevAddressV6,
} from "./connect-info";
import { formatDevAddressV6 } from "./connect-info/dev-modify";
// import { IDevAddressV6ToWrite } from "./connect-info/dev-modify";
// import { IDevAddressV6 } from "./connect-info/dev-stat";
import {
  getActiveConnections,
  modifyDevAddress,
  applyDevAddress,
} from "./connection";

export { IDevAddress, IDevAddressToWrite, IDevAddressV6ToWrite, IDevAddressV6 };

// 네트워크 작업을 위한 인터페이스 정의
export interface NetworkOperations {
  modifyDevAddress: (uuid: string, command: string) => Promise<string>;
  applyDevAddress: (devName: string) => Promise<string>;
}

export default class NetworkDeviceModule {
  // 기본 구현체를 정적 멤버로 설정
  private static networkOps: NetworkOperations = {
    modifyDevAddress,
    applyDevAddress,
  };

  static setNetworkOperations(ops: Partial<NetworkOperations>) {
    this.networkOps = {
      ...NetworkDeviceModule.networkOps,
      ...ops,
    };
  }

  static async getIpAddress(): Promise<IDevAddress[]> {
    // connection 정보를 얻는다.
    const connectionStat = await getActiveConnections();
    // 정보를 담은 객체 배열로 파싱한다.
    const connectObjs = getNetworkInfoFromConnections(connectionStat);
    // ethernet 타입만 필터링한다.
    const filtered = connectObjs.filter((con) => con.type === "ethernet");
    // device 정보를 얻는다.
    const devAddresses = await getDeviceStats(filtered);
    return devAddresses;
  }

  static async setIpAddress(addressInfo: IDevAddressToWrite) {
    // connection 정보를 얻는다.
    const connectionStat = await getActiveConnections();
    // console.log({connectionStat});
    // 정보를 담은 객체 배열로 파싱한다.
    const connectObjs = getNetworkInfoFromConnections(connectionStat);
    // console.log(connectObjs)
    // addressInfo에서 지정한 device 정보로 uuid를 찾는다.
    const connObj = connectObjs.filter(
      (conn) => conn.device === addressInfo.device,
    );
    const uuid = connObj[0].uuid;
    // console.log({ uuid });
    const formatted = formatDevAddress(addressInfo);
    // console.log(formatted);
    await this.networkOps.modifyDevAddress(uuid, formatted);
    await this.networkOps.applyDevAddress(addressInfo.device);
  }

  static async getIpAddressV6(): Promise<IDevAddressV6[]> {
    // connection 정보를 얻는다.
    const connectionStat = await getActiveConnections();
    // 정보를 담은 객체 배열로 파싱한다.
    const connectObjs = getNetworkInfoFromConnections(connectionStat);
    // ethernet 타입만 필터링한다.
    const filtered = connectObjs.filter((con) => con.type === "ethernet");
    // device 정보를 얻는다.
    const devAddresses = await getDeviceV6Stats(filtered);
    return devAddresses;
  }

  static async setIpAddressV6(addressInfo: IDevAddressV6ToWrite) {
    // connection 정보를 얻는다.
    const connectionStat = await getActiveConnections();
    // 정보를 담은 객체 배열로 파싱한다.
    const connectObjs = getNetworkInfoFromConnections(connectionStat);
    // console.log(connectObjs)
    // addressInfo에서 지정한 device 정보로 uuid를 찾는다.
    const connObj = connectObjs.filter(
      (conn) => conn.device === addressInfo.device,
    );
    const uuid = connObj[0].uuid;
    // console.log({ uuid });
    const formatted = formatDevAddressV6(addressInfo);
    // console.log(formatted);
    await this.networkOps.modifyDevAddress(uuid, formatted);
    await this.networkOps.applyDevAddress(addressInfo.device);
  }
}
