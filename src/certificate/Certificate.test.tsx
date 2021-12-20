import { act } from 'react-test-renderer';

import { shallowRender } from '../tests';
import { CLOSED_IDENTITY_LOC_ID } from '../logion-chain/__mocks__/LogionLocMock';
import { setParams, setSearchParams } from '../__mocks__/ReactRouterMock';

import Certificate from './Certificate';
import { render, screen, fireEvent, waitFor, getByText } from "@testing-library/react";

jest.mock("react-router");
jest.mock("react-router-dom");
jest.mock("../logion-chain");
jest.mock("../logion-chain/LogionLoc");
jest.mock("../common/api");
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
        setParams({locId: CLOSED_IDENTITY_LOC_ID});
        setSearchParams({
            has: () => false
        });

        render(<Certificate/>);

        await waitFor(async () => {
            expect(await screen.getByText(CLOSED_IDENTITY_LOC_ID)).toBeVisible();
        });
    })
})
