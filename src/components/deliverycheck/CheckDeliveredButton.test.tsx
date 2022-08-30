import { render, waitFor } from "@testing-library/react";
import { AxiosInstance } from "axios";
import { setExpectedHash } from "src/common/__mocks__/HashMock";
import { CheckLatestDeliveryResponse } from "src/loc/FileModel";
import { uploadByTestId } from "src/tests";

import CheckDeliveredButton, { CheckResult, CheckResultType } from "./CheckDeliveredButton";

jest.mock("src/common/hash");

const locId = "eff6da24-1364-4594-965a-3b31f1e1df25";
const collectionItemId = "0x7411e1c74c64430ea9700cc695be6685";
const latestDeliveredFile = new File(["test"], "test.txt");
const originalHash = "0xf2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2";
const copyHash = "72685ddcbec5052f9db2523252407990c24bb94d43b478d1a22411e612f3b650";
const otherFile = new File(["test2"], "test.txt");
const otherHash = "7d6fd7774f0d87624da6dcf16d0d3d104c3191e771fbe2f39c86aed4b2bf1a0f";
const oldCopyFile = new File(["test3"], "test.txt");
const oldCopyHash = "ab03c34f1ece08211fe2a8039fd6424199b3f5d7b55ff13b1134b364776c45c5";

describe("CheckDeliveredButton", () => {

    it("finds match for unpriviledged user", async () => {
        await testFindsMatch(false);
    });

    it("finds match for priviledged user", async () => {
        await testFindsMatch(true);
    });

    it("fails finding match for unpriviledged user and not delivered", async () => {
        await testFindsNoMatch({
            privileged: false,
            file: otherFile,
            hash: otherHash,
            expectedLogionOrigin: CheckResultType.NEGATIVE,
        });
    });

    it("fails finding match for priviledged user and not delivered", async () => {
        await testFindsNoMatch({
            privileged: true,
            file: otherFile,
            hash: otherHash,
            expectedLogionOrigin: CheckResultType.NEGATIVE,
        });
    });

    it("fails finding match for unpriviledged user and old copy", async () => {
        await testFindsNoMatch({
            privileged: false,
            file: oldCopyFile,
            hash: oldCopyHash,
            expectedLogionOrigin: CheckResultType.NEGATIVE,
        });
    });

    it("fails finding match for priviledged user and old copy", async () => {
        await testFindsNoMatch({
            privileged: true,
            file: oldCopyFile,
            hash: oldCopyHash,
            expectedLogionOrigin: CheckResultType.POSITIVE,
        });
    });
});

async function testFindsMatch(privileged: boolean) {
    const { onChecking, onChecked, axiosFactory } = given(privileged, copyHash);

    render(<CheckDeliveredButton
        collectionLocId={ locId }
        itemId={ collectionItemId }
        axiosFactory={ axiosFactory }
        onChecking={ onChecking }
        onChecked={ onChecked }
        privilegedUser={ privileged }
    />);

    await uploadByTestId("FileSelectorButtonHiddenInput", latestDeliveredFile);

    expect(onChecking).toBeCalledTimes(1);
    await waitFor(() => expect(onChecked).toBeCalledWith(expect.objectContaining({
        summary: CheckResultType.POSITIVE,
        match: expect.objectContaining({
            originalFileHash: originalHash,
            copyHash: `0x${ copyHash }`,
        })
    })));
    expect(onChecked).toBeCalledTimes(1);
}

function given(privileged: boolean, fileHash: string): { onChecking: () => void, onChecked: (result: CheckResult) => void, axiosFactory: () => AxiosInstance } {
    setExpectedHash(fileHash);
    const axiosFactory = mockAxiosFactory({
        collectionItemId,
        locId,
        copyHash,
        privileged,
    });
    const onChecking = jest.fn();
    const onChecked = jest.fn();
    return { onChecking, onChecked, axiosFactory };
}

function mockAxiosFactory(args: {
    locId: string,
    collectionItemId: string,
    privileged: boolean,
    copyHash: string,
}): () => AxiosInstance {
    const { locId, collectionItemId, privileged, copyHash } = args;

    let deliveries: CheckLatestDeliveryResponse[];
    if(privileged) {
        deliveries = [
            {
                copyHash: `0x${ copyHash }`,
                owner: "0x900edc98db53508e6742723988b872dd08cd09c2",
                generatedOn: "2022-08-25T07:27:46.128Z",
                belongsToCurrentOwner: true,
            },
            {
                copyHash: `0x${ oldCopyHash }`,
                owner: "0x900edc98db53508e6742723988b872dd08cd09c2",
                generatedOn: "2022-08-24T07:27:46.128Z",
                belongsToCurrentOwner: true,
            }
        ];
    } else {
        deliveries = [
            {
                copyHash: `0x${ copyHash }`,
                owner: "0x900edc98db53508e6742723988b872dd08cd09c2",
                generatedOn: "2022-08-25T07:27:46.128Z",
                belongsToCurrentOwner: true,
            }
        ];
    }

    const axiosInstance = {
        get: (url: string) => {
            let expectedUrl;
            if(privileged) {
                expectedUrl = `/api/collection/${ locId }/${ collectionItemId }/all-deliveries`;
            } else {
                expectedUrl = `/api/collection/${ locId }/${ collectionItemId }/latest-deliveries`;
            }
            if(url === expectedUrl) {
                return Promise.resolve({
                    data: {
                        [ originalHash ]: deliveries
                    }
                });
            } else {
                return Promise.reject();
            }
        }
    } as unknown as AxiosInstance;
    return jest.fn().mockReturnValue(axiosInstance);
}

async function testFindsNoMatch(args: {
    privileged: boolean,
    file: File,
    hash: string,
    expectedLogionOrigin: CheckResultType,
}) {
    const { privileged, file, hash, expectedLogionOrigin } = args;
    const { onChecking, onChecked, axiosFactory } = given(privileged, hash);

    render(<CheckDeliveredButton
        collectionLocId={ locId }
        itemId={ collectionItemId }
        axiosFactory={ axiosFactory }
        onChecking={ onChecking }
        onChecked={ onChecked }
        privilegedUser={ privileged }
    />);

    await uploadByTestId("FileSelectorButtonHiddenInput", file);

    expect(onChecking).toBeCalledTimes(1);
    await waitFor(() => expect(onChecked).toBeCalledWith(expect.objectContaining({
        summary: CheckResultType.NEGATIVE,
        logionOrigin: expectedLogionOrigin,
    })));
    expect(onChecked).toBeCalledTimes(1);
}
