jest.mock('../logion-chain');

import { AxiosResponse } from 'axios';
import { render, waitFor, screen, getByText } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { clickByName } from '../tests';
import ClaimAssetButton, { Props } from "./ClaimAssetButton";
import { UUID } from "@logion/node-api/dist/UUID.js";
import { DEFAULT_LEGAL_OFFICER } from "../common/TestData";
import { setMetamaskEnabled } from '../__mocks__/PolkadotExtensionDappMock';
import { axiosMock, resetAxiosMock } from 'src/logion-chain/__mocks__/LogionChainMock';
import { Mock } from 'moq.ts';
import { CollectionItem, UploadableItemFile } from '@logion/client';

const locId = UUID.fromDecimalString("47931143565261666716783459922004958297") || new UUID();

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

describe("ClaimAssetButton with Metamask", () => {

    const props: Props = {
        locId,
        owner: DEFAULT_LEGAL_OFFICER,
        item,
        file: itemFile,
        walletType: "METAMASK",
    };

    beforeEach(resetAxiosMock);

    it("renders button for restricted delivery", () => {
        const button = render(<ClaimAssetButton { ...props } />);
        expect(button).toMatchSnapshot();
    })

    it("shows download to rightful owner", async () => {
        setMetamaskEnabled(true);
        axiosMock.setup(instance => instance.interceptors.request.use()).returns(0);
        const checkResponse = new Mock<AxiosResponse<any, any>>();
        axiosMock.setup(instance => instance.get(`/api/collection/${ locId.toString() }/${ props.item.id }/files/${ itemFile.hash }/check`))
            .returnsAsync(checkResponse.object());

        render(<ClaimAssetButton { ...props } />);
        
        await clickByName(content => /Claim your asset/.test(content));
        await waitFor(() => screen.getByRole("button", { name: content => /Download/.test(content) }));
    })

    it("shows error to anyone else", async () => {
        setMetamaskEnabled(true);
        axiosMock.setup(instance => instance.interceptors.request.use()).returns(0);
        axiosMock.setup(instance => instance.get)
            .returns(() => Promise.reject(new Error("unauthorized")));

        render(<ClaimAssetButton { ...props } />);
        
        await clickByName(content => /Claim your asset/.test(content));
        await waitFor(() => screen.getByRole("button", { name: content => /Ownership check failed/.test(content) }));
    })
})

describe("ClaimAssetButton with Crossmint", () => {

    const props: Props = {
        locId,
        owner: DEFAULT_LEGAL_OFFICER,
        item,
        file: itemFile,
        walletType: "CROSSMINT",
    };

    beforeEach(resetAxiosMock);

    it("renders button for restricted delivery", () => {
        const button = render(<ClaimAssetButton { ...props } />);
        expect(button).toMatchSnapshot();
    })

    it("shows download to rightful owner", async () => {
        axiosMock.setup(instance => instance.interceptors.request.use()).returns(0);
        const checkResponse = new Mock<AxiosResponse<any, any>>();
        axiosMock.setup(instance => instance.get(`/api/collection/${ locId.toString() }/${ props.item.id }/files/${ itemFile.hash }/check`))
            .returnsAsync(checkResponse.object());

        render(<ClaimAssetButton { ...props } />);
        
        await clickByName(content => /Claim your asset/.test(content));
        await waitFor(() => screen.getByRole("button", { name: content => /Download/.test(content) }));
    })

    it("shows error to anyone else", async () => {
        axiosMock.setup(instance => instance.interceptors.request.use()).returns(0);
        axiosMock.setup(instance => instance.get)
            .returns(() => Promise.reject(new Error("unauthorized")));

        render(<ClaimAssetButton { ...props } />);
        
        await clickByName(content => /Claim your asset/.test(content));
        await waitFor(() => screen.getByRole("button", { name: content => /Ownership check failed/.test(content) }));
    })
})

describe("ClaimAssetButton with Polkadot", () => {

    const props: Props = {
        locId,
        owner: DEFAULT_LEGAL_OFFICER,
        item,
        file: itemFile,
        walletType: "POLKADOT",
    };

    beforeEach(resetAxiosMock);

    it("renders button for restricted delivery", () => {
        const button = render(<ClaimAssetButton { ...props } />);
        expect(button).toMatchSnapshot();
    })

    it("shows download to rightful owner", async () => {
        const checkResponse = new Mock<AxiosResponse<any, any>>();
        axiosMock.setup(instance => instance.get(`/api/collection/${ locId.toString() }/${ props.item.id }/files/${ itemFile.hash }/check`))
            .returnsAsync(checkResponse.object());

        render(<ClaimAssetButton { ...props } />);
        await clickByName(content => /Claim your asset/.test(content));
        await userEvent.click(screen.getByText("name"));
        await clickByName("Claim with selected");
        await waitFor(() => screen.getByRole("button", { name: content => /Download/.test(content) }));
    })

    it("shows error to anyone else", async () => {
        axiosMock.setup(instance => instance.get)
            .returns(() => Promise.reject(new Error("unauthorized")));

        render(<ClaimAssetButton { ...props } />);

        await clickByName(content => /Claim your asset/.test(content));
        await userEvent.click(screen.getByText("name"));
        await clickByName("Claim with selected");
        await waitFor(() => screen.getByRole("button", { name: content => /Ownership check failed/.test(content) }));
    })
})
