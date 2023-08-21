import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { clickByName } from '../tests';
import ImportItems from './ImportItems';
import { setLocState, refresh } from "./__mocks__/UserLocContextMock";
import { CollectionItem, Fees } from "@logion/node-api";
import { H256 } from "@logion/node-api/dist/types/interfaces";
import { LogionClient, AddCollectionItemParams, EstimateFeesAddCollectionItemParams } from "@logion/client";
import { mockSubmittableResult } from "../logion-chain/__mocks__/SignatureMock";
import { setClientMock } from 'src/logion-chain/__mocks__/LogionChainMock';
import { It, Mock } from 'moq.ts';
import { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import { Compact, u128 } from "@polkadot/types-codec";
import { TEST_WALLET_USER } from 'src/wallet-user/TestData';

jest.mock("../common/CommonContext");
jest.mock("../logion-chain/Signature");
jest.mock("../logion-chain");
jest.mock("./UserLocContext");

describe("ImportItems", () => {

    it("imports all CSV", async () => {
        const collection = await uploadCsv();

        await waitFor(() => screen.getAllByRole("button", { name: /Import all/ }));
        const importAllButton = screen.getAllByRole("button", { name: /Import all/ })[0];
        await userEvent.click(importAllButton);
        await waitFor(() => expect(screen.getByRole("button", { name: "Proceed" })).toBeVisible());
        await clickByName("Proceed");
        await waitFor(() => expect(collection.addCollectionItem).toBeCalled());

        await waitFor(() => expect(screen.getByAltText("ok")).toBeVisible());

        await closeAndExpectRefresh();
    });

    it("imports one CSV row", async () => {
        const collection = await uploadCsv();

        await waitFor(() => expect(screen.getAllByRole("button", { name: /Import/ }).length).toBe(4));
        const importButton = screen.getAllByRole("button", { name: /Import/ })[2];
        await userEvent.click(importButton);
        await waitFor(() => expect(screen.getByRole("button", { name: "Proceed" })).toBeVisible());
        await clickByName("Proceed");
        await waitFor(() => expect(collection.addCollectionItem).toBeCalled());

        await waitFor(() => expect(screen.getByText("Submission successful.")).toBeVisible());

        await closeAndExpectRefresh();
    });
});

async function uploadCsv(): Promise<any> {
    const clientMock = new Mock<LogionClient>;
    const submittable = new Mock<SubmittableExtrinsic>();
    clientMock.setup(instance => instance.logionApi.polkadot.tx.logionLoc.addCollectionItem(It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny(), It.IsAny())).returns(submittable.object());
    const locId = new Mock<Compact<u128>>();
    clientMock.setup(instance => instance.logionApi.adapters.toLocId(It.IsAny())).returns(locId.object());
    const hash = new Mock<H256>();
    clientMock.setup(instance => instance.logionApi.adapters.toH256(It.IsAny())).returns(hash.object());
    clientMock.setup(instance => instance.logionApi.adapters.toCollectionItemFile(It.IsAny())).returns({} as any);
    clientMock.setup(instance => instance.logionApi.adapters.toCollectionItemToken(It.IsAny())).returns({} as any);
    setClientMock(clientMock.object());

    const collection = {
        addCollectionItem: jest.fn((params: AddCollectionItemParams) => {
            params.callback!(mockSubmittableResult(true, "finalized"))
        }),
        estimateFeesAddCollectionItem: jest.fn((params: EstimateFeesAddCollectionItemParams) => {
            return Promise.resolve(
                new Fees({
                    inclusionFee: 42n,
                    certificateFee: 32n,
                    storageFee: 22n,
                })
            )
        }),
        getCollectionItem(_parameters: { itemId: string }): Promise<CollectionItem | undefined> {
            return Promise.resolve(undefined);
        },
        data: () => ({
            requesterAddress: TEST_WALLET_USER,
            collectionCanUpload: false,
        }),
    };
    setLocState(collection);

    render(<ImportItems />);

    const file = new File([`ID,DESCRIPTION,TERMS_AND_CONDITIONS TYPE,TERMS_AND_CONDITIONS PARAMETERS
0x50cc7f74edfff71f51fdbffed12067a16b563bb72cab9240cd72e56234ea5dc0,package.json,none,
0xa025ca5f086f3b6df1ca96c235c4daff57083bbd4c9320a3013e787849f9fffa,art-work.png,CC4.0,BY-NC-SA,`], "items.csv");
    await userEvent.upload(screen.getByTestId("FileSelectorButtonHiddenInput"), file, {applyAccept: false});
    return collection;
}

async function closeAndExpectRefresh() {
    await clickByName("Close");
    await waitFor(() => expect(refresh).toBeCalled());
}
