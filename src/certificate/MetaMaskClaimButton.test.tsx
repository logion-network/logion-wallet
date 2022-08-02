jest.mock('../logion-chain');

import { AxiosResponse } from 'axios';
import { render, waitFor, screen } from '@testing-library/react';
import { clickByName } from '../tests';
import MetaMaskClaimButton, { Props } from "./MetaMaskClaimButton";
import { UUID } from "@logion/node-api/dist/UUID";
import { DEFAULT_LEGAL_OFFICER } from "../common/TestData";
import { ItemFile } from "@logion/node-api";
import { setMetamaskEnabled } from '../__mocks__/PolkadotExtensionDappMock';
import { axiosMock } from 'src/logion-chain/__mocks__/LogionChainMock';
import { Mock } from 'moq.ts';

const locId = UUID.fromDecimalString("47931143565261666716783459922004958297") || new UUID();

describe("MetaMaskClaimButton", () => {

    const itemFile: ItemFile = {
        hash: "0x546b3a31d340681f4c80d84ab317bbd85870e340d3c2feb24d0aceddf6f2fd31",
        size: BigInt(123456),
        name: "ArtWork.png",
        contentType: "image/png"
    }

    const props: Props = {
        locId,
        owner: DEFAULT_LEGAL_OFFICER,
        item: {
            id: "0x2dbc8ea2fabb49e6344b6990a9831d12469c44e72723979e3b2531fb4d8bd3f6",
            addedOn: "2022-01-20T15:45:00.000",
            description: "Some magnificent art work",
            files: [ itemFile ],
            restrictedDelivery: true,
        },
        file: itemFile
    }

    it("renders button for restricted delivery", () => {

        const button = render(<MetaMaskClaimButton { ...props } />);
        expect(button).toMatchSnapshot();
    })

    it("shows download to rightful owner", async () => {
        setMetamaskEnabled(true);
        axiosMock.setup(instance => instance.interceptors.request.use()).returns(0);
        const checkResponse = new Mock<AxiosResponse<any, any>>();
        axiosMock.setup(instance => instance.get(`/api/collection/${ locId.toString() }/${ props.item.id }/files/${ itemFile.hash }/check`))
            .returnsAsync(checkResponse.object());

        render(<MetaMaskClaimButton { ...props } />);
        
        await clickByName(content => /Claim your asset/.test(content));
        waitFor(() => screen.getByRole("button", { name: content => /Download/.test(content) }));
    })

    it("shows error to anyone else", async () => {
        setMetamaskEnabled(true);
        axiosMock.setup(instance => instance.interceptors.request.use()).returns(0);

        render(<MetaMaskClaimButton { ...props } />);
        
        await clickByName(content => /Claim your asset/.test(content));
        waitFor(() => screen.getByRole("button", { name: content => /Ownership check failed/.test(content) }));
    })
})
