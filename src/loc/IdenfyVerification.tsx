import { DraftRequest } from "@logion/client";
import { useCallback } from "react";
import Button from "src/common/Button";
import Frame from "src/common/Frame";
import { useLocContext } from "./LocContext";
import { resumeAfterIDenfyProcessUrl } from "../wallet-user/UserRouter";

export default function IdenfyVerification() {
    const { loc, mutateLocState } = useLocContext();

    const verifyIdentityCallback = useCallback(async () => {
        mutateLocState(async current => {
            if(loc && current instanceof DraftRequest) {
                if(current.isIDenfySessionInProgress()) {
                    window.location.href = current.iDenfySessionUrl;
                    return current;
                } else {
                    const newState = await current.startNewIDenfySession({
                        successUrl: resumeAfterIDenfyProcessUrl("success", loc.id),
                        errorUrl: resumeAfterIDenfyProcessUrl("error", loc.id),
                        unverifiedUrl: resumeAfterIDenfyProcessUrl("unverified", loc.id),
                    });
                    window.location.href = newState.iDenfySessionUrl;
                    return newState;
                }
            } else {
                return current;
            }
        });
    }, [ loc, mutateLocState ]);

    return (
        <Frame
            className="DraftLocInstructions"
            title="iDenfy Identity Verification"
        >
            <p>Your logion Legal Officer accepts to verify your identity with iDenfy. Using iDenfy will accelerate the KYC process
                and automate the submission of public data and confidential documents.</p>

            <p>The result of an iDenfy identity verification is communicated automatically by iDenfy and will appear in the form of confidential documents
                added to this LOC. However, this process is not real-time so you may have to wait a couple of minutes after you completed the session before
                the session is actually detected as ended and the files appear in your LOC.
            </p>

            {
                loc?.iDenfy?.redirectUrl !== undefined &&
                <p><strong>We detected that an identity verification session is already in progress.</strong> You will be able to cancel or submit your request
                once the session ends.
                </p>
            }

            <Button
                onClick={ verifyIdentityCallback }
            >
                {
                    loc?.iDenfy?.redirectUrl !== undefined && "Resume identity verification"
                }
                {
                    loc?.iDenfy?.redirectUrl === undefined && "Verify my identity using iDenfy"
                }
            </Button>
        </Frame>
    );
}
