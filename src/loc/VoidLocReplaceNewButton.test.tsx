import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { refreshLocs } from "src/legal-officer/__mocks__/LegalOfficerContextMock";
import { finalizeSubmission } from "src/logion-chain/__mocks__/SignatureMock";
import { clickByName, typeByLabel } from "src/tests";
import VoidLocReplaceNewButton from "./VoidLocReplaceNewButton";
import { voidLoc } from "./__mocks__/LocContextMock";

jest.mock("../common/CommonContext");
jest.mock("../common/Model");
jest.mock("./LocContext");
jest.mock("../legal-officer/LegalOfficerContext");
jest.mock("../logion-chain");
jest.mock("../logion-chain/Signature");

describe("VoidLocReplaceNewButton", () => {

    it("voids LOC and replaces by new", async () => {
        const dialog = await renderAndOpenDialog();

        const button = screen.getAllByRole("button", { name: "Void and replace by a NEW LOC" })[1];
        await typeByLabel("Reason", "Because");
        await typeByLabel("New LOC Description", "Replacing LOC");
        await userEvent.click(button);
        await waitFor(() => screen.getByText("Submitting..."));
        finalizeSubmission();
        await clickByName("OK");
        await waitFor(() => screen.getByText("Submitting..."));
        finalizeSubmission();

        await waitFor(() => expect(dialog!).not.toBeVisible());
        expect(voidLoc).toBeCalled();
        expect(refreshLocs).toBeCalled();
    });

    it("does not void LOC on cancel", async () => {
        const dialog = await renderAndOpenDialog();

        await clickByName("Cancel");

        await waitFor(() => expect(dialog!).not.toBeVisible());
        expect(voidLoc).not.toBeCalled();
        expect(refreshLocs).not.toBeCalled();
    });
})

async function renderAndOpenDialog(): Promise<HTMLElement> {
    render(<VoidLocReplaceNewButton />);
    await clickByName("Void and replace by a NEW LOC");
    let dialog: HTMLElement;
    await waitFor(() => dialog = screen.getByRole("dialog"));
    return dialog!;
}
