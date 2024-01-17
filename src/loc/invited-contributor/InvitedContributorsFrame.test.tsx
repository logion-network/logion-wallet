import { setLocState } from "../__mocks__/LocContextMock";
import { waitFor, screen, render } from "@testing-library/react";
import { OpenLoc } from "../../__mocks__/LogionClientMock";
import InvitedContributorsFrame from "./InvitedContributorsFrame";
import { mockValidAccountId } from "../../__mocks__/LogionMock";
import { ValidAccountId } from "@logion/node-api";

jest.mock("../LocContext");

describe("InvitedContributorsFrame", () => {

    function setupInvitedContributors(invitedContributors: ValidAccountId[]) {
        const openLoc = new OpenLoc();
        openLoc.data = () => ({
            invitedContributors,
        });
        setLocState(openLoc);
    }

    it("renders empty", async () => {
        setupInvitedContributors([]);
        render(<InvitedContributorsFrame/>);
        await waitFor(() => expect(screen.getByText(/There are no invited contributors/)).toBeInTheDocument());
    });

    it("renders 2 rows", async () => {
        const invitedContributors = [
            mockValidAccountId("5EnzoqHHGgQ9CEsZtWGYEAf6fdhW9tctgkGctbDEcKN8JCbV", "Polkadot"),
            mockValidAccountId("5FEiK5Kwu3cCiTuy4sv4k3rEdPc7dt1KHyLbGAHNnYgXkqps", "Polkadot")
        ];
        setupInvitedContributors(invitedContributors);
        render(<InvitedContributorsFrame/>);
        await waitFor(() => {
            expect(screen.getByText(invitedContributors[0].address)).toBeInTheDocument()
            expect(screen.getByText(invitedContributors[1].address)).toBeInTheDocument()
        });
    });
})
