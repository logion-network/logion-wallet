import moment from 'moment';
import { AxiosInstance } from 'axios';
import { AccountTokens, Token } from "./types/Accounts";
import { sign } from '../logion-chain/Signature';
import { toIsoString, fromIsoString } from '../logion-chain/datetime';

interface AuthenticationSignature {
    signature: string;
    signedOn: string;
}

type AuthenticationResponse = Record<string, { value: string, expiredOn: string }>;

export async function authenticate(axios: AxiosInstance, addresses: string[]): Promise<AccountTokens> {
    const signInResponse = await axios.post("/api/auth/sign-in", { addresses });
    const sessionId = signInResponse.data.sessionId;
    const attributes = [ sessionId ];

    const signatures: Record<string, AuthenticationSignature> = {};
    for(const address of addresses) {
        const signedOn = moment();
        const signature = await sign({
            signerId: address,
            resource: 'authentication',
            operation: 'login',
            signedOn,
            attributes,
        });
        signatures[address] = {
            signature,
            signedOn: toIsoString(signedOn)
        };
    }

    const authenticateResponse = await axios.post(`/api/auth/${sessionId}/authenticate`, {
        signatures
    });
    const authenticatedAddresses: AuthenticationResponse = authenticateResponse.data.tokens;

    const tokens: Record<string, Token> = {};
    for(const authenticatedAddress of Object.keys(authenticatedAddresses)) {
        tokens[authenticatedAddress] = {
            value: authenticatedAddresses[authenticatedAddress].value,
            expirationDateTime: fromIsoString(authenticatedAddresses[authenticatedAddress].expiredOn)
        }
    }
    return new AccountTokens(tokens);
}