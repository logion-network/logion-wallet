import { render, screen, waitFor } from '@testing-library/react';
import { LocData } from "@logion/client";

import { clickByName } from '../tests';
import { DEFAULT_LEGAL_OFFICER } from '../common/TestData';
import { setLocItems, setLocState } from './__mocks__/LocContextMock';

import CloseLocButton from './CloseLocButton';
import { OpenLoc } from 'src/__mocks__/LogionClientMock';
import { setCloseLocMock } from 'src/legal-officer/__mocks__/ClientMock';
import { mockSubmittableResult } from 'src/logion-chain/__mocks__/SignatureMock';

jest.mock("../logion-chain");
jest.mock("./LocContext");
jest.mock("../legal-officer/client");

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
        const locState = new OpenLoc();
        locState.data = () => ({
            locType: "Transaction"
        } as LocData);
        setLocState(locState);

        let called = false;
        const closeLocMock = async (params: any) => {
            called = true;
            params.callback(mockSubmittableResult(true));
            return params.locState;
        };
        setCloseLocMock(closeLocMock);

        render(<CloseLocButton />);
        await clickByName(/Close LOC/);

        await expectNoDialogVisible();
        expect(called).toBe(false);
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
        const locState = new OpenLoc();
        locState.data = () => ({
            locType: "Transaction"
        } as LocData);
        setLocState(locState);

        let called = false;
        const closeLocMock = async (params: any) => {
            called = true;
            params.callback(mockSubmittableResult(true));
            return params.locState;
        };
        setCloseLocMock(closeLocMock);

        render(<CloseLocButton />);
        await clickByName(/Close LOC/);
        await clickByName("Proceed");

        await expectNoDialogVisible();
        expect(called).toBe(true);
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
        const locState = new OpenLoc();
        locState.data = () => ({
            locType: "Transaction"
        } as LocData);
        setLocState(locState);

        let called = false;
        const closeLocMock = async (params: any) => {
            called = true;
            params.callback(mockSubmittableResult(true));
            return params.locState;
        };
        setCloseLocMock(closeLocMock);

        render(<CloseLocButton />);
        await clickByName(/Close LOC/);
        await clickByName("Cancel");

        await expectNoDialogVisible();
        expect(called).toBe(false);
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
        const locState = new OpenLoc();
        locState.data = () => ({
            locType: "Transaction"
        } as LocData);
        setLocState(locState);

        const closeLocMock = async (params: any) => {
            params.callback(mockSubmittableResult(false, "Failed", true));
            throw new Error();
        };
        setCloseLocMock(closeLocMock);

        render(<CloseLocButton />);
        await clickByName(/Close LOC/);
        await clickByName("Proceed");

        await clickByName("OK");
        await expectNoDialogVisible();
    })
})

async function expectNoDialogVisible() {
    await waitFor(() => expect(screen.queryAllByRole("dialog").length).toBe(0));
}
