import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";

export async function fillInForm() {
    await userEvent.type(screen.getByTestId("firstName"), 'John');
    await userEvent.type(screen.getByTestId("lastName"), 'Doe')
    await userEvent.type(screen.getByTestId("email"), 'john.doe@logion.network')
    await userEvent.type(screen.getByTestId("phoneNumber"), '+1234')

    await userEvent.type(screen.getByTestId("line1"), 'Place de le République Française, 10')
    await userEvent.type(screen.getByTestId("line2"), 'boite 15')
    await userEvent.type(screen.getByTestId("postalCode"), '4000')
    await userEvent.type(screen.getByTestId("city"), 'Liège')
    await userEvent.type(screen.getByTestId("country"), 'Belgium')

    const checkBoxes = screen.getAllByRole('checkbox');
    const iAgreeCheckbox = checkBoxes[checkBoxes.length - 1];
    await userEvent.click(iAgreeCheckbox);
}
