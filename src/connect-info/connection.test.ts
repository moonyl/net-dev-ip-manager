import { NetworkInfo, getNetworkInfoFromConnections } from "./connection";

describe("NetworkInfo", () => {
    test("nmcli c show --active의 결과로부터 NetworkInfo를 얻어와야 한다.", () => {
        const inputConnections = "NAME                UUID                                  TYPE      DEVICE\n\
        Wired connection 1  aebcbe81-7e4d-3be6-853c-d59f25ac5e19  ethernet  eth0\n\
        docker0             51de33c3-d28d-44fd-a5fe-4a6147bdc39f  bridge    docker0";

        const expectedOutput: NetworkInfo[] = [{
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
        }
        ];

        const result = getNetworkInfoFromConnections(inputConnections);
        expect(result).toEqual(expectedOutput);
    })
})
