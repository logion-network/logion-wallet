import { LocData } from "@logion/client";
import { UUID } from "@logion/node-api";
import { PATRICK } from "src/common/TestData";

import { shallowRender } from "src/tests"
import { TEST_WALLET_USER } from "src/wallet-user/TestData";
import { CLOSED_IDENTITY_LOC_ID } from "src/__mocks__/LogionMock";
import RequesterOrLegalOfficer from "./RequesterOrLegalOfficer";

describe("RequesterOrLegalOfficer", () => {

    it("renders polkadot requester for LO", () => {
        const element = shallowRender(<RequesterOrLegalOfficer
            loc={ locWithPolkadotRequester }
            viewer="LegalOfficer"
            { ...otherProps }
        />);
        expect(element).toMatchSnapshot();
    })

    it("renders logion requester for LO", () => {
        const element = shallowRender(<RequesterOrLegalOfficer
            loc={ locWithLogionRequester }
            viewer="LegalOfficer"
            { ...otherProps }
        />);
        expect(element).toMatchSnapshot();
    })

    it("renders LO in charge for User", () => {
        const element = shallowRender(<RequesterOrLegalOfficer
            loc={ locWithPolkadotRequester }
            viewer="User"
            legalOfficer={ PATRICK }
            { ...otherProps }
        />);
        expect(element).toMatchSnapshot();
    })
})

const locWithPolkadotRequester = {
    requesterAddress: TEST_WALLET_USER,
    userIdentity: {
        firstName: "John",
        lastName: "Doe",
    },
    closed: false,
} as unknown as LocData;

const locWithLogionRequester = {
    requesterLocId: UUID.fromDecimalStringOrThrow(CLOSED_IDENTITY_LOC_ID),
    userIdentity: {
        firstName: "John",
        lastName: "Doe",
    },
    closed: false,
} as unknown as LocData;

const otherProps = {
    detailsPath: () => "",
};
