import { LogionClient, PublicLoc, LocData } from '@logion/client';
import { UUID } from '@logion/node-api';
import { render, screen, waitFor } from "@testing-library/react";
import { act } from 'react-test-renderer';

import { shallowRender } from '../tests';
import { setParams, setSearchParams } from '../__mocks__/ReactRouterMock';

import Certificate from './Certificate';
import { setClientMock } from 'src/logion-chain/__mocks__/LogionChainMock';
import { PATRICK } from 'src/common/TestData';

jest.mock("react-router");
jest.mock("react-router-dom");
jest.mock("../logion-chain");
jest.mock("../common/api");
jest.mock("../common/hash");
jest.mock("../common/Model");

describe("Certificate", () => {

    it("renders LOC not found", () => {
        setParams({locId: "95306891657235687884416897796814545554"});
        setSearchParams({
            has: () => false
        });
        let result;
        act(() => {
            result = shallowRender(<Certificate />)
        });
        expect(result).toMatchSnapshot();
    })

    it("renders found LOC", async () => {
        const locId = UUID.fromDecimalStringOrThrow("95306891657235687884416897796814545554");

        const loc = {
            data: {
                id: locId,
                ownerAddress: PATRICK.address,
                files: [],
                metadata: [],
                links: [],
            } as unknown as LocData,
            isLogionIdentityLoc: () => false,
        } as PublicLoc;

        const client = {
            legalOfficers: [ PATRICK ],
            public: {
                findLocById: (args: { locId: UUID }) => {
                    if(args.locId.toString() === locId.toString()) {
                        return Promise.resolve(loc);
                    }
                }
            },
        } as LogionClient;

        setClientMock(client);

        setParams({ locId: locId.toString() });
        setSearchParams({
            has: () => false
        });

        render(<Certificate/>);

        await waitFor(() => expect(screen.getByText("Legal Officer Case")).toBeVisible());
        expect(screen.getByRole("button", { name: "Check a document" })).toBeVisible();
    })
})
