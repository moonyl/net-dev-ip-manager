import { runCommand } from "../src/command";

it("명령이 실행되어야 한다.", async () => {
    const command = "nmcli c show --active";
    try {
        await runCommand(command);
        expect(true).toBe(true);
    } catch (error) {
        expect(error).toBeFalsy();
    }
})