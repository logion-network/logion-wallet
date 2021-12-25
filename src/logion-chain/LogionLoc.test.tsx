jest.mock('@polkadot/api');
jest.mock('./Signature');

import { stringToHex } from '@polkadot/util';
import { setSignAndSend } from './__mocks__/SignatureMock';
import { ApiPromise } from '@polkadot/api';
import { createPolkadotTransactionLoc, addMetadata, getLegalOfficerCase, addFile } from './LogionLoc';
import { UUID } from './UUID';
import { DEFAULT_LOC } from '../__mocks__/PolkadotApiMock';

describe("LogionLoc", () => {

    it("submits createPolkadotTransactionLoc extrinsic", () => {
        const api = new ApiPromise();
        const callback = jest.fn();
        const errorCallback = jest.fn();

        const signAndSend = jest.fn();
        setSignAndSend(signAndSend);

        const requester = "requester";

        const locId = new UUID();
        createPolkadotTransactionLoc({
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

        expect(api.tx.logionLoc.createPolkadotTransactionLoc).toBeCalledWith(locId.toHexString(), requester);
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

        expect(loc!.owner).toEqual(DEFAULT_LOC.owner);
        expect(loc!.requesterAddress).toEqual(DEFAULT_LOC.requester);
        expect(loc!.metadata).toEqual(DEFAULT_LOC.metadata);
        expect(loc!.files).toEqual(DEFAULT_LOC.files);
        loc!.links.forEach((link, index) => {
            expect(link.id.toString()).toBe(DEFAULT_LOC.links[index].id.toString());
            expect(link.nature).toBe(DEFAULT_LOC.links[index].nature);
        });
        expect(loc!.closed).toEqual(DEFAULT_LOC.closed);
        expect(loc!.locType).toEqual(DEFAULT_LOC.locType);
    });

    it("submits addFile extrinsic", () => {
        const api = new ApiPromise();
        const callback = jest.fn();
        const errorCallback = jest.fn();

        const signAndSend = jest.fn();
        setSignAndSend(signAndSend);

        const hash = "0x91820202c3d0fea0c494b53e3352f1934bc177484e3f41ca2c4bca4572d71cd2";
        const nature = "file-nature";

        const locId = new UUID();
        addFile({
            api,
            signerId: "signerId",
            callback,
            errorCallback,
            locId,
            hash,
            nature,
        });

        expect(signAndSend).toBeCalledWith(
            expect.objectContaining({
                signerId: "signerId",
                callback,
                errorCallback,
            }),
        );

        expect(api.tx.logionLoc.addFile).toBeCalledWith(locId.toHexString(), {
            hash,
            nature: "0x66696c652d6e6174757265",
        });
    });
});
