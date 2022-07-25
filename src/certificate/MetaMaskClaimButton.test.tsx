jest.mock('../logion-chain');

import { render } from '@testing-library/react';
import { clickByName } from '../tests';
import MetaMaskClaimButton, { Props } from "./MetaMaskClaimButton";
import { UUID } from "@logion/node-api/dist/UUID";
import { DEFAULT_LEGAL_OFFICER } from "../common/TestData";
import { ItemFile } from "@logion/node-api/dist/Types";

describe("MetaMaskClaimButton", () => {

    const itemFile: ItemFile = {
        hash: "0x546b3a31d340681f4c80d84ab317bbd85870e340d3c2feb24d0aceddf6f2fd31",
        size: BigInt(123456),
        name: "ArtWork.png",
        contentType: "image/png"
    }

    const props: Props = {
        locId: UUID.fromDecimalString("47931143565261666716783459922004958297")!,
        owner: DEFAULT_LEGAL_OFFICER,
        item: {
            id: "0x2dbc8ea2fabb49e6344b6990a9831d12469c44e72723979e3b2531fb4d8bd3f6",
            addedOn: "2022-01-20T15:45:00.000",
            description: "Some magnificent art work",
            files: [ itemFile ]
        },
        file: itemFile
    }

    it("renders button only, when authenticated", () => {

        const button = render(<MetaMaskClaimButton { ...props } />);
        expect(button).toMatchSnapshot();
    })

    it("renders dialog if MetaMask enabled", async () => {

        const button = render(<MetaMaskClaimButton { ...props } />);
        await clickByName("Claim");
        expect(button).toMatchSnapshot();
    })
})
