import { AccountTokens } from '@logion/client';
import { DateTime } from 'luxon';
import {
    storeTokens,
    clearTokens,
    loadTokens
} from './Storage';
import { mockSimpleApi } from "../__mocks__/@logion/node-api/Mocks";

jest.unmock('@logion/client');
jest.unmock('@logion/node-api');

describe("Tokens storage", () => {

    it("stores tokens", () => {
        const expirationDateTime = "2021-09-09T11:28:00.000Z";
        const tokens = new AccountTokens(
            mockSimpleApi(),
            {
                "Polkadot:abc": {
                    value: "token-abc",
                    expirationDateTime: DateTime.fromISO(expirationDateTime, {zone: 'utc'})
                }
            }
        );

        storeTokens(tokens);

        expect(JSON.parse(window.localStorage["token.Polkadot:abc"])).toEqual({
            value: "token-abc",
            expirationDateTime
        });
    });

    it("clears tokens", () => {
        const expirationDateTime = "2021-09-09T11:28:00.000Z";
        const tokens = new AccountTokens(
            mockSimpleApi(),
            {
                "Polkadot:abc": {
                    value: "token-abc",
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
        const api = mockSimpleApi();
        const tokens = new AccountTokens(
            api,
            {
                "Polkadot:abc": {
                    value: "token-abc",
                    expirationDateTime: DateTime.fromISO(expirationDateTime)
                }
            }
        );
        storeTokens(tokens);

        const loadedTokens = loadTokens(api);

        expect(loadedTokens).toEqual(tokens);
    });

    it("loads only valid tokens", () => {
        const expirationDateTime = "2021-09-09T11:28:00.000Z";
        const api = mockSimpleApi();
        const tokens = new AccountTokens(
            api,
            {
                "Polkadot:abc": {
                    value: "token-abc",
                    expirationDateTime: DateTime.fromISO(expirationDateTime)
                }
            }
        );
        storeTokens(tokens);
        window.localStorage.setItem("token.def", "invalid json");

        const loadedTokens = loadTokens(api);

        expect(loadedTokens).toEqual(tokens);
    });

    afterEach(() => {
        window.localStorage.clear();
    });
});
