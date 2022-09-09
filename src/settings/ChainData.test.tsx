import { act, render, screen, waitFor } from "@testing-library/react";
import { LegalOfficerData } from "src/legal-officer/LegalOfficerData";

import { setOnchainSettings } from "src/legal-officer/__mocks__/LegalOfficerContextMock";
import { DEFAULT_LEGAL_OFFICER_ACCOUNT, setCurrentAddress } from "src/logion-chain/__mocks__/LogionChainMock";
import { finalizeSubmission } from "src/logion-chain/__mocks__/SignatureMock";
import { clickByName, typeByLabel } from "src/tests";

import ChainData from "./ChainData";

jest.mock("src/legal-officer/LegalOfficerContext");
jest.mock("src/logion-chain");
jest.mock("src/logion-chain/Signature");

describe("ChainData", () => {

    it("renders", async () => {
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
        const settings: LegalOfficerData = {
            nodeId: "12D3KooWBmAwcd4PJNJvfV89HwE48nwkRmAgo8Vy3uQEyNNHBox2",
            baseUrl: "https://node.logion.network"
        };
        setOnchainSettings(settings);

        render(<ChainData/>);

        await waitFor(() => expect(screen.getByLabelText("Node Base URL")).toHaveValue(settings.baseUrl));
        expect(screen.getByLabelText("Node ID")).toHaveValue(settings.nodeId);
    });

    it("saves successfully", async () => {
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);

        const settings: LegalOfficerData = {
            nodeId: "12D3KooWBmAwcd4PJNJvfV89HwE48nwkRmAgo8Vy3uQEyNNHBox2",
            baseUrl: "https://node.logion.network"
        };
        setOnchainSettings(settings);
        render(<ChainData/>);
        await waitFor(() => expect(screen.getByLabelText("Node Base URL")).toHaveValue(settings.baseUrl));

        await typeByLabel("Node Base URL", "https://another-node.logion.network");
        await act(() => clickByName("Publish to blockchain"));
        act(() => finalizeSubmission());

        await waitFor(() => expect(screen.getByText("Submission successful.")).toBeVisible());
        expect(screen.getByRole("button", {name: "Publish to blockchain"})).not.toBeDisabled();
    })
});
