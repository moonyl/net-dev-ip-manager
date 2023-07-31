import { Test, Booleanish } from "./ift";

console.log("hello world");

export function test(inst: Test) {
    console.log(inst.test);
}

export function test2(inst: Booleanish) {
    console.log(inst);
}

