import { act } from 'react-test-renderer';

import { shallowRender } from '../tests';
import { CLOSED_IDENTITY_LOC_ID, UNPREFIXED_FILE_HASH } from '../logion-chain/__mocks__/LogionLocMock';
import { setParams, setSearchParams } from '../__mocks__/ReactRouterMock';

import Certificate from './Certificate';
import { render, screen, waitFor, getByText } from "@testing-library/react";
import userEvent from '@testing-library/user-event';
import { sha256Hex } from '../common/__mocks__/HashMock';

jest.mock("react-router");
jest.mock("react-router-dom");
jest.mock("../logion-chain");
jest.mock("../logion-chain/LogionLoc");
jest.mock("../common/api");
jest.mock("../common/hash");
jest.mock("../common/Model");
jest.mock("../directory/DirectoryContext");

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

        await waitFor(() => expect(screen.getByText(CLOSED_IDENTITY_LOC_ID)).toBeVisible());
    })

    it("detects matching file", async () => await fileUploadTest(UNPREFIXED_FILE_HASH, "positive"))

    it("does not detect unknown file", async () => await fileUploadTest("43", "negative"))
})

async function fileUploadTest(hash: string, expectedResult: string) {
    setParams({locId: CLOSED_IDENTITY_LOC_ID});
        setSearchParams({
            has: () => false
        });

        sha256Hex.mockReturnValue(Promise.resolve(hash));

        render(<Certificate/>);

        let upload: HTMLElement | undefined = undefined;
        await waitFor(() => upload = screen.getByTestId("FileSelectorButtonHiddenInput"));
        userEvent.upload(upload!, new File([''], "some-file"));

        let result: HTMLElement | undefined = undefined;
        await waitFor(() => result = screen.getByText("Check result:"));

        expect(getByText(result!, expectedResult)).toBeVisible();
}
