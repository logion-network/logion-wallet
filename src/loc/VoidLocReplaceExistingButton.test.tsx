import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { refreshLocs } from "src/legal-officer/__mocks__/LegalOfficerContextMock";
import { finalizeSubmission } from "src/logion-chain/__mocks__/SignatureMock";
import { clickByName, typeByLabel } from "src/tests";
import { OPEN_IDENTITY_LOC_ID } from "src/__mocks__/@logion/node-api/dist/LogionLocMock";
import VoidLocReplaceExistingButton from "./VoidLocReplaceExistingButton";
import { voidLoc } from "./__mocks__/LocContextMock";

jest.mock("../common/CommonContext");
jest.mock("./LocContext");
jest.mock("../legal-officer/LegalOfficerContext");
jest.mock("../logion-chain");
jest.mock("../logion-chain/Signature");

describe("VoidLocReplaceExistingButton", () => {

    it("voids LOC and replaces by existing", async () => {
        const dialog = await renderAndOpenDialog();

        const button = screen.getAllByRole("button", { name: "Void and replace by an EXISTING LOC" })[1];
        await typeByLabel("Reason", "Because");
        await typeByLabel("Existing LOC ID", OPEN_IDENTITY_LOC_ID);
        await userEvent.click(button);
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
    render(<VoidLocReplaceExistingButton />);
    await clickByName("Void and replace by an EXISTING LOC");
    let dialog: HTMLElement;
    await waitFor(() => dialog = screen.getByRole("dialog"));
    return dialog!;
}
