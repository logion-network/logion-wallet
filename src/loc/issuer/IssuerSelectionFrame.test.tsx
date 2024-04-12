import IssuerSelectionFrame from "./IssuerSelectionFrame";
import { setLocState } from "../__mocks__/LocContextMock";
import { waitFor, screen, render } from "@testing-library/react";
import { OpenLoc, setVerifiedIssuers } from "../../__mocks__/LogionClientMock";
import { TEST_WALLET_USER, TEST_WALLET_USER2 } from "src/wallet-user/TestData";

jest.mock("../LocContext");

describe("IssuerSelectionFrame", () => {

    it("renders empty", async () => {
        render(<IssuerSelectionFrame/>);
        await waitFor(() => expect(screen.getByText(/No Verified Issuers/)).toBeInTheDocument());
    });

    it("renders 2 rows", async () => {
        const openLoc = new OpenLoc();
        setVerifiedIssuers([
            {
                firstName: "John",
                lastName: "Doe",
                identityLocId: "123",
                account: TEST_WALLET_USER,
                selected: false,
            },
            {
                firstName: "Scott",
                lastName: "Tiger",
                identityLocId: "456",
                account: TEST_WALLET_USER2,
                selected: true,
            },
        ]);
        setLocState(openLoc);

        render(<IssuerSelectionFrame/>);
        await waitFor(() => {
            expect(screen.getByText("John")).toBeInTheDocument()
            expect(screen.getByText("Doe")).toBeInTheDocument()
            expect(screen.getByText("Scott")).toBeInTheDocument()
            expect(screen.getByText("Tiger")).toBeInTheDocument()
        });
    });
})
