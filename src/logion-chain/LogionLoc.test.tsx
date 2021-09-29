jest.mock('@polkadot/api');
jest.mock('./Signature');

import { stringToHex } from '@polkadot/util';
import { setSignAndSend } from './__mocks__/SignatureMock';
import { ApiPromise } from '@polkadot/api';
import { createLoc, addMetadata, getLegalOfficerCase } from './LogionLoc';
import { UUID } from './UUID';
import { DEFAULT_LOC } from '../__mocks__/PolkadotApiMock';

describe("LogionLoc", () => {

    it("submits createLoc extrinsic", () => {
        const api = new ApiPromise();
        const callback = jest.fn();
        const errorCallback = jest.fn();

        const signAndSend = jest.fn();
        setSignAndSend(signAndSend);

        const requester = "requester";

        const locId = new UUID();
        createLoc({
            api,
            signerId: "signerId",
            callback,
            errorCallback,
            locId,
            requester,
        });

        expect(signAndSend).toBeCalledWith(
            expect.objectContaining({
                signerId: "signerId",
                callback,
                errorCallback,
            }),
        );

        expect(api.tx.logionLoc.createLoc).toBeCalledWith(locId.toHexString(), requester);
    });

    it("submits addMetadata extrinsic", () => {
        const api = new ApiPromise();
        const callback = jest.fn();
        const errorCallback = jest.fn();

        const signAndSend = jest.fn();
        setSignAndSend(signAndSend);

        const item = {
            name: "a_name",
            value: "a_value",
        };

        const locId = new UUID();
        addMetadata({
            api,
            signerId: "signerId",
            callback,
            errorCallback,
            locId,
            item,
        });

        expect(signAndSend).toBeCalledWith(
            expect.objectContaining({
                signerId: "signerId",
                callback,
                errorCallback,
            }),
        );

        expect(api.tx.logionLoc.addMetadata).toBeCalledWith(locId.toHexString(), expect.objectContaining({
            name: stringToHex(item.name),
            value: stringToHex(item.value)
        }));
    });

    it("fetches Logion Legal Officer Case", async () => {
        const api = new ApiPromise();
        const locId = new UUID();

        const loc = await getLegalOfficerCase({
            api,
            locId
        });

        expect(loc).toEqual(DEFAULT_LOC);
    });
});
