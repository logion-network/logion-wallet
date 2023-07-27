import { render, waitFor, screen } from '@testing-library/react';
import ClaimAssetButton, { ClaimedFile, Props } from "./ClaimAssetButton";
import { UUID } from "@logion/node-api";
import { DEFAULT_LEGAL_OFFICER } from "../common/TestData";
import { CollectionItem, UploadableItemFile, Token, HashString } from '@logion/client';
import { DateTime } from "luxon";

jest.mock('../logion-chain');

describe("ClaimAssetButton", () => {

    it("renders empty for restricted delivery of item asset when no token", () => testRender({
        ...assetProps,
        tokenForDownload: undefined
    }));
    it("shows download to rightful owner of item asset", () => testEthDownload({
        ...assetProps,
        tokenForDownload: TOKEN_FOR_DOWNLOAD
    }));

    it("renders empty for restricted delivery of collection file when no token", () => testRender({
        ...collectionFileProps,
        tokenForDownload: undefined
    }));

    it("shows download to rightful owner of collection file", () => testEthDownload({
        ...collectionFileProps,
        tokenForDownload: TOKEN_FOR_DOWNLOAD
    }));
});

const locId = UUID.fromDecimalStringOrThrow("47931143565261666716783459922004958297");

const itemFile: UploadableItemFile = {
    hash: "0x546b3a31d340681f4c80d84ab317bbd85870e340d3c2feb24d0aceddf6f2fd31",
    size: BigInt(123456),
    name: HashString.fromValue("ArtWork.png"),
    contentType: HashString.fromValue("image/png"),
    uploaded: true,
};

const claimedAsset: ClaimedFile = {
    hash: itemFile.hash,
    name: itemFile.name.validValue(),
    type: 'Item',
};

const item = {
    id: "0x2dbc8ea2fabb49e6344b6990a9831d12469c44e72723979e3b2531fb4d8bd3f6",
    addedOn: "2022-01-20T15:45:00.000",
    description: HashString.fromValue("Some magnificent art work"),
    files: [ itemFile ],
    restrictedDelivery: true,
    token: {
        type: HashString.fromValue("ethereum_erc1155")
    }
} as unknown as CollectionItem;

const TOKEN_FOR_DOWNLOAD: Token = {
    value: "123456",
    expirationDateTime: DateTime.utc(),
}

const assetProps = {
    locId,
    owner: DEFAULT_LEGAL_OFFICER.address,
    item,
    file: claimedAsset,
};

const claimedCollectionFile: ClaimedFile = {
    hash: itemFile.hash,
    name: itemFile.name.validValue(),
    type: 'Collection',
};

const collectionFileProps = {
    locId,
    owner: DEFAULT_LEGAL_OFFICER.address,
    item,
    file: claimedCollectionFile,
};

function testRender(props: Props) {
    const button = render(<ClaimAssetButton { ...props } />);
    expect(button).toMatchSnapshot();
}

async function testEthDownload(props: Props) {
    testRender(props);
    await expectDownloadButton(props);
}

async function expectDownloadButton(props: Props) {
    const regExp =
        props.file.type === "Item" ?
        /Claim your asset/ :
        /Claim document/;
    await waitFor(() => screen.getByRole("button", { name: content => regExp.test(content) }));
}
