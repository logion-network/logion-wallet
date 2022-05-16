import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UUID } from '@logion/node-api/dist/UUID';

import { CLOSED_COLLECTION_LOC, CLOSED_COLLECTION_LOC_ID } from '../__mocks__/@logion/node-api/dist/LogionLocMock';
import { finalizeSubmission, submitting, resetSubmitting } from '../logion-chain/__mocks__/SignatureMock';
import { clickByName } from '../tests';
import ImportItems from './ImportItems';
import { setLoc, setLocId, refresh } from "./__mocks__/LocContextMock";

jest.mock("../common/CommonContext");
jest.mock("@logion/node-api/dist/LogionLoc");
jest.mock("../logion-chain/Signature");
jest.mock("../logion-chain");
jest.mock("./LocContext");

describe("ImportItems", () => {

    beforeEach(() => {
        resetSubmitting();
    });

    it("imports all CSV", async () => {
        await uploadCsv();

        await waitFor(() => screen.getByRole("button", { name: /Import all/ }));
        await clickByName(/Import all/);
        await waitFor(() => expect(submitting()).toBe(true));
        finalizeSubmission();
        await waitFor(() => expect(screen.getByAltText("ok")).toBeVisible());

        await closeAndExpectRefresh();
    });

    it("imports one CSV row", async () => {
        await uploadCsv();

        await waitFor(() => expect(screen.getAllByRole("button", { name: /Import/ }).length).toBe(3));
        const importButton = screen.getAllByRole("button", { name: /Import/ })[1];
        await userEvent.click(importButton);
        await waitFor(() => expect(submitting()).toBe(true));
        finalizeSubmission();
        await waitFor(() => expect(screen.getByText("Submission successful.")).toBeVisible());

        await closeAndExpectRefresh();
    });
});

async function uploadCsv() {
    const uuid = UUID.fromDecimalString(CLOSED_COLLECTION_LOC_ID)!;
    setLocId(uuid);
    setLoc(CLOSED_COLLECTION_LOC);

    render(<ImportItems collectionId={ uuid } />);

    const file = new File(["0x50cc7f74edfff71f51fdbffed12067a16b563bb72cab9240cd72e56234ea5dc0,package.json"], "items.csv");
    await userEvent.upload(screen.getByTestId("FileSelectorButtonHiddenInput"), file, {applyAccept: false});
}

async function closeAndExpectRefresh() {
    await clickByName("Close");
    await waitFor(() => expect(refresh).toBeCalled());
}
