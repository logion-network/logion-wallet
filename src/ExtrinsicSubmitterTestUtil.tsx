import { SignAndSendCallback } from "./logion-chain/Signature";
import { signAndSend } from "./logion-chain/__mocks__/SignatureMock";

import { SignAndSubmit } from "./ExtrinsicSubmitter";

export function mockSignAndSubmit(onSuccessCallback: () => void): SignAndSubmit {
    return (setResult, setError) => {
        const callback: SignAndSendCallback = (signedTransaction) => {
            onSuccessCallback();
            setResult(signedTransaction)
        };
        return signAndSend({
            callback,
            errorCallback: setError
        })
    };
}
