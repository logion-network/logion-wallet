import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setVoidLocMock } from "src/legal-officer/__mocks__/ClientMock";

import { mockSubmittableResult } from "src/logion-chain/__mocks__/SignatureMock";
import { clickByName, typeByLabel } from "src/tests";
import VoidLocButton from "./VoidLocButton";

jest.mock("../common/CommonContext");
jest.mock("./LocContext");
jest.mock("../legal-officer/LegalOfficerContext");
jest.mock("../legal-officer/client");
jest.mock("../logion-chain");
jest.mock("../logion-chain/Signature");

describe("VoidLocButton", () => {

    it("voids LOC", async () => {
        let called = false;
        const voidLocMock = async (params: any) => {
            called = true;
            params.callback(mockSubmittableResult(true));
            return params.locState;
        };
        setVoidLocMock(voidLocMock);
        const dialog = await renderAndOpenDialog();

        const button = screen.getAllByRole("button", { name: "Void LOC" })[1];
        await typeByLabel("Reason", "Because");
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
    render(<VoidLocButton />);
    await clickByName("Void LOC");
    let dialog: HTMLElement;
    await waitFor(() => dialog = screen.getByRole("dialog"));
    return dialog!;
}
