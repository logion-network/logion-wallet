import { LocData, PublicLoc } from "@logion/client";
import { UUID } from "@logion/node-api";
import { shallowRender } from "src/tests";
import SupersedesDisclaimer from "./SupersedesDisclaimer";

describe("SupersedesDisclaimer", () => {

    it("renders empty without superseded LOC", () => {
        const loc = {
            
        } as unknown as LocData;
        renderWithLoc(loc);
    })

    it("renders with superseded LOC", () => {
        const loc = {
            locType: "Transaction",
        } as unknown as LocData;
        const supersededLoc = {
            data: {
                id: supersededLocId,
                voidInfo: {
                    voidedOn: "2022-09-29T08:51:00.000+02:00"
                }
            }
        } as unknown as PublicLoc;
        renderWithLoc(loc, supersededLoc);
    })
})

function renderWithLoc(loc: LocData, supersededLoc?: PublicLoc) {
    const element = shallowRender(<SupersedesDisclaimer loc={ loc } supersededLoc={ supersededLoc } detailsPath={ () => "" } />);
    expect(element).toMatchSnapshot();
}

const supersededLocId = new UUID("0e16421a-2550-4be5-a6a8-1ab2239b7dc4");
