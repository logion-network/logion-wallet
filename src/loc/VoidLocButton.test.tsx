import { LocData } from "@logion/client";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { clickByName, typeByLabel } from "src/tests";
import VoidLocButton from "./VoidLocButton";
import { mockSubmittableResult } from "src/logion-chain/__mocks__/SignatureMock";
import { OpenLoc } from "src/__mocks__/LogionClientMock";
import { setLocState } from "./__mocks__/LocContextMock";
import {
    NO_SUBMISSION,
    setExtrinsicSubmissionState,
} from "src/logion-chain/__mocks__/LogionChainMock";

jest.mock("../common/CommonContext");
jest.mock("./LocContext");
jest.mock("../legal-officer/LegalOfficerContext");
jest.mock("../logion-chain");
jest.mock("../logion-chain/Signature");

describe("VoidLocButton", () => {

    it("voids LOC then closes dialog", async () => {
        let called = false;
        const voidLocMock = async (params: any) => {
            called = true;
            return params.locState;
        };
        const locState = new OpenLoc();
        locState.data = () => ({
            locType: "Transaction",
            status: "OPEN",
        } as LocData);
        locState.legalOfficer.voidLoc = voidLocMock;
        setLocState(locState);
        setExtrinsicSubmissionState(NO_SUBMISSION);
        await renderAndOpenDialog();

        const button = screen.getAllByRole("button", { name: "Void LOC" })[1];
        await typeByLabel("Reason", "Because");
        await userEvent.click(button);

        expect(called).toBe(true);

        // TODO Check that dialog disappear
        // await waitFor(() => expect(dialog!).not.toBeVisible());
    });

    it("disappears on close", async () => {
        const dialog = await renderAndOpenDialog();

        await clickByName("Close");

        await waitFor(() => expect(dialog!).not.toBeVisible());
    });
})

async function renderAndOpenDialog(): Promise<HTMLElement> {
    render(<VoidLocButton />);
    await clickByName("Void LOC");
    let dialog: HTMLElement;
    await waitFor(() => dialog = screen.getByRole("dialog"));
    return dialog!;
}
