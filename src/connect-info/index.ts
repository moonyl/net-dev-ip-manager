import { NetworkInfo, getNetworkInfoFromConnections } from "./connection";
import { formatDevAddress, IDevAddressToWrite, IDevAddressV6ToWrite } from "./dev-modify";
import { getDeviceStats, getDeviceV6Stats, IDevAddress, IDevAddressV6 } from "./dev-stat";

export {
    NetworkInfo,
    getNetworkInfoFromConnections,
    getDeviceStats,
    getDeviceV6Stats,
    IDevAddress,
    formatDevAddress,
    IDevAddressToWrite,
    IDevAddressV6,
    IDevAddressV6ToWrite
};