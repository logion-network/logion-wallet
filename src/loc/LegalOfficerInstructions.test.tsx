import { LocData } from "@logion/client";
import { UUID } from "@logion/node-api";
import { shallowRender } from "src/tests"
import LegalOfficerInstructions from "./LegalOfficerInstructions"
import { ActiveLoc } from "./LocContext";
import { ProtectionRequest } from "@logion/client/dist/RecoveryClient";

describe("LegalOfficerInstructions", () => {

    it("renders for logion identity", () => {
        const { loc, locState } = buildLogionIdentityMock();
        const element = shallowRender(<LegalOfficerInstructions
            loc={ loc }
            locState={ locState }
            protectionRequest={ null }
            { ...otherProps }
        />);
        expect(element).toMatchSnapshot();
    })

    it("renders for identity LOC and protection request", () => {
        const { loc, locState } = buildPolkadotIdentityMock();
        const element = shallowRender(<LegalOfficerInstructions
            loc={ loc }
            locState={ locState }
            protectionRequest={ protectionRequest }
            { ...otherProps }
        />);
        expect(element).toMatchSnapshot();
    })

    it("renders for identity LOC and recovery request", () => {
        const { loc, locState } = buildPolkadotIdentityMock();
        const element = shallowRender(<LegalOfficerInstructions
            loc={ loc }
            locState={ locState }
            protectionRequest={ recoveryRequest }
            { ...otherProps }
        />);
        expect(element).toMatchSnapshot();
    })
})

const otherProps = {
    detailsPath: () => "/",
};

const id = new UUID("274c1273-5d0e-4c81-bce4-a15518affd35");

function buildLogionIdentityMock(): { loc: LocData, locState: ActiveLoc } {
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
    } as unknown as ActiveLoc;
    return { loc, locState };
}

function buildPolkadotIdentityMock(): { loc: LocData, locState: ActiveLoc } {
    const loc = {
        id,
        locType: "Identity",
    } as unknown as LocData;
    const locState = {
        isLogionIdentity: () => false,
    } as unknown as ActiveLoc;
    return { loc, locState };
}

const protectionRequest = {
    isRecovery: false,
} as unknown as ProtectionRequest;

const recoveryRequest = {
    isRecovery: true,
} as unknown as ProtectionRequest;
