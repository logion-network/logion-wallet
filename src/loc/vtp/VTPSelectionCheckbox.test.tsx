import { render, waitFor, screen } from "@testing-library/react";
import VTPSelectionCheckbox from "./VTPSelectionCheckbox";
import { VerifiedThirdParty } from "@logion/client";
import { clickByName, expectNoDialogVisible } from "../../tests";
import userEvent from "@testing-library/user-event";

jest.mock("../LocContext");

describe("VTPSelectionCheckbox", () => {

    function vtpSelection(selected: boolean): VerifiedThirdParty {
        return {
            firstName: "Scott",
            lastName: "Tiger",
            identityLocId: "123",
            address: "address-123",
            selected,
        }
    }

    it("shows no dialog at startup", () => {
        render(<VTPSelectionCheckbox vtpSelection={ vtpSelection(true) } />)
        expectNoDialogVisible();
    })

    async function openDialogAndConfirm() {
        let checkbox: HTMLElement;
        await waitFor(() => checkbox = screen.getByRole("checkbox"));
        await userEvent.click(checkbox!);
        await clickByName("Confirm")
    }

    it("unselects a previously selected third party", async () => {
        render(<VTPSelectionCheckbox vtpSelection={ vtpSelection(true) } />)
        await openDialogAndConfirm();
        expect(screen.getByText("Verified Third Party Dismissal")).toBeDefined();
    })

    it("selects a previously unselected third party", async () => {
        render(<VTPSelectionCheckbox vtpSelection={ vtpSelection(false) } />)
        await openDialogAndConfirm();
        expect(screen.getByText("Verified Third Party Selection")).toBeDefined();
    })
})
