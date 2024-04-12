import { LogionClient, PublicLoc, LocData, CollectionItem, HashString, ClientTokensRecord } from '@logion/client';
import { UUID, Hash } from '@logion/node-api';
import { render, screen, waitFor } from "@testing-library/react";
import { act } from 'react-test-renderer';

import { shallowRender } from '../tests';
import { setParams, setSearchParams } from '../__mocks__/ReactRouterMock';

import Certificate from './Certificate';
import { setClientMock } from 'src/logion-chain/__mocks__/LogionChainMock';
import { PATRICK } from 'src/common/TestData';
import { URLSearchParams } from 'url';
import { TEST_WALLET_USER } from 'src/wallet-user/TestData';

jest.mock("react-router");
jest.mock("react-router-dom");
jest.mock("../logion-chain");
jest.mock("../common/hash");
jest.mock("../common/Model");

describe("Certificate", () => {

    it("renders temporary message", () => {
        setParams({locId: "95306891657235687884416897796814545554"});
        setSearchParams(mockEmptySearchParams());
        let result;
        act(() => {
            result = shallowRender(<Certificate />)
        });
        expect(result).toMatchSnapshot();
    })

    it("renders LOC not found", async () => {
        const locId = UUID.fromDecimalStringOrThrow("95306891657235687884416897796814545554");
        const loc = mockPublicLoc(locId);

        const client = mockClient(loc);
        setClientMock(client);

        const nonExistentLoc = new UUID("28b53275-d974-4332-9783-841245f31998");
        setParams({locId: nonExistentLoc.toDecimalString()});
        setSearchParams(mockEmptySearchParams());

        render(<Certificate/>);

        await waitFor(() => expect(screen.getByText("LOC NOT FOUND")).toBeVisible());
        expect(screen.getByText(nonExistentLoc.toDecimalString())).toBeVisible();
        expect(() => screen.getByText("Legal Officer Case")).toThrow();
    })

    it("renders TOKENS RECORD not found", async () => {
        const locId = UUID.fromDecimalStringOrThrow("95306891657235687884416897796814545554");
        const loc = mockPublicLoc(locId);

        const client = mockClient(loc);
        setClientMock(client);

        const nonExistentRecord = Hash.of("some-non-existent-record")
        setParams({locId: locId.toString(), tokensRecordId: nonExistentRecord.toHex()});
        setSearchParams(mockEmptySearchParams());

        render(<Certificate/>);

        await waitFor(() => expect(screen.getByText("TOKENS RECORD NOT FOUND")).toBeVisible());
        expect(screen.getByText(nonExistentRecord.toHex())).toBeVisible();
        expect(() => screen.getByText("Legal Officer Case")).toThrow();
    })

    it("renders found LOC", async () => {
        const locId = UUID.fromDecimalStringOrThrow("95306891657235687884416897796814545554");
        const loc = mockPublicLoc(locId);

        const client = mockClient(loc);
        setClientMock(client);

        setParams({ locId: locId.toString() });
        setSearchParams(mockEmptySearchParams());

        render(<Certificate/>);

        await waitFor(() => expect(screen.getByText("Legal Officer Case")).toBeVisible());
        expect(screen.getByRole("button", { name: "Check a document" })).toBeVisible();
    })

    it("renders found TOKENS RECORD", async () => {
        const locId = UUID.fromDecimalStringOrThrow("95306891657235687884416897796814545554");
        const loc = mockPublicLoc(locId);
        const tokensRecord = mockTokensRecord();
        const client = mockClient(loc, undefined, tokensRecord);
        setClientMock(client);

        setParams({ locId: locId.toString(), tokensRecordId: tokensRecord.id.toHex() });
        setSearchParams(mockEmptySearchParams());

        render(<Certificate/>);

        await waitFor(() => expect(screen.getByText("Legal Officer Case")).toBeVisible());
        expect(screen.getByText("Tokens record")).toBeVisible();
        expect(screen.getByText(mockTRCellContent(tokensRecord.issuer.address))).toBeVisible();
        expect(screen.getByText(mockTRCellContent(tokensRecord.description.validValue()))).toBeVisible();
        expect(screen.getByText(mockTRCellContent(tokensRecord.files[0].contentType.validValue()))).toBeVisible();
        expect(screen.getByText(tokensRecord.files[0].name.validValue())).toBeVisible();
    })

    it("renders item with restricted delivery", async () => {
        renderWithItem(true);

        await waitFor(() => expect(screen.getByText("Legal Officer Case")).toBeVisible());
        expect(screen.getByRole("button", { name: "Check a document" })).toBeVisible();
        expect(screen.getByRole("button", { name: content => /Check NFT Asset/.test(content) })).toBeVisible();
    })

    it("renders item without restricted delivery", async () => {
        renderWithItem(false);

        await waitFor(() => expect(screen.getByText("Legal Officer Case")).toBeVisible());
        expect(screen.getByRole("button", { name: "Check a document" })).toBeVisible();
        const checkAssetButton = screen.queryByRole("button", { name: content => /Check NFT Asset/.test(content) });
        expect(checkAssetButton).toBe(null);
    })
})

