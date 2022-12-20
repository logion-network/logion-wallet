import { useCallback } from "react";
import Button from "src/common/Button";
import Frame from "src/common/Frame";
import { useLogionChain } from "src/logion-chain";
import { useLocContext } from "./LocContext";

export default function IdenfyVerification() {
    const { client, getOfficer } = useLogionChain();
    const { loc } = useLocContext();

    const verifyIdentityCallback = useCallback(async () => {
        let redirect: string;
        if(loc?.iDenfy?.redirectUrl) {
            redirect = loc.iDenfy.redirectUrl;
        } else {
            const legalOfficer = getOfficer!(loc?.ownerAddress);
            const axios = client?.buildAxios(legalOfficer!);
            const response = await axios?.post(`/api/idenfy/verification-session/${ loc?.id.toString() }`);
            redirect = response?.data.url;
        }
        window.location.href = redirect;
    }, [ client, getOfficer, loc ]);

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
