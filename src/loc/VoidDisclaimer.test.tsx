import { LocData } from "@logion/client";
import { UUID } from "@logion/node-api";

import { shallowRender } from "src/tests"
import VoidDisclaimer from "./VoidDisclaimer"

describe("VoidDisclaimer", () => {

    it("renders empty if not void", () => {
        const loc = {

        } as unknown as LocData;
        renderWithLoc(loc);
    })

    it("renders void info without replacer for transaction LOC", () => {
        const loc = {
            locType: "Transaction",
            voidInfo: voidInfoWithoutReplacer,
        } as unknown as LocData;
        renderWithLoc(loc);
    })

    it("renders void info with replacer for transaction LOC", () => {
        const loc = {
            locType: "Transaction",
            voidInfo: voidInfoWithReplacer,
        } as unknown as LocData;
        renderWithLoc(loc);
    })

    it("renders void info without replacer for identity LOC", () => {
        const loc = {
            locType: "Identity",
            voidInfo: voidInfoWithoutReplacer,
        } as unknown as LocData;
        renderWithLoc(loc);
    })

    it("renders void info with replacer for identity LOC", () => {
        const loc = {
            locType: "Identity",
            voidInfo: voidInfoWithReplacer,
        } as unknown as LocData;
        renderWithLoc(loc);
    })

    it("renders void info for collection LOC", () => {
        const loc = {
            locType: "Collection",
            voidInfo: voidInfoWithoutReplacer,
        } as unknown as LocData;
        renderWithLoc(loc);
    })
})

const replacer = new UUID("09abf4f9-a29b-4bce-b371-4360d38cad07");
const voidInfoWithReplacer = {
    voidedOn: "2022-09-28T17:25:00.000+02:00",
    reason: "Because",
    replacer,
}
const voidInfoWithoutReplacer = {
    voidedOn: "2022-09-28T17:25:00.000+02:00",
    reason: "Because",
}

function renderWithLoc(loc: LocData) {
    const element = shallowRender(<VoidDisclaimer loc={ loc } detailsPath={ () => "" } />);
    expect(element).toMatchSnapshot();
}
