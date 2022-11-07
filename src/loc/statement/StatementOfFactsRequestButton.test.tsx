import { render } from "@testing-library/react";
import StatementOfFactsRequestButton from "./StatementOfFactsRequestButton";
import { clickByName } from "../../tests";
import { ClosedCollectionLoc, OpenLoc } from "src/__mocks__/LogionClientMock";
import { setLocState } from "../__mocks__/UserLocContextMock";

jest.mock("../UserLocContext");
jest.mock("../../common/CommonContext");

describe("StatementOfFactsRequestButton", () => {

    it("requests SOF on LOC", async () => {
        const locState = new OpenLoc();
        locState.requestSof = jest.fn().mockResolvedValue(locState);
        locState.locsState = () => {};
        setLocState(locState);
        render(<StatementOfFactsRequestButton />);
        await clickByName("Request a Statement of Facts");
        await clickByName("Confirm");
        expect(locState.requestSof).toBeCalled();
        await clickByName("Close");
    })

    it("requests SOF on Collection LOC", async () => {
        const locState = new ClosedCollectionLoc();
        locState.requestSof = jest.fn().mockResolvedValue(locState);
        locState.locsState = () => {};
        setLocState(locState);
        const itemId = "ITEM_ABC";
        render(<StatementOfFactsRequestButton itemId={ itemId } />);
        await clickByName("Request a Statement of Facts");
        await clickByName("Confirm");
        expect(locState.requestSof).toBeCalledWith(expect.objectContaining({ itemId }));
        await clickByName("Close");
    })
})
