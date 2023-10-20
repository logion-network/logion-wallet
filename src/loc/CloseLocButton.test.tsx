import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
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

    it("closes with all items published by requester and auto-ack", async () => {
        setLocItems([ metadataItem("PUBLISHED") ]);
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
        locState.isRequester = () => true;
        setLocState(locState);

        render(<CloseLocButton />);
        const ackAllToggle = screen.getByRole("checkbox");
        await userEvent.click(ackAllToggle);
        await clickByName(/Close LOC/);
        await clickByName("Proceed");

        await expectNoDialogVisible();
        expect(called).toBe(true);
    })

    it("closes with all items acknowledged by verified issuer and auto-ack", async () => {
        setLocItems([ metadataItem("PUBLISHED", true) ]);
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
        locState.isRequester = () => false;
        setLocState(locState);

        render(<CloseLocButton />);
        const ackAllToggle = screen.getByRole("checkbox");
        await userEvent.click(ackAllToggle);
        await clickByName(/Close LOC/);
        await clickByName("Proceed");

        await expectNoDialogVisible();
        expect(called).toBe(true);
    })
})

function metadataItem(status: ItemStatus, acknowledgedByVerifiedIssuer?: boolean): LocItem {
    return new MetadataItem(
        {
            newItem: false,
            status,
            submitter: DEFAULT_LEGAL_OFFICER,
            timestamp: null,
            type: 'Data',
            template: false,
            acknowledgedByVerifiedIssuer,
        },
        {
            name: HashString.fromValue("Test"),
            value: HashString.fromValue("Test"),
        }
    );
}