function mockTRCellContent(content: string): string {
    return `: ${ content }`
}

function mockPublicLoc(locId: UUID): PublicLoc {
    return {
        data: {
            id: locId,
            ownerAccountId: PATRICK.account,
            files: [],
            metadata: [],
            links: [],
            locType: "Transaction",
        } as unknown as LocData,
        isLogionIdentityLoc: () => false,
    } as PublicLoc;
}

function mockEmptySearchParams(): URLSearchParams {
    return {
        has: () => false,
        get: () => null,
    } as unknown as URLSearchParams;
}

function renderWithItem(restrictedDelivery: boolean) {
    const locId = UUID.fromDecimalStringOrThrow("95306891657235687884416897796814545554");
    const loc = mockPublicLoc(locId);

    const itemId = Hash.fromHex("0x5369f02241b5aebc7c62fe76eeb3c9560bb753384219a4f30f2d556041e14cb4");
    const item = mockCollectionItem(locId, itemId, restrictedDelivery);

    const client = mockClient(loc, item);
    setClientMock(client);

    setParams({ locId: locId.toString(), collectionItemId: itemId.toHex() });
    setSearchParams(mockEmptySearchParams());

    render(<Certificate/>);
}

function mockCollectionItem(locId: UUID, itemId: Hash, restrictedDelivery: boolean): CollectionItem {
    return {
        locId,
        id: itemId,
        restrictedDelivery,
        specificLicenses: [],
        description: HashString.fromValue(""),
    } as unknown as CollectionItem;
}

function mockClient(loc: PublicLoc, item?: CollectionItem, tokensRecord?: ClientTokensRecord): LogionClient {
    const client = {
        legalOfficers: [ PATRICK ],
        public: {
            findLocById: (args: { locId: UUID }) => {
                if(args.locId.toString() === loc.data.id.toString()) {
                    return Promise.resolve(loc);
                } else {
                    throw Error("LOC not found")
                }
            },
            getTokensRecords: () => Promise.resolve( tokensRecord ? [ tokensRecord ] : []),
            getTokensRecord: () => Promise.resolve(tokensRecord),
        },
    } as unknown as LogionClient;

    if(item) {
        client.public.findCollectionLocItemById = (args: { locId: UUID, itemId: Hash }) => {
            if(args.locId.toString() === loc.data.id.toString()
                && args.itemId.equalTo(item.id)) {
                return Promise.resolve(item);
            } else {
                return Promise.reject();
            }
        };
    }

    return client;
}

function mockTokensRecord(): ClientTokensRecord {
    return {
        id: Hash.of("record-id"),
        description: HashString.fromValue("Record Description"),
        addedOn: "2022-08-23T07:27:46.128Z",
        issuer: TEST_WALLET_USER,
        files: [ {
            name: HashString.fromValue("record-file-name.txt"),
            hash: Hash.of("record-file-content"),
            size: 10n,
            uploaded: true,
            contentType: HashString.fromValue("text/plain")
        } ]

    }
}
