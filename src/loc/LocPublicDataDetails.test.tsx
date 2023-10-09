import { HashString } from "@logion/client";
import { shallowRender } from "../tests";
import { TEST_WALLET_USER } from "../wallet-user/TestData";
import LocPublicDataDetails from "./LocPublicDataDetails";
import { MetadataItem } from "./LocItem";
import { ItemStatus } from "@logion/client";
import { render, screen, waitFor } from '@testing-library/react';

describe("LocPublicDataDetails", () => {

    function createItem(status: ItemStatus, rejectReason?: string): MetadataItem {
        return new MetadataItem(
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
                name: HashString.fromValue("Data name"),
                value: HashString.fromValue("Data value"),
            }
        )
    }

    it("renders", () => {
        const item = createItem("DRAFT");
        const element = shallowRender(<LocPublicDataDetails item={ item } />);
        expect(element).toMatchSnapshot();
    });

    it("shows correct title when not published", async () => {
        const item = createItem("REVIEW_ACCEPTED");
        render(<LocPublicDataDetails item={ item } />);
        await waitFor(() => expect(screen.getByText("Data to be published")).toBeVisible());
    });

    it("shows correct title when published", async () => {
        const item = createItem("ACKNOWLEDGED");
        render(<LocPublicDataDetails item={ item } />);
        await waitFor(() => expect(screen.getByText("Published data")).toBeVisible());
    });

    it("shows reason when rejected", async () => {
        const rejectReason = "Some reject reason";
        const item = createItem("REVIEW_REJECTED", rejectReason);
        render(<LocPublicDataDetails item={ item } />);
        await waitFor(() => expect(screen.getByText(rejectReason)).toBeVisible());
    });
});
