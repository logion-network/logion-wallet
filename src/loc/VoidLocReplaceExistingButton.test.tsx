import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setVoidLocMock } from "src/legal-officer/__mocks__/ClientMock";

import { mockSubmittableResult } from "src/logion-chain/__mocks__/SignatureMock";
import { clickByName, typeByLabel } from "src/tests";
import { OPEN_IDENTITY_LOC, OPEN_IDENTITY_LOC_ID } from "src/__mocks__/@logion/node-api/dist/LogionLocMock";
import VoidLocReplaceExistingButton from "./VoidLocReplaceExistingButton";
import { setupQueriesGetLegalOfficerCase } from "src/test/Util";
import { UUID } from "@logion/node-api";
import { setupApiMock } from "src/__mocks__/LogionMock";

jest.mock("../common/CommonContext");
jest.mock("./LocContext");
jest.mock("../legal-officer/LegalOfficerContext");
jest.mock("../legal-officer/client");
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
        setVoidLocMock(voidLocMock);
        setupApiMock(api => {
            setupQueriesGetLegalOfficerCase(api, UUID.fromDecimalStringOrThrow(OPEN_IDENTITY_LOC_ID), OPEN_IDENTITY_LOC);
        });
        const dialog = await renderAndOpenDialog();

        const button = screen.getAllByRole("button", { name: "Void and replace by an EXISTING LOC" })[1];
        await typeByLabel("Reason", "Because");
        await typeByLabel("Existing LOC ID", OPEN_IDENTITY_LOC_ID);
        await userEvent.click(button);

        await waitFor(() => expect(dialog!).not.toBeVisible());
        expect(called).toBe(true);
    });

    it("does not void LOC on cancel", async () => {
        let called = false;
        const voidLocMock = async (params: any) => {
            called = true;
            return params.locState;
        };
        setVoidLocMock(voidLocMock);
        const dialog = await renderAndOpenDialog();

        await clickByName("Cancel");

        await waitFor(() => expect(dialog!).not.toBeVisible());
        expect(called).toBe(false);
    });
})

async function renderAndOpenDialog(): Promise<HTMLElement> {
    render(<VoidLocReplaceExistingButton />);
    await clickByName("Void and replace by an EXISTING LOC");
    let dialog: HTMLElement;
    await waitFor(() => dialog = screen.getByRole("dialog"));
    return dialog!;
}
