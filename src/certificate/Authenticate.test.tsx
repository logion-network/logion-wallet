import { AxiosResponse } from 'axios';
import { render } from '@testing-library/react';
import { clickByName } from '../tests';
import { UUID } from "@logion/node-api";
import { DEFAULT_LEGAL_OFFICER } from "../common/TestData";
import { setMetamaskEnabled } from '../__mocks__/PolkadotExtensionDappMock';
import { axiosMock, resetAxiosMock } from 'src/logion-chain/__mocks__/LogionChainMock';
import { Mock } from 'moq.ts';
import { CollectionItem, UploadableItemFile, Token } from '@logion/client';
import Authenticate, { Props } from "./Authenticate";

jest.mock('../logion-chain');

describe("Authenticate with Metamask", () => {

    beforeEach(() => {
        resetAxiosMock();
        tokenForDownload = undefined;
        setMetamaskEnabled(true);
    });

    it("renders button for restricted delivery of item asset", () => testRender(metamaskAssetProps));
    it("gets token for rightful owner of item", () => testOwnershipCheckSuccess(
        metamaskAssetProps,
        { token: "some-token-value-for-0xa6db31d1aee06a3ad7e4e56de3775e80d2f5ea84" }
    ));
    it("does not get token if anyone else", () => testOwnershipCheckFailure(metamaskAssetProps));
})

describe("Authenticate with Crossmint", () => {

    beforeEach(() => {
        resetAxiosMock();
        tokenForDownload = undefined;
    });

    it("renders button for restricted delivery of item asset", () => testRender(crossmintAssetProps));
    it("gets token for rightful owner of item", async () => testOwnershipCheckSuccess(
        crossmintAssetProps,
        { token: "some-token" }
    ));
    it("does not get token if anyone else", async () => testOwnershipCheckFailure(crossmintAssetProps));
})

describe("Authenticate with Polkadot", () => {

    beforeEach(() => {
        resetAxiosMock();
        tokenForDownload = undefined;
    });

    it("renders button for restricted delivery of item asset", () => testRender(polkadotAssetProps))
    it("gets token for rightful owner of item", async () => testOwnershipCheckSuccess(
        crossmintAssetProps,
        { token: "some-token" }
    ));
    it("does not get token if anyone else", async () => testOwnershipCheckFailure(crossmintAssetProps));
})

const locId = UUID.fromDecimalStringOrThrow("47931143565261666716783459922004958297");

const itemFile: UploadableItemFile = {
    hash: "0x546b3a31d340681f4c80d84ab317bbd85870e340d3c2feb24d0aceddf6f2fd31",
    size: BigInt(123456),
    name: "ArtWork.png",
    contentType: "image/png",
    uploaded: true,
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

let tokenForDownload: Token | undefined = undefined;

const setTokenForDownload = (token: Token | undefined) => {
    tokenForDownload = token;
}

const assetProps = {
    locId,
    owner: DEFAULT_LEGAL_OFFICER,
    item,
    setTokenForDownload,
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

function testRender(props: Props) {
    const button = render(<Authenticate { ...props } />);
    expect(button).toMatchSnapshot();
}

async function renderAndClaim(props: Props) {
    render(<Authenticate { ...props } />);
    await clickByName(content => /Connect/.test(content));
}

function expectTokenSet(value: string) {
    expect(tokenForDownload?.value).toEqual(value);
}

function mockAxiosForCheckSuccess() {
    axiosMock.setup(instance => instance.interceptors.request.use()).returns(0);
    const expectedUrl = `/api/collection/${ locId.toString() }/items/${ item.id }/check`;
    const checkResponse = new Mock<AxiosResponse>();
    axiosMock.setup(instance => instance.get)
        .returns(url => url === expectedUrl ? Promise.resolve(checkResponse.object() as any) : Promise.reject(new Error("")));
}

async function testOwnershipCheckFailure(props: Props) {
    mockAxiosForCheckFailure();
    await renderAndClaim(props);
    if (props.walletType === 'POLKADOT') {
        await clickByName("Claim with selected");
    }
    await expectOwnershipCheckFailure();
}

async function testOwnershipCheckSuccess(props: Props, params: { token: string }) {
    mockAxiosForCheckSuccess();
    await renderAndClaim(props);
    if (props.walletType === 'POLKADOT') {
        await clickByName("Claim with selected");
    }
    expectTokenSet(params.token);
}

async function expectOwnershipCheckFailure() {
    expect(tokenForDownload).toBeUndefined();
}

function mockAxiosForCheckFailure() {
    axiosMock.setup(instance => instance.interceptors.request.use()).returns(0);
    axiosMock.setup(instance => instance.get)
        .returns(() => Promise.reject(new Error("unauthorized")));
}
