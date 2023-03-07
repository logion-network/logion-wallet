import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ViewQrCodeButton from "./ViewQrCodeButton";

describe("ViewQrCodeButton", () => {

    it("shows QR code on click", async () => {
        render(<ViewQrCodeButton certificateUrl="https://certificate.logion.network/public/certificate/134441747622015457578768231713467035151" />);
        const button = screen.getByRole("button");
        await userEvent.click(button);
        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeVisible();
    });
});
