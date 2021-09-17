jest.mock('@polkadot/api');
jest.mock('./Signature');

import { setSignAndSend } from './__mocks__/SignatureMock';
import { ApiPromise } from '@polkadot/api';
import { createLoc } from './LogionLOC';
import { UUID } from './UUID';

describe("LogionLOC", () => {

    it("submits createLoc extrinsic", () => {
        const api = new ApiPromise();
        const callback = jest.fn();
        const errorCallback = jest.fn();

        const signAndSend = jest.fn();
        setSignAndSend(signAndSend);

        const locId = new UUID();
        createLoc({
            api,
            signerId: "signerId",
            callback,
            errorCallback,
            locId,
        });

        expect(signAndSend).toBeCalledWith(
            expect.objectContaining({
                signerId: "signerId",
                callback,
                errorCallback,
            })
        );

        expect(api.tx.logionLoc.createLoc).toBeCalledWith(locId.toHexString());
    });
});
