import { CheckCertifiedCopyResult, CollectionItem, ItemDeliveryMatch, CheckResultType } from "@logion/client";
import { render, waitFor } from "@testing-library/react";
import { setExpectedHash } from "src/common/__mocks__/HashMock";
import { uploadByTestId } from "src/tests";

import CheckDeliveredButton from "./CheckDeliveredButton";

jest.mock("src/common/hash");

const deliveredFile = new File([ "test" ], "test.txt");
const copyHash = "f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2";
const otherHash = "7d6fd7774f0d87624da6dcf16d0d3d104c3191e771fbe2f39c86aed4b2bf1a0f";

const matchFoundResult: CheckCertifiedCopyResult = {
    match: {} as ItemDeliveryMatch,
    summary: CheckResultType.POSITIVE,
    logionOrigin: CheckResultType.POSITIVE,
    nftOwnership: CheckResultType.POSITIVE,
    latest: CheckResultType.POSITIVE,
};

const matchNotFoundResult: CheckCertifiedCopyResult = {
    summary: CheckResultType.NEGATIVE,
    logionOrigin: CheckResultType.NEGATIVE,
    nftOwnership: CheckResultType.NEGATIVE,
    latest: CheckResultType.NEGATIVE,
};

describe("CheckDeliveredButton", () => {

    it("finds match", async () => {
        await testFindsMatch(copyHash, matchFoundResult);
    });

    it("fails finding match", async () => {
        await testFindsMatch(otherHash, matchNotFoundResult);
    });
});

async function testFindsMatch(hash: string, expectedResult: CheckCertifiedCopyResult) {
    const { onChecking, onChecked } = given(hash);

    render(<CheckDeliveredButton
        checkCertifiedCopy={ checkCertifiedCopy }
        onChecking={ onChecking }
        onChecked={ onChecked }
        buttonText="Check NFT Asset"
    />);

    await uploadByTestId("FileSelectorButtonHiddenInput", deliveredFile);

    expect(onChecking).toBeCalledTimes(1);
    await waitFor(() => expect(onChecked).toBeCalledWith(expectedResult));
    expect(onChecked).toBeCalledTimes(1);
}

function given(fileHash: string): { onChecking: () => void, onChecked: (result: CheckCertifiedCopyResult) => void } {
    setExpectedHash(fileHash);
    const onChecking = jest.fn();
    const onChecked = jest.fn();
    return { onChecking, onChecked };
}

function checkCertifiedCopy(hash: string) {
    if(hash === `0x${ copyHash }`) {
        return Promise.resolve(matchFoundResult);
    } else {
        return Promise.resolve(matchNotFoundResult);
    }
}
