import { AxiosResponse } from 'axios';
import { render, waitFor, screen } from '@testing-library/react';
import { clickByName } from '../tests';
import ClaimAssetButton, { ClaimedFile, ClaimedFileType, Props } from "./ClaimAssetButton";
import { UUID } from "@logion/node-api";
import { DEFAULT_LEGAL_OFFICER } from "../common/TestData";
import { setMetamaskEnabled } from '../__mocks__/PolkadotExtensionDappMock';
import { axiosMock, resetAxiosMock } from 'src/logion-chain/__mocks__/LogionChainMock';
import { Mock } from 'moq.ts';
import { CollectionItem, UploadableItemFile } from '@logion/client';

jest.mock('../logion-chain');

describe("ClaimAssetButton with Metamask", () => {

    beforeEach(() => {
        resetAxiosMock();
        setMetamaskEnabled(true);
    });

    it("renders button for restricted delivery of item asset", () => testRender(metamaskAssetProps));
    it("shows download to rightful owner of item asset", () => testEthDownload(metamaskAssetProps));
    it("shows error to anyone else for item asset", () => testEthDownloadFail(metamaskAssetProps));

    it("renders button for restricted delivery of collection file", () => testRender(metamaskCollectionFileProps));
    it("shows download to rightful owner of collection file", () => testEthDownload(metamaskCollectionFileProps));
    it("shows error to anyone else for collection file", () => testEthDownloadFail(metamaskCollectionFileProps));
})

describe("ClaimAssetButton with Crossmint", () => {

    beforeEach(resetAxiosMock);

    it("renders button for restricted delivery of item asset", () => testRender(crossmintAssetProps));
    it("shows download to rightful owner of item asset", () => testEthDownload(crossmintAssetProps));
    it("shows error to anyone else for item asset", () => testEthDownloadFail(crossmintAssetProps));

    it("renders button for restricted delivery of collection file", () => testRender(crossmintCollectionFileProps));
    it("shows download to rightful owner of collection file", () => testEthDownload(crossmintCollectionFileProps));
    it("shows error to anyone else for collection file", () => testEthDownloadFail(crossmintCollectionFileProps));
})

describe("ClaimAssetButton with Polkadot", () => {

    beforeEach(resetAxiosMock);

    it("renders button for restricted delivery of item asset", () => testRender(polkadotAssetProps))

    it("shows download to rightful owner of item asset", async () => {
        mockAxiosForCheckSuccess("Item");
        await renderAndClaim(polkadotAssetProps);
        await clickByName("Claim with selected");
        await expectDownloadButton();
    })

    it("shows error to anyone else for item asset", async () => {
        mockAxiosForCheckFailure();
        await renderAndClaim(polkadotAssetProps);
        await clickByName("Claim with selected");
        await expectOwnershipCheckFailure();
    })

    it("renders button for restricted delivery of collection file", () => testRender(polkadotCollectionFileProps))

    it("shows download to rightful owner of collection file", async () => {
        mockAxiosForCheckSuccess("Collection");
        await renderAndClaim(polkadotCollectionFileProps);
        await clickByName("Claim with selected");
        await expectDownloadButton();
    })

    it("shows error to anyone else for collection file", async () => {
        mockAxiosForCheckFailure();
        await renderAndClaim(polkadotCollectionFileProps);
        await clickByName("Claim with selected");
        await expectOwnershipCheckFailure();
    })
})

const locId = UUID.fromDecimalStringOrThrow("47931143565261666716783459922004958297");

const itemFile: UploadableItemFile = {
    hash: "0x546b3a31d340681f4c80d84ab317bbd85870e340d3c2feb24d0aceddf6f2fd31",
    size: BigInt(123456),
    name: "ArtWork.png",
    contentType: "image/png",
    uploaded: true,
};

const claimedAsset: ClaimedFile = {
    hash: itemFile.hash,
    name: itemFile.name,
    type: 'Item',
};

const item = {
    id: "0x2dbc8ea2fabb49e6344b6990a9831d12469c44e72723979e3b2531fb4d8bd3f6",
    addedOn: "2022-01-20T15:45:00.000",
    description: "Some magnificent art work",
    files: [ itemFile ],
    restrictedDelivery: true,
    token: {
        type: "ethereum_erc1155"
    }
} as CollectionItem;

const assetProps = {
    locId,
    owner: DEFAULT_LEGAL_OFFICER,
    item,
    file: claimedAsset,
};

const metamaskAssetProps: Props = {
    ...assetProps,
    walletType: "METAMASK",
};

const crossmintAssetProps: Props = {
    ...assetProps,
    walletType: "CROSSMINT",
};

const polkadotAssetProps: Props = {
    ...assetProps,
    walletType: "POLKADOT",
};

const claimedCollectionFile: ClaimedFile = {
    hash: itemFile.hash,
    name: itemFile.name,
    type: 'Collection',
};

const collectionFileProps = {
    locId,
    owner: DEFAULT_LEGAL_OFFICER,
    item,
    file: claimedCollectionFile,
};

const metamaskCollectionFileProps: Props = {
    ...collectionFileProps,
    walletType: "METAMASK",
};

const crossmintCollectionFileProps: Props = {
    ...collectionFileProps,
    walletType: "CROSSMINT",
};

const polkadotCollectionFileProps: Props = {
    ...collectionFileProps,
    walletType: "POLKADOT",
};

function testRender(props: Props) {
    const button = render(<ClaimAssetButton { ...props } />);
    expect(button).toMatchSnapshot();
}

async function testEthDownload(props: Props) {
    mockAxiosForCheckSuccess(props.file.type);
    await renderAndClaim(props);
    await expectDownloadButton();
}

async function renderAndClaim(props: Props) {
    render(<ClaimAssetButton { ...props } />);
    if(props.file.type === "Item") {
        await clickByName(content => /Claim your asset/.test(content));
    } else {
        await clickByName(content => /Claim document/.test(content));
    }
}

async function expectDownloadButton() {
    await waitFor(() => screen.getByRole("button", { name: content => /Download/.test(content) }));
}

function mockAxiosForCheckSuccess(fileType: ClaimedFileType) {
    axiosMock.setup(instance => instance.interceptors.request.use()).returns(0);
    let expectedUrl: string;
    if(fileType === "Item") {
        expectedUrl = `/api/collection/${ locId.toString() }/${ item.id }/files/${ itemFile.hash }/check`;
    } else {
        expectedUrl = `/api/collection/${ locId.toString() }/files/${ itemFile.hash }/${ item.id }/check`;
    }
    const checkResponse = new Mock<AxiosResponse>();
    axiosMock.setup(instance => instance.get)
        .returns(url => url === expectedUrl ? Promise.resolve(checkResponse.object() as any) : Promise.reject(new Error("")));
}

async function testEthDownloadFail(props: Props) {
    mockAxiosForCheckFailure();
    await renderAndClaim(props);
    await expectOwnershipCheckFailure();
}

async function expectOwnershipCheckFailure() {
    await waitFor(() => screen.getByRole("button", { name: content => /Ownership check failed/.test(content) }));
}

function mockAxiosForCheckFailure() {
    axiosMock.setup(instance => instance.interceptors.request.use()).returns(0);
    axiosMock.setup(instance => instance.get)
        .returns(() => Promise.reject(new Error("unauthorized")));
}
