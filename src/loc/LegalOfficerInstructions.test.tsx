import { LocData, LocRequestState } from "@logion/client";
import { UUID } from "@logion/node-api";
import { shallowRender } from "src/tests"
import LegalOfficerInstructions from "./LegalOfficerInstructions"

describe("LegalOfficerInstructions", () => {

    it("renders for logion identity", () => {
        const { loc, locState } = buildLogionIdentityMock();
        const element = shallowRender(<LegalOfficerInstructions
            loc={ loc }
            locState={ locState }
            { ...otherProps }
        />);
        expect(element).toMatchSnapshot();
    })

    it("renders for polkadot identity", () => {
        const { loc, locState } = buildPolkadotIdentityMock();
        const element = shallowRender(<LegalOfficerInstructions
            loc={ loc }
            locState={ locState }
            { ...otherProps }
        />);
        expect(element).toMatchSnapshot();
    })
})

const otherProps = {
    detailsPath: () => "/",
};

const id = new UUID("274c1273-5d0e-4c81-bce4-a15518affd35");

function buildLogionIdentityMock(): { loc: LocData, locState: LocRequestState } {
    const loc = {
        id,
        locType: "Identity",
        userIdentity: {
            firstName: "John",
            lastName: "Doe",
        }
    } as unknown as LocData;
    const locState = {
        isLogionIdentity: () => true,
    } as unknown as LocRequestState;
    return { loc, locState };
}

function buildPolkadotIdentityMock(): { loc: LocData, locState: LocRequestState } {
    const loc = {
        id,
        locType: "Identity",
    } as unknown as LocData;
    const locState = {
        isLogionIdentity: () => false,
    } as unknown as LocRequestState;
    return { loc, locState };
}
