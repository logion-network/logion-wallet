import { render, waitFor, screen } from "@testing-library/react";
import IssuerSelectionCheckbox from "./IssuerSelectionCheckbox";
import { clickByName, expectNoDialogVisible } from "../../tests";
import userEvent from "@testing-library/user-event";
import { VerifiedIssuerWithSelect } from "../../legal-officer/client";

jest.mock("../LocContext");

describe("IssuerSelectionCheckbox", () => {

    function issuerSelection(selected: boolean): VerifiedIssuerWithSelect {
        return {
            firstName: "Scott",
            lastName: "Tiger",
            identityLocId: "123",
            address: "address-123",
            selected,
        }
    }

    it("shows no dialog at startup", () => {
        render(<IssuerSelectionCheckbox issuerSelection={ issuerSelection(true) } />)
        expectNoDialogVisible();
    })

    async function openDialogAndConfirm() {
        let checkbox: HTMLElement;
        await waitFor(() => checkbox = screen.getByRole("checkbox"));
        await userEvent.click(checkbox!);
        await clickByName("Confirm")
    }

    it("unselects a previously selected issuer", async () => {
        render(<IssuerSelectionCheckbox issuerSelection={ issuerSelection(true) } />)
        await openDialogAndConfirm();
        expect(screen.getByText("Verified Issuer Dismissal")).toBeDefined();
    })

    it("selects a previously unselected issuer", async () => {
        render(<IssuerSelectionCheckbox issuerSelection={ issuerSelection(false) } />)
        await openDialogAndConfirm();
        expect(screen.getByText("Verified Issuer Selection")).toBeDefined();
    })
})
