import { Fees } from "@logion/node-api";
import { render, waitFor, screen } from "@testing-library/react";
import { mockSubmittableResult } from "src/logion-chain/__mocks__/SignatureMock";
import { clickByName } from "../tests";
import LocPublishButton from "./LocPublishButton";
import { LocItem } from "./LocItem";
import { mockValidPolkadotAccountId } from "src/__mocks__/@logion/node-api/Mocks";

jest.mock("./LocContext");
jest.unmock("@logion/client");
jest.unmock("@logion/node-api");

describe("LocPublishButton", () => {

    it("publishes to chain", async () => {
        // Given item to publish
        const locItem: LocItem = {
            name: "data-name",
            type: "Data",
            status: "DRAFT",
            submitter: mockValidPolkadotAccountId("data-submitter"),
            value: "data-value",
            nature: "data-nature",
            timestamp: null,
            newItem: false,
            template: false,
        };
        const confirm = jest.fn();
        render(<LocPublishButton
            itemType="Public Data"
            locItem={ locItem }
            publishMutator={ async (current, callback) => {
                callback(mockSubmittableResult(true));
                confirm();
                return current;
            }}
            feesEstimator={ async () => new Fees(42n) }
        />);

        // When publishing
        await clickByName(content => /publish/i.test(content));
        const dialog = screen.getByRole("dialog");
        await waitFor(() => screen.getByText("Estimated fees (LGNT)"));
        await waitFor(() => screen.getByRole("button", { name: "Publish" }));
        await clickByName("Publish");

        // Then item published
        await waitFor(() => screen.getByText(/successful/i));
        expect(confirm).toBeCalled();

        // Then dialog closable with OK
        await clickByName("OK");
        expect(dialog).not.toBeInTheDocument();
    });
});
