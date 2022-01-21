import { render, screen, waitFor } from '@testing-library/react';

import { clickByName } from '../tests';
import { DEFAULT_LEGAL_OFFICER } from '../common/TestData';
import { finalizeSubmission, failSubmission } from '../logion-chain/__mocks__/SignatureMock';
import { closeExtrinsicSent, resetCloseExtrinsicSent, setClose, setLocItems } from './__mocks__/LocContextMock';

import CloseLocButton from './CloseLocButton';

jest.mock("./LocContext");
jest.mock("../common/CommonContext");
jest.mock("../logion-chain/Signature");

describe("CloseLocButton", () => {

    it("does not close with draft items", async () => {
        setLocItems([
            {
                name: "Test",
                newItem: false,
                status: 'DRAFT',
                submitter: DEFAULT_LEGAL_OFFICER,
                timestamp: null,
                type: 'Data',
                value: "Test"
            }
        ]);

        render(<CloseLocButton/>);
        await clickByName("Close LOC");

        await expectNoDialogVisible();
    })

    it("closes with all items published", async () => {
        setLocItems([
            {
                name: "Test",
                newItem: false,
                status: 'PUBLISHED',
                submitter: DEFAULT_LEGAL_OFFICER,
                timestamp: null,
                type: 'Data',
                value: "Test"
            }
        ]);

        const closeMock = jest.fn();
        setClose(closeMock);

        render(<CloseLocButton/>);
        await clickByName("Close LOC");
        await clickByName("Proceed");
        finalizeSubmission();

        await waitFor(() => expect(closeExtrinsicSent()).toBe(true));
        await waitFor(() => expect(closeMock).toBeCalled());
        await expectNoDialogVisible();
    })

    it("does not close on cancel", async () => {
        setLocItems([
            {
                name: "Test",
                newItem: false,
                status: 'PUBLISHED',
                submitter: DEFAULT_LEGAL_OFFICER,
                timestamp: null,
                type: 'Data',
                value: "Test"
            }
        ]);
        const closeMock = jest.fn();
        setClose(closeMock);
        resetCloseExtrinsicSent();

        render(<CloseLocButton/>);
        await clickByName("Close LOC");
        await clickByName("Cancel");

        await waitFor(() => expect(closeExtrinsicSent()).toBe(false));
        await waitFor(() => expect(closeMock).not.toBeCalled());
        await expectNoDialogVisible();
    })

    it("shows message on error", async () => {
        setLocItems([
            {
                name: "Test",
                newItem: false,
                status: 'PUBLISHED',
                submitter: DEFAULT_LEGAL_OFFICER,
                timestamp: null,
                type: 'Data',
                value: "Test"
            }
        ]);
        const closeMock = jest.fn();
        setClose(closeMock);

        render(<CloseLocButton/>);
        await clickByName("Close LOC");
        await clickByName("Proceed");
        failSubmission();

        await waitFor(() => expect(closeExtrinsicSent()).toBe(false));
        await waitFor(() => expect(closeMock).not.toBeCalled());

        await clickByName("OK");
        await expectNoDialogVisible();
    })
})

async function expectNoDialogVisible() {
    const dialogs = screen.queryAllByRole("dialog");
    await waitFor(() => expect(dialogs.length).toBe(0));
}
