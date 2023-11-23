import { LocData } from "@logion/client";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { clickByName, typeByLabel } from "src/tests";
import VoidLocReplaceExistingButton from "./VoidLocReplaceExistingButton";
import { expectSubmitting, setupQueriesGetLegalOfficerCase } from "src/test/Util";
import { UUID } from "@logion/node-api";
import { setupApiMock, OPEN_IDENTITY_LOC, OPEN_IDENTITY_LOC_ID } from "src/__mocks__/LogionMock";
import { mockSubmittableResult } from "src/logion-chain/__mocks__/SignatureMock";
import { OpenLoc } from "src/__mocks__/LogionClientMock";
import { setLocState } from "./__mocks__/LocContextMock";
import { SUCCESSFUL_SUBMISSION, setExtrinsicSubmissionState } from "src/logion-chain/__mocks__/LogionChainMock";

jest.mock("../common/CommonContext");
jest.mock("./LocContext");
jest.mock("../legal-officer/LegalOfficerContext");
jest.mock("../logion-chain");
jest.mock("../logion-chain/Signature");

describe("VoidLocReplaceExistingButton", () => {

    it("voids LOC and replaces by existing", async () => {
        let called = false;
        const voidLocMock = async (params: any) => {
            called = true;
            params.callback(mockSubmittableResult(true));
            return params.locState;
        };
        const locState = new OpenLoc();
        locState.data = () => ({
            locType: "Identity",
            status: "OPEN",
        } as LocData);
        locState.legalOfficer.voidLoc = voidLocMock;
        setLocState(locState);
        setupApiMock(api => {
            setupQueriesGetLegalOfficerCase(api, UUID.fromDecimalStringOrThrow(OPEN_IDENTITY_LOC_ID), OPEN_IDENTITY_LOC);
        });
        await renderAndOpenDialog();

        const button = screen.getAllByRole("button", { name: "Void and replace by an EXISTING LOC" })[1];
        await typeByLabel("Reason", "Because");
        await typeByLabel("Existing LOC ID", OPEN_IDENTITY_LOC_ID);
        await userEvent.click(button);

        await waitFor(() => expectSubmitting());
        await waitFor(() => expect(called).toBe(true));
    });

    it("closes dialog on success", async () => {
        let called = false;
        const voidLocMock = async (params: any) => {
            called = true;
            params.callback(mockSubmittableResult(true));
            return params.locState;
        };
        const locState = new OpenLoc();
        locState.data = () => ({
            locType: "Identity",
            status: "OPEN",
        } as LocData);
        locState.legalOfficer.voidLoc = voidLocMock;
        setLocState(locState);
        setupApiMock(api => {
            setupQueriesGetLegalOfficerCase(api, UUID.fromDecimalStringOrThrow(OPEN_IDENTITY_LOC_ID), OPEN_IDENTITY_LOC);
        });
        setExtrinsicSubmissionState(SUCCESSFUL_SUBMISSION);
        const dialog = await renderAndOpenDialog();

        const button = screen.getAllByRole("button", { name: "Void and replace by an EXISTING LOC" })[1];
        await typeByLabel("Reason", "Because");
        await typeByLabel("Existing LOC ID", OPEN_IDENTITY_LOC_ID);
        await userEvent.click(button);

        await waitFor(() => expect(dialog).not.toBeVisible());
    });

    it("disappears on cancel", async () => {
        const dialog = await renderAndOpenDialog();

        await clickByName("Cancel");

        await waitFor(() => expect(dialog!).not.toBeVisible());
    });
})

async function renderAndOpenDialog(): Promise<HTMLElement> {
    render(<VoidLocReplaceExistingButton />);
    await clickByName("Void and replace by an EXISTING LOC");
    let dialog: HTMLElement;
    await waitFor(() => dialog = screen.getByRole("dialog"));
    return dialog!;
}
