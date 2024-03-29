import { render, screen } from '@testing-library/react';
import { LocData, ItemStatus, HashString } from "@logion/client";

import { clickByName, expectNoDialogVisible } from '../tests';
import { DEFAULT_LEGAL_OFFICER } from '../common/TestData';
import { setLocItems, setLocState } from './__mocks__/LocContextMock';

import CloseLocButton from './CloseLocButton';
import { OpenLoc } from 'src/__mocks__/LogionClientMock';
import { LocItem, MetadataItem } from './LocItem';
import { FAILED_SUBMISSION, SUCCESSFUL_SUBMISSION, setExtrinsicSubmissionState } from 'src/logion-chain/__mocks__/LogionChainMock';

jest.mock("../logion-chain");
jest.mock("./LocContext");

describe("CloseLocButton", () => {

    beforeEach(() => {
        closeCalled = false;
        closeLocMock = successCloseLocMock;
    });

    it("does not close when not closeable", async () => {
        renderGivenLoc(false, false);

        await clickByName(/Close LOC/);

        await expectNoDialogVisible();
        expect(closeCalled).toBe(false);
    })

    it("closes when closeable", async () => {
        setExtrinsicSubmissionState(SUCCESSFUL_SUBMISSION);
        renderGivenLoc(true, false);

        await clickByName(/Close LOC/);
        await clickByName("Proceed");
        await clickByName("Close");

        await expectNoDialogVisible();
        expect(closeCalled).toBe(true);
    })

    it("does not close on cancel and closeable", async () => {
        renderGivenLoc(true, false);

        await clickByName(/Close LOC/);
        await clickByName("Cancel");

        await expectNoDialogVisible();
        expect(closeCalled).toBe(false);
    })

    it("shows message on error", async () => {
        closeLocMock = failureCloseLocMock;
        setExtrinsicSubmissionState(FAILED_SUBMISSION);
        renderGivenLoc(true, false);

        await clickByName(/Close LOC/);
        await clickByName("Proceed");

        await clickByName("Close");
        await expectNoDialogVisible();
        expect(closeCalled).toBe(true);
    })

    it("enables auto-ack toggle", async () => {
        renderGivenLoc(false, true);

        const ackAllToggle = screen.getByRole("checkbox");

        expect(ackAllToggle).not.toHaveClass("disabled");
    })

    it("disables auto-ack toggle", async () => {
        renderGivenLoc(true, false);

        const ackAllToggle = screen.getByRole("checkbox");

        expect(ackAllToggle).toHaveClass("disabled");
    })
})

function renderGivenLoc(canClose: boolean, canAck: boolean) {
    setLocItems([ metadataItem(canClose ? "ACKNOWLEDGED" : "PUBLISHED") ]);
    const locState = new OpenLoc();
    locState.data = () => ({
        locType: "Transaction",
        status: "OPEN",
    } as LocData);
    locState.legalOfficer.close = closeLocMock;
    locState.legalOfficer.canClose = () => canClose;
    locState.legalOfficer.canAutoAck = () => canAck;
    setLocState(locState);

    render(<CloseLocButton />);
}

function metadataItem(status: ItemStatus): LocItem {
    return new MetadataItem(
        {
            newItem: false,
            status,
            submitter: DEFAULT_LEGAL_OFFICER,
            timestamp: null,
            type: 'Data',
            template: false,
        },
        {
            name: HashString.fromValue("Test"),
            value: HashString.fromValue("Test"),
        }
    );
}

let closeCalled = false;

const successCloseLocMock = async (params: any) => {
    closeCalled = true;
    return params.locState;
};

const failureCloseLocMock = async () => {
    closeCalled = true;
};

let closeLocMock = successCloseLocMock;
