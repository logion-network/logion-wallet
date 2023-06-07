import { act, render, screen, waitFor } from "@testing-library/react";
import { LegalOfficerData } from "@logion/node-api";
import { PalletLoAuthorityListLegalOfficerData } from "@polkadot/types/lookup";

import { setOnchainSettings, refreshOnchainSettings } from "src/legal-officer/__mocks__/LegalOfficerContextMock";
import { DEFAULT_LEGAL_OFFICER_ACCOUNT, setCurrentAddress } from "src/logion-chain/__mocks__/LogionChainMock";
import { finalizeSubmission } from "src/logion-chain/__mocks__/SignatureMock";
import { clickByName, typeByLabel } from "src/tests";

import ChainData from "./ChainData";
import { setupApiMock } from "src/__mocks__/LogionMock";
import { SubmittableExtrinsic } from "@polkadot/api-base/types";
import { It, Mock } from "moq.ts";

jest.mock("src/legal-officer/LegalOfficerContext");
jest.mock("src/logion-chain");
jest.mock("src/logion-chain/Signature");

describe("ChainData", () => {

    it("renders", async () => {
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);
        const settings: LegalOfficerData = {
            isHost: true,
            hostData: {
                nodeId: "12D3KooWBmAwcd4PJNJvfV89HwE48nwkRmAgo8Vy3uQEyNNHBox2",
                baseUrl: "https://node.logion.network",
            }
        };
        setOnchainSettings(settings);
        setupApiMock(api => {
            api.setup(instance => instance.queries.getAvailableRegions()).returns([ "Europe" ]);
            api.setup(instance => instance.queries.getDefaultRegion()).returns("Europe");
        });

        render(<ChainData/>);

        await waitFor(() => expect(screen.getByLabelText("Node Base URL")).toHaveValue(settings.hostData?.baseUrl));
        expect(screen.getByLabelText("Node ID")).toHaveValue(settings.hostData?.nodeId);
    });

    it("saves successfully", async () => {
        setCurrentAddress(DEFAULT_LEGAL_OFFICER_ACCOUNT);

        const settings: LegalOfficerData = {
            isHost: true,
            hostData: {
                nodeId: "12D3KooWBmAwcd4PJNJvfV89HwE48nwkRmAgo8Vy3uQEyNNHBox2",
                baseUrl: "https://node.logion.network",
                region: "Europe",
            }
        };
        setOnchainSettings(settings);
        setupApiMock(api => {
            api.setup(instance => instance.queries.getAvailableRegions()).returns([ "Europe" ]);
            api.setup(instance => instance.queries.getDefaultRegion()).returns("Europe");

            const data = new Mock<PalletLoAuthorityListLegalOfficerData>();
            api.setup(instance => instance.adapters.toPalletLoAuthorityListLegalOfficerDataHost(It.IsAny())).returns(data.object());
            const submittable = new Mock<SubmittableExtrinsic<"promise">>();
            api.setup(instance => instance.polkadot.tx.loAuthorityList.updateLegalOfficer(It.IsAny(), It.IsAny())).returns(submittable.object());
        });
        render(<ChainData/>);
        await waitFor(() => expect(screen.getByLabelText("Node Base URL")).toHaveValue(settings.hostData?.baseUrl));

        await typeByLabel("Node Base URL", "https://another-node.logion.network");
        await act(() => clickByName("Publish to blockchain"));
        act(() => finalizeSubmission());

        expect(refreshOnchainSettings).toBeCalled();
    })
});
