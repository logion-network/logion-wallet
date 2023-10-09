import { render } from '@testing-library/react';
import { LocData, ItemStatus, HashString } from "@logion/client";

import { clickByName, expectNoDialogVisible } from '../tests';
import { DEFAULT_LEGAL_OFFICER } from '../common/TestData';
import { setLocItems, setLocState } from './__mocks__/LocContextMock';

import CloseLocButton from './CloseLocButton';
import { OpenLoc } from 'src/__mocks__/LogionClientMock';
import { mockSubmittableResult } from 'src/logion-chain/__mocks__/SignatureMock';
import { LocItem, MetadataItem } from './LocItem';

jest.mock("../logion-chain");
jest.mock("./LocContext");

describe("CloseLocButton", () => {

    it("does not close with draft items", async () => {
        setLocItems([ metadataItem("DRAFT") ]);
        let called = false;
        const closeLocMock = async (params: any) => {
            called = true;
            params.callback(mockSubmittableResult(true));
            return params.locState;
        };
        const locState = new OpenLoc();
        locState.data = () => ({
            locType: "Transaction",
            status: "OPEN",
        } as LocData);
        locState.legalOfficer.close = closeLocMock;
        setLocState(locState);

        render(<CloseLocButton />);
        await clickByName(/Close LOC/);

        await expectNoDialogVisible();
        expect(called).toBe(false);
    })

    it("closes with all items recorded", async () => {
        setLocItems([ metadataItem("ACKNOWLEDGED") ]);
        const locState = new OpenLoc();
        locState.data = () => ({
            locType: "Transaction",
            status: "OPEN",
        } as LocData);
        let called = false;
        const closeLocMock = async (params: any) => {
            called = true;
            params.callback(mockSubmittableResult(true));
            return params.locState;
        };
        locState.legalOfficer.close = closeLocMock;
        setLocState(locState);

        render(<CloseLocButton />);
        await clickByName(/Close LOC/);
        await clickByName("Proceed");

        await expectNoDialogVisible();
        expect(called).toBe(true);
    })

    it("does not close on cancel", async () => {
        setLocItems([ metadataItem("ACKNOWLEDGED") ]);
        const locState = new OpenLoc();
        locState.data = () => ({
            locType: "Transaction",
            status: "OPEN",
        } as LocData);
        let called = false;
        const closeLocMock = async (params: any) => {
            called = true;
            params.callback(mockSubmittableResult(true));
            return params.locState;
        };
        locState.legalOfficer.close = closeLocMock;
        setLocState(locState);

        render(<CloseLocButton />);
        await clickByName(/Close LOC/);
        await clickByName("Cancel");

        await expectNoDialogVisible();
        expect(called).toBe(false);
    })

    it("shows message on error", async () => {
        setLocItems([ metadataItem("ACKNOWLEDGED") ]);
        const locState = new OpenLoc();
        locState.data = () => ({
            locType: "Transaction",
            status: "OPEN",
        } as LocData);
        const closeLocMock = async (params: any) => {
            params.callback(mockSubmittableResult(false, "Failed", true));
            throw new Error();
        };
        locState.legalOfficer.close = closeLocMock;
        setLocState(locState);

        render(<CloseLocButton />);
        await clickByName(/Close LOC/);
        await clickByName("Proceed");

        await clickByName("OK");
        await expectNoDialogVisible();
    })
})

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
