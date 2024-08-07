import { AccountTokens } from '@logion/client';
import { DateTime } from 'luxon';
import {
    storeTokens,
    clearTokens,
    loadTokens
} from './Storage';
import { api } from 'src/__mocks__/LogionMock';

jest.unmock('@logion/client');
jest.unmock('@logion/node-api');

describe("Tokens storage", () => {

    it("stores tokens", () => {
        const expirationDateTime = "2021-09-09T11:28:00.000Z";
        const tokens = new AccountTokens(
            api.object(),
            {
                "Polkadot:vQxHAE33LeJYV69GCB4o4YcCgnDu8y99u5hy2751fRdxjX9kz": {
                    value: "token-vQxHAE33LeJYV69GCB4o4YcCgnDu8y99u5hy2751fRdxjX9kz",
                    expirationDateTime: DateTime.fromISO(expirationDateTime, {zone: 'utc'})
                }
            }
        );

        storeTokens(tokens);

        expect(JSON.parse(window.localStorage["token.Polkadot:vQxHAE33LeJYV69GCB4o4YcCgnDu8y99u5hy2751fRdxjX9kz"])).toEqual({
            value: "token-vQxHAE33LeJYV69GCB4o4YcCgnDu8y99u5hy2751fRdxjX9kz",
            expirationDateTime
        });
    });

    it("clears tokens", () => {
        const expirationDateTime = "2021-09-09T11:28:00.000Z";
        const tokens = new AccountTokens(
            api.object(),
            {
                "Polkadot:vQxHAE33LeJYV69GCB4o4YcCgnDu8y99u5hy2751fRdxjX9kz": {
                    value: "token-vQxHAE33LeJYV69GCB4o4YcCgnDu8y99u5hy2751fRdxjX9kz",
                    expirationDateTime: DateTime.fromISO(expirationDateTime, {zone: 'utc'})
                }
            }
        );
        storeTokens(tokens);

        clearTokens();

        expect(window.localStorage.length).toBe(0);
    });

    it("loads tokens", () => {
        const expirationDateTime = "2021-09-09T11:28:00.000Z";
        const tokens = new AccountTokens(
            api.object(),
            {
                "Polkadot:vQxHAE33LeJYV69GCB4o4YcCgnDu8y99u5hy2751fRdxjX9kz": {
                    value: "token-vQxHAE33LeJYV69GCB4o4YcCgnDu8y99u5hy2751fRdxjX9kz",
                    expirationDateTime: DateTime.fromISO(expirationDateTime)
                }
            }
        );
        storeTokens(tokens);

        const loadedTokens = loadTokens(api.object());

        expect(loadedTokens).toEqual(tokens);
    });

    it("loads only valid tokens", () => {
        const expirationDateTime = "2021-09-09T11:28:00.000Z";
        const tokens = new AccountTokens(
            api.object(),
            {
                "Polkadot:vQxHAE33LeJYV69GCB4o4YcCgnDu8y99u5hy2751fRdxjX9kz": {
                    value: "token-vQxHAE33LeJYV69GCB4o4YcCgnDu8y99u5hy2751fRdxjX9kz",
                    expirationDateTime: DateTime.fromISO(expirationDateTime)
                }
            }
        );
        storeTokens(tokens);
        window.localStorage.setItem("token.def", "invalid json");

        const loadedTokens = loadTokens(api.object());

        expect(loadedTokens).toEqual(tokens);
    });

    afterEach(() => {
        window.localStorage.clear();
    });
});
