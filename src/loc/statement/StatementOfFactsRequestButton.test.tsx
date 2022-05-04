import { render } from "@testing-library/react";
import StatementOfFactsRequestButton from "./StatementOfFactsRequestButton";
import { clickByName } from "../../tests";
import { setRequestSof } from "../__mocks__/LocContextMock";

jest.mock("../LocContext");
jest.mock("../../common/CommonContext");

describe("StatementOfFactsRequestButton", () => {

    it("requests SOF on LOC", async () => {
        const requestSofMock = jest.fn();
        setRequestSof(requestSofMock);
        render(<StatementOfFactsRequestButton />);
        await clickByName("Request a Statement of Facts");
        await clickByName("Submit");
        expect(requestSofMock).toBeCalledWith(undefined);
    })

    it("requests SOF on Collection LOC", async () => {
        const requestSofMock = jest.fn();
        setRequestSof(requestSofMock);
        const itemId = "ITEM_ABC";
        render(<StatementOfFactsRequestButton itemId={ itemId } />);
        await clickByName("Request a Statement of Facts");
        await clickByName("Submit");
        expect(requestSofMock).toBeCalledWith(itemId);
    })
})
