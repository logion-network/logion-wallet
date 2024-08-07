import { render, screen } from '@testing-library/react';
import { clickByName, shallowRender } from '../tests';
import { UUID, Hash, AnyAccountId, ValidAccountId } from "@logion/node-api";
import { HashString, ClientToken } from "@logion/client";
import { DEFAULT_LEGAL_OFFICER } from "../common/TestData";
import { setMetamaskEnabled } from '../__mocks__/LogionExtensionMock';
import { setClientMock } from 'src/logion-chain/__mocks__/LogionChainMock';
import { CollectionItem, UploadableItemFile, Token, ItemTokenWithRestrictedType } from '@logion/client';
import Authenticate, { Props } from "./Authenticate";
import { LogionClient } from 'src/__mocks__/LogionClientMock';

jest.mock('../logion-chain');

describe("Authenticate with Metamask", () => {

    beforeEach(() => {
        tokenForDownload = undefined;
        setMetamaskEnabled(true);
    });

    it("renders button for restricted delivery of item asset", () => testRender(metamaskAssetProps));
    it("gets token for rightful owner of item", () => testOwnershipCheckSuccess(
        metamaskAssetProps,
        { token: "some-token-value-for-0xa6db31d1aee06a3ad7e4e56de3775e80d2f5ea84" },
        new AnyAccountId("0xa6db31d1aee06a3ad7e4e56de3775e80d2f5ea84", "Ethereum").toValidAccountId(),
    ));
    it("does not get token if anyone else", () => testOwnershipCheckFailure(metamaskAssetProps));
})

describe("Authenticate with Crossmint", () => {

    beforeEach(() => {
        tokenForDownload = undefined;
    });

    it("renders button for restricted delivery of item asset", () => testRender(crossmintAssetProps));
    it("gets token for rightful owner of item", async () => testOwnershipCheckSuccess(
        crossmintAssetProps,
        { token: "some-token-value-for-0xa6db31d1aee06a3ad7e4e56de3775e80d2f5ea84" },
        new AnyAccountId("0xa6db31d1aee06a3ad7e4e56de3775e80d2f5ea84", "Ethereum").toValidAccountId(),
    ));
    it("does not get token if anyone else", async () => testOwnershipCheckFailure(crossmintAssetProps));
})

describe("Authenticate with Polkadot", () => {

    beforeEach(() => {
        tokenForDownload = undefined;
    });

    it("renders button for restricted delivery of item asset", () => testRender(polkadotAssetProps))
    it("gets token for rightful owner of item", async () => testOwnershipCheckSuccess(
        polkadotAssetProps,
        { token: "some-token-value-for-vQw1WXnZU4fCjzyXJqyrnojstSK4YFbtviVKRrBQeydk9je4F" },
        ValidAccountId.polkadot("vQw1WXnZU4fCjzyXJqyrnojstSK4YFbtviVKRrBQeydk9je4F"),
    ));
    it("does not get token if anyone else", async () => testOwnershipCheckFailure(crossmintAssetProps));
})

const locId = UUID.fromDecimalStringOrThrow("47931143565261666716783459922004958297");

const itemFile: UploadableItemFile = {
    hash: Hash.fromHex("0x546b3a31d340681f4c80d84ab317bbd85870e340d3c2feb24d0aceddf6f2fd31"),
    size: BigInt(123456),
    name: HashString.fromValue("ArtWork.png"),
    contentType: HashString.fromValue("image/png"),
    uploaded: true,
};

const ethereumToken: ItemTokenWithRestrictedType = {
    type: "ethereum_erc1155",
    id: "",
    issuance: 1n,
};

const item = {
    id: Hash.fromHex("0x2dbc8ea2fabb49e6344b6990a9831d12469c44e72723979e3b2531fb4d8bd3f6"),
    addedOn: "2022-01-20T15:45:00.000",
    description: HashString.fromValue("Some magnificent art work"),
    files: [ itemFile ],
    restrictedDelivery: true,
    token: mockClientToken(ethereumToken),
} as unknown as CollectionItem;

const ownerToken: ItemTokenWithRestrictedType = {
    type: "owner",
    id: "vQw1WXnZU4fCjzyXJqyrnojstSK4YFbtviVKRrBQeydk9je4F",
    issuance: 1n,
};

function mockClientToken(ethereumToken: ItemTokenWithRestrictedType): ClientToken {
    return {
        isValidItemTokenWithRestrictedType: () => true,
        toItemTokenWithRestrictedType: () => ethereumToken,
        type: HashString.fromValue(ethereumToken.type),
        id: HashString.fromValue(ethereumToken.id),
    } as ClientToken;
}

const itemWithOwner = {
    ...item,
    token: mockClientToken(ownerToken),
} as CollectionItem;

let tokenForDownload: Token | undefined = undefined;

const setTokenForDownload = (token: Token | undefined) => {
    tokenForDownload = token;
}

const assetProps = {
    locId,
    owner: DEFAULT_LEGAL_OFFICER.address,
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

describe("Authenticate with all wallet types", () => {
    const props = {
        locId,
        setTokenForDownload,
        item: itemWithOwner,
        walletType: null
    };

    it("renders all wallet type for token type 'owner'", () => {
        const element = shallowRender(<Authenticate { ...props } />)
        expect(element).toMatchSnapshot();
    })

})

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

function mockForCheckSuccess(address: ValidAccountId) {
    const clientMock = new LogionClient();
    clientMock.currentAccount = address;
    const item = {
        isAuthenticatedTokenOwner: () => true,
    };
    clientMock.public = {
        fees: {
            estimateWithoutStorage: () => Promise.resolve({ inclusionFee: 42n, totalFee: 42n }),
            estimateAddFile: () => Promise.resolve({ inclusionFee: 42n, storageFee: 32n, totalFee: 74n }),
        },
        findCollectionLocItemById: () => item,
    };
    setClientMock(clientMock as any);
}

async function testOwnershipCheckFailure(props: Props) {
    mockForCheckFailure();
    await renderAndClaim(props);
    if (props.walletType === 'POLKADOT') {
        await clickByName("Claim with selected");
    }
    await expectOwnershipCheckFailure();
}

async function testOwnershipCheckSuccess(props: Props, params: { token: string }, address: ValidAccountId) {
    mockForCheckSuccess(address);
    await renderAndClaim(props);
    if (props.walletType === 'POLKADOT') {
        await clickByName("Claim with selected");
    }
    expectTokenSet(params.token);
}

async function expectOwnershipCheckFailure() {
    expect(tokenForDownload).toBeUndefined();
}

function mockForCheckFailure() {
    const clientMock = new LogionClient();
    const item = {
        isAuthenticatedTokenOwner: () => false,
    };
    clientMock.public = {
        fees: {
            estimateWithoutStorage: () => Promise.resolve({ inclusionFee: 42n, totalFee: 42n }),
            estimateAddFile: () => Promise.resolve({ inclusionFee: 42n, storageFee: 32n, totalFee: 74n }),
        },
        findCollectionLocItemById: () => item,
    };
    setClientMock(clientMock as any);
}
