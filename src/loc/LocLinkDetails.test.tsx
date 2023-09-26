import { shallowRender } from "../tests";
import { TEST_WALLET_USER } from "../wallet-user/TestData";
import LocLinkDetails from "./LocLinkDetails";
import { LinkItem } from "./LocItem";
import { ItemStatus, LocData } from "@logion/client";
import { render, screen, waitFor } from '@testing-library/react';
import { UUID } from "@logion/node-api";

describe("LocLinkDetails", () => {

    function createItem(status: ItemStatus, rejectReason?: string): LinkItem {
        const linkedLocId = new UUID("20de6861-6236-4ae4-9796-5a60b5d0c43d");
        return new LinkItem(
            {
                timestamp: null,
                type: "Data",
                submitter: TEST_WALLET_USER,
                status,
                rejectReason,
                newItem: false,
                template: false,
            },
            {
                linkedLoc: {
                    id: linkedLocId
                } as LocData,
                linkDetailsPath: `https://path.to/${ linkedLocId.toString() }`,
                nature: "Some nature"
            }
        )
    }

    it("renders", () => {
        const item = createItem("DRAFT");
        const element = shallowRender(<LocLinkDetails item={ item } />);
        expect(element).toMatchSnapshot();
    });

    it("shows correct title when not published", async () => {
        const item = createItem("REVIEW_ACCEPTED");
        render(<LocLinkDetails item={ item } />);
        await waitFor(() => expect(screen.getByText("Data to be published")).toBeVisible());
    });

    it("shows correct title when published", async () => {
        const item = createItem("ACKNOWLEDGED");
        render(<LocLinkDetails item={ item } />);
        await waitFor(() => expect(screen.getByText("Published data")).toBeVisible());
    });

    it("shows reason when rejected", async () => {
        const rejectReason = "Some reject reason";
        const item = createItem("REVIEW_REJECTED", rejectReason);
        render(<LocLinkDetails item={ item } />);
        await waitFor(() => expect(screen.getByText(rejectReason)).toBeVisible());
    });
});
