import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { clickByName } from '../tests';
import ImportItems from './ImportItems';
import { setLocState, refresh } from "./__mocks__/UserLocContextMock";
import { CollectionItem } from "@logion/node-api/dist/Types";
import { AddCollectionItemParams } from "@logion/client/dist/LocClient";
import { mockSubmittableResult } from "../logion-chain/__mocks__/SignatureMock";

jest.mock("../common/CommonContext");
jest.mock("@logion/node-api/dist/LogionLoc");
jest.mock("@logion/client");
jest.mock("../logion-chain/Signature");
jest.mock("../logion-chain");
jest.mock("./UserLocContext");

describe("ImportItems", () => {

    // TODO Fix and re-enable test
    xit("imports all CSV", async () => {
        const collection = await uploadCsv();

        await waitFor(() => screen.getByRole("button", { name: /Import all/ }));
        await clickByName(/Import all/);
        await waitFor(() => expect(collection.addCollectionItem).toBeCalled());

        await waitFor(() => expect(screen.getByAltText("ok")).toBeVisible());

        await closeAndExpectRefresh();
    });

    it("imports one CSV row", async () => {
        const collection = await uploadCsv();

        await waitFor(() => expect(screen.getAllByRole("button", { name: /Import/ }).length).toBe(3));
        const importButton = screen.getAllByRole("button", { name: /Import/ })[1];
        await userEvent.click(importButton);
        await waitFor(() => expect(collection.addCollectionItem).toBeCalled());

        await waitFor(() => expect(screen.getByText("Submission successful.")).toBeVisible());

        await closeAndExpectRefresh();
    });
});

async function uploadCsv(): Promise<any> {
    const collection = {
        addCollectionItem: jest.fn((params: AddCollectionItemParams) => {
            params.callback!(mockSubmittableResult(true, "finalized"))
        }),
        getCollectionItem(parameters: { itemId: string }): Promise<CollectionItem | undefined> {
            return Promise.resolve(undefined);
        }
    };
    setLocState(collection);

    render(<ImportItems />);

    const file = new File(["0x50cc7f74edfff71f51fdbffed12067a16b563bb72cab9240cd72e56234ea5dc0,package.json"], "items.csv");
    await userEvent.upload(screen.getByTestId("FileSelectorButtonHiddenInput"), file, {applyAccept: false});
    return collection;
}

async function closeAndExpectRefresh() {
    await clickByName("Close");
    await waitFor(() => expect(refresh).toBeCalled());
}
