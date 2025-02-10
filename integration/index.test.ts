import { runCommand } from "../src/command";
import NetworkDeviceModule from "../src";

describe("command", () => {
    test("명령이 실행되어야 한다.", async () => {
        const command = "nmcli c show --active";
        try {
            await runCommand(command);
            expect(true).toBe(true);
        } catch (error) {
            expect(error).toBeFalsy();
        }
    })
})

describe("dev configuration", () => {
    test("ethernet 장치들로부터 정보를 가져온다.", async () => {
        const result = await NetworkDeviceModule.getIpAddress();
        console.log(result);
        expect(result).not.toBeNull();
    })
});

