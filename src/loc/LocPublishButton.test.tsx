import { render, waitFor, screen } from "@testing-library/react";
import { mockSubmittableResult } from "src/logion-chain/__mocks__/SignatureMock";

import { SignAndSubmit } from "../ExtrinsicSubmitter";
import { SignedTransaction } from "../logion-chain/Signature";
import { clickByName } from "../tests";
import { setIsSuccessful } from "../__mocks__/LogionClientMock";
import LocPublishButton from "./LocPublishButton";

import { LocItem } from "./types";

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
        let setResultCallback: React.Dispatch<React.SetStateAction<SignedTransaction | null>>;
        const signAndSubmit: SignAndSubmit = setResult => { setResultCallback = setResult };
        const signAndSubmitFactory: ((item: LocItem) => SignAndSubmit) | null = () => signAndSubmit;
        render(<LocPublishButton
            itemType="Public Data"
            locItem={ locItem }
            confirm={ confirm }
            signAndSubmitFactory={ signAndSubmitFactory }
        />);

        // When publishing
        await clickByName(content => /publish/i.test(content));
        const dialog = screen.getByRole("dialog");
        await waitFor(() => screen.getByRole("button", { name: "Publish" }));
        await clickByName("Publish");

        // Then item published
        setResultCallback!(mockSubmittableResult(true));
        await waitFor(() => screen.getByText(/successful/i));
        expect(confirm).toBeCalled();

        // Then dialog closable with OK
        await clickByName("OK");
        expect(dialog).not.toBeInTheDocument();
    });
});
