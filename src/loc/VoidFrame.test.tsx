import { LocData } from "@logion/client";
import { shallowRender } from "src/tests";
import VoidFrame from "./VoidFrame";

describe("VoidFrame", () => {

    it("renders for non-void non-collection LOC", () => {
        const loc = {
            locType: "Transaction",
        } as unknown as LocData;
        renderWithLoc(loc);
    })

    it("renders for non-void collection LOC (only void without replacer)", () => {
        const loc = {
            locType: "Collection",
        } as unknown as LocData;
        renderWithLoc(loc);
    })
})

function renderWithLoc(loc: LocData) {
    const element = shallowRender(<VoidFrame loc={ loc } />);
    expect(element).toMatchSnapshot();
}
