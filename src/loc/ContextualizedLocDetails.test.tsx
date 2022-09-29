import { UUID } from "@logion/node-api/dist/UUID";
import { render, screen, waitFor } from "@testing-library/react";

import { shallowRender } from "../tests";
import { OPEN_IDENTITY_LOC, OPEN_IDENTITY_LOC_ID } from "../__mocks__/@logion/node-api/dist/LogionLocMock";
import ContextualizedLocDetails from "./ContextualizedLocDetails"
import { buildLocRequest } from "./TestData";
import { setLocRequest, setLocId } from "./__mocks__/LocContextMock";
import { setLocation } from "src/__mocks__/ReactRouterMock";
import { setPendingProtectionRequests, setPendingRecoveryRequests } from "src/legal-officer/__mocks__/LegalOfficerContextMock";

jest.mock('../common/CommonContext');
jest.mock('./LocContext');
jest.mock('react-router');
jest.mock('../logion-chain');
jest.mock("../legal-officer/LegalOfficerContext");

describe("ContextualizedLocDetails", () => {

    it("renders empty", () => {
        const tree = shallowRender(<ContextualizedLocDetails />);
        expect(tree).toMatchSnapshot();
    });

    it("renders", () => {
        const uuid = UUID.fromDecimalString(OPEN_IDENTITY_LOC_ID)!;
        setLocId(uuid);
        setLocRequest(buildLocRequest(uuid, OPEN_IDENTITY_LOC));
        const tree = shallowRender(<ContextualizedLocDetails />);
        expect(tree).toMatchSnapshot();
    })

    it("renders with protection request", async () => {
        const uuid = UUID.fromDecimalString(OPEN_IDENTITY_LOC_ID)!;
        setLocId(uuid);
        setLocRequest(buildLocRequest(uuid, OPEN_IDENTITY_LOC));

        const protectionRequestId = "2ffdf4ea-39cd-4086-8628-69bbc329aef8";
        setPendingProtectionRequests([
            {
                id: protectionRequestId,
                userIdentity: {
                    firstName: "John",
                    lastName: "Doe",
                },
                userPostalAddress: {
                    line1: "?"
                }
            }
        ]);
        setLocation({ search: `?protection-request=${protectionRequestId}` });

        render(<ContextualizedLocDetails />);
        
        await waitFor(() => expect(screen.getByText(/currently verifying the identity/)).toBeVisible());
    })

    it("renders with recovery request", async () => {
        const uuid = UUID.fromDecimalString(OPEN_IDENTITY_LOC_ID)!;
        setLocId(uuid);
        setLocRequest(buildLocRequest(uuid, OPEN_IDENTITY_LOC));

        const recoveryRequestId = "2ffdf4ea-39cd-4086-8628-69bbc329aef8";
        setPendingRecoveryRequests([
            {
                id: recoveryRequestId,
                userIdentity: {
                    firstName: "John",
                    lastName: "Doe",
                },
                userPostalAddress: {
                    line1: "?"
                }
            }
        ]);
        setLocation({ search: `?recovery-request=${recoveryRequestId}` });

        render(<ContextualizedLocDetails />);
        
        await waitFor(() => expect(screen.getByText(/currently verifying the identity/)).toBeVisible());
    })
})
