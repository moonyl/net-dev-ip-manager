import { test } from "../src"
import { Test } from "../src/ift"

it("테스트가 실행되어야 한다.", () => {
    const param: Test = { test: "hellow" };
    test(param);
})