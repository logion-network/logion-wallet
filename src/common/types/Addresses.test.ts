import moment from 'moment';
import { Token, AccountTokens } from "./Addresses";

describe("AccountTokens", () => {

    const now = moment();

    const ADDRESS_WITH_VALID_TOKEN = "1";
    
    const ADDRESS_WITH_EXPIRED_TOKEN = "2";

    const addresses = [ ADDRESS_WITH_VALID_TOKEN, ADDRESS_WITH_EXPIRED_TOKEN ];

    const tokensRecord: Record<string, Token> = {
        "1": {
            value: "token-valid",
            expirationDateTime: now.clone().add(1, "hour")
        },
        "2": {
            value: "token-expired",
            expirationDateTime: now.clone().add(-1, "hour")
        }
    };

    const otherTokensRecord: Record<string, Token> = {
        "3": {
            value: "token-3",
            expirationDateTime: now.clone().add(1, "hour")
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

    it("refreshes", () => {
        const tokens = new AccountTokens(tokensRecord).refresh(now);
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
