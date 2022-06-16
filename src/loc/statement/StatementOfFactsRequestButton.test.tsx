import { render } from "@testing-library/react";
import StatementOfFactsRequestButton from "./StatementOfFactsRequestButton";
import { clickByName } from "../../tests";
import { setRequestSof, setRequestSofOnCollection } from "../__mocks__/UserLocContextMock";

jest.mock("../UserLocContext");
jest.mock("../../common/CommonContext");

describe("StatementOfFactsRequestButton", () => {

    it("requests SOF on LOC", async () => {
        const requestSofMock = jest.fn();
        setRequestSof(requestSofMock);
        render(<StatementOfFactsRequestButton />);
        await clickByName("Request a Statement of Facts");
        await clickByName("Confirm");
        expect(requestSofMock).toBeCalled();
        await clickByName("Close");
    })

    it("requests SOF on Collection LOC", async () => {
        const requestSofOnCollectionMock = jest.fn();
        setRequestSofOnCollection(requestSofOnCollectionMock);
        const itemId = "ITEM_ABC";
        render(<StatementOfFactsRequestButton itemId={ itemId } />);
        await clickByName("Request a Statement of Facts");
        await clickByName("Confirm");
        expect(requestSofOnCollectionMock).toBeCalledWith(itemId);
        await clickByName("Close");
    })
})
