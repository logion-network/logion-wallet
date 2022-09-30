import { LocData } from "@logion/client";
import { LocType } from "@logion/node-api";
import { shallowRender } from "src/tests";
import LocPane from "./LocPane";

jest.mock("../common/CommonContext");

describe("LocPane", () => {

    const otherProps = {
        backPath: "/",
        children: "Some content"
    };

    it("renders transaction LOC", () => {
        const loc = mockLocData("Transaction");
        const element = shallowRender(<LocPane loc={ loc } { ...otherProps } />);
        expect(element).toMatchSnapshot();
    })

    it("renders identity LOC", () => {
        const loc = mockLocData("Identity");
        const element = shallowRender(<LocPane loc={ loc } { ...otherProps } />);
        expect(element).toMatchSnapshot();
    })

    it("renders collection LOC", () => {
        const loc = mockLocData("Collection");
        const element = shallowRender(<LocPane loc={ loc } { ...otherProps } />);
        expect(element).toMatchSnapshot();
    })
});

function mockLocData(locType: LocType): LocData {
    return {
        locType,
    } as unknown as LocData;
}
