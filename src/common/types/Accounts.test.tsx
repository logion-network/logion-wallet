import { DateTime } from 'luxon';
import { Token, AccountTokens } from "@logion/client";

describe("AccountTokens", () => {

    const now = DateTime.now();

    const ADDRESS_WITH_VALID_TOKEN = "1";
    
    const ADDRESS_WITH_EXPIRED_TOKEN = "2";

    const addresses = [ ADDRESS_WITH_VALID_TOKEN, ADDRESS_WITH_EXPIRED_TOKEN ];

    const tokensRecord: Record<string, Token> = {
        "1": {
            value: "token-valid",
            expirationDateTime: now.plus({ hours: 1 })
        },
        "2": {
            value: "token-expired",
            expirationDateTime: now.plus({ hours: -1 })
        }
    };

    const otherTokensRecord: Record<string, Token> = {
        "3": {
            value: "token-3",
            expirationDateTime: now.plus({ hours: 1 })
        }
    };

    it("exposes tokens", () => {
        const tokens = new AccountTokens(tokensRecord);
        expect(tokens.length).toBe(2);
        expect(tokens.addresses).toEqual(addresses);
        expect(tokens.get(ADDRESS_WITH_VALID_TOKEN)).toEqual(tokensRecord[ADDRESS_WITH_VALID_TOKEN]);
        expect(tokens.get(ADDRESS_WITH_EXPIRED_TOKEN)).toEqual(tokensRecord[ADDRESS_WITH_EXPIRED_TOKEN]);
    });

    it("merges", () => {
        const merged = new AccountTokens(tokensRecord).merge(new AccountTokens(otherTokensRecord));

        expect(merged.length).toBe(3);

        expect(merged.addresses).toContain(ADDRESS_WITH_VALID_TOKEN);
        expect(merged.addresses).toContain(ADDRESS_WITH_EXPIRED_TOKEN);
        expect(merged.addresses).toContain("3");

        expect(merged.get(ADDRESS_WITH_VALID_TOKEN)).toEqual(tokensRecord[ADDRESS_WITH_VALID_TOKEN]);
        expect(merged.get(ADDRESS_WITH_EXPIRED_TOKEN)).toEqual(tokensRecord[ADDRESS_WITH_EXPIRED_TOKEN]);
        expect(merged.get("3")).toEqual(otherTokensRecord["3"]);
    });

    it("cleanUps", () => {
        const tokens = new AccountTokens(tokensRecord).cleanUp(now);
        expect(tokens.length).toBe(1);
        expect(tokens.addresses).toContain(ADDRESS_WITH_VALID_TOKEN);
        expect(tokens.get(ADDRESS_WITH_VALID_TOKEN)).toEqual(tokensRecord[ADDRESS_WITH_VALID_TOKEN]);
    });

    it("detects same tokens deeply", () => {
        const tokens = new AccountTokens(tokensRecord);
        const otherTokens = new AccountTokens(tokensRecord);
        expect(tokens.equals(otherTokens)).toBe(true);
    });

    it("detects different tokens", () => {
        const tokens = new AccountTokens(tokensRecord);
        const otherTokens = new AccountTokens(otherTokensRecord);
        expect(tokens.equals(otherTokens)).toBe(false);
    });
});
