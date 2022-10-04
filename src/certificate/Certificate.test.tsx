import { LogionClient, PublicLoc, LocData, CollectionItem } from '@logion/client';
import { UUID } from '@logion/node-api';
import { render, screen, waitFor } from "@testing-library/react";
import { act } from 'react-test-renderer';

import { shallowRender } from '../tests';
import { setParams, setSearchParams } from '../__mocks__/ReactRouterMock';

import Certificate from './Certificate';
import { setClientMock } from 'src/logion-chain/__mocks__/LogionChainMock';
import { PATRICK } from 'src/common/TestData';
import { URLSearchParams } from 'url';

jest.mock("react-router");
jest.mock("react-router-dom");
jest.mock("../logion-chain");
jest.mock("../common/api");
jest.mock("../common/hash");
jest.mock("../common/Model");

describe("Certificate", () => {

    it("renders LOC not found", () => {
        setParams({locId: "95306891657235687884416897796814545554"});
        setSearchParams(mockEmptySearchParams());
        let result;
        act(() => {
            result = shallowRender(<Certificate />)
        });
        expect(result).toMatchSnapshot();
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

function mockPublicLoc(locId: UUID): PublicLoc {
    return {
        data: {
            id: locId,
            ownerAddress: PATRICK.address,
            files: [],
            metadata: [],
            links: [],
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

    const itemId = "0x5369f02241b5aebc7c62fe76eeb3c9560bb753384219a4f30f2d556041e14cb4";
    const item = mockCollectionItem(locId, itemId, restrictedDelivery);

    const client = mockClient(loc, item);
    setClientMock(client);

    setParams({ locId: locId.toString(), collectionItemId: itemId });
    setSearchParams(mockEmptySearchParams());

    render(<Certificate/>);
}

function mockCollectionItem(locId: UUID, itemId: string, restrictedDelivery: boolean): CollectionItem {
    return {
        locId,
        id: itemId,
        restrictedDelivery,
        specificLicenses: [],
    } as unknown as CollectionItem;
}

function mockClient(loc: PublicLoc, item?: CollectionItem): LogionClient {
    const client = {
        legalOfficers: [ PATRICK ],
        public: {
            findLocById: (args: { locId: UUID }) => {
                if(args.locId.toString() === loc.data.id.toString()) {
                    return Promise.resolve(loc);
                }
            },
        },
    } as LogionClient;

    if(item) {
        client.public.findCollectionLocItemById = (args: { locId: UUID, itemId: string }) => {
            if(args.locId.toString() === loc.data.id.toString()
                && args.itemId === item.id) {
                return Promise.resolve(item);
            } else {
                return Promise.reject();
            }
        };
    }

    return client;
}
