import VTPSelectionFrame from "./VTPSelectionFrame";
import { setVerifiedThirdPartySelections } from "../../legal-officer/__mocks__/ClientMock";
import { setLocState } from "../__mocks__/LocContextMock";
import { waitFor, screen, render } from "@testing-library/react";
import { OpenLoc } from "../../__mocks__/LogionClientMock";

jest.mock("../../legal-officer/client");
jest.mock("../LocContext");

describe("VTPSelectionFrame", () => {

    it("renders empty", async () => {
        render(<VTPSelectionFrame/>);
        await waitFor(() => expect(screen.getByText(/No Verified Third Parties/)).toBeInTheDocument());
    });

    it("renders 2 rows", async () => {
        setLocState(new OpenLoc());
        setVerifiedThirdPartySelections([
            {
                firstName: "John",
                lastName: "Doe",
                identityLocId: "123",
                address: "address-123",
                selected: false,
            },
            {
                firstName: "Scott",
                lastName: "Tiger",
                identityLocId: "456",
                address: "address-456",
                selected: true,
            },
        ])
        render(<VTPSelectionFrame/>);
        await waitFor(() => {
            expect(screen.getByText("John")).toBeInTheDocument()
            expect(screen.getByText("Doe")).toBeInTheDocument()
            expect(screen.getByText("Scott")).toBeInTheDocument()
            expect(screen.getByText("Tiger")).toBeInTheDocument()
        });
    });
})
