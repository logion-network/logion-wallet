import { render, waitFor, screen } from "@testing-library/react";
import { mockSubmittableResult } from "src/logion-chain/__mocks__/SignatureMock";

import { clickByName } from "../tests";
import LocPublishButton from "./LocPublishButton";

import { LocItem } from "./types";

jest.mock("./LocContext");

describe("LocPublishButton", () => {

    it("publishes to chain", async () => {
        // Given item to publish
        const locItem: LocItem = {
            name: "data-name",
            type: "Data",
            status: "DRAFT",
            submitter: "data-submitter",
            value: "data-value",
            nature: "data-nature",
            timestamp: null,
            newItem: false,
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
        />);

        // When publishing
        await clickByName(content => /publish/i.test(content));
        const dialog = screen.getByRole("dialog");
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
