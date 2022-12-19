import { useCallback } from "react";
import Button from "src/common/Button";
import Frame from "src/common/Frame";
import { useLogionChain } from "src/logion-chain";
import { useLocContext } from "./LocContext";

export default function IdenfyVerification() {
    const { client, getOfficer } = useLogionChain();
    const { loc } = useLocContext();

    const verifyIdentityCallback = useCallback(async () => {
        const legalOfficer = getOfficer!(loc?.ownerAddress);
        const axios = client?.buildAxios(legalOfficer!);
        const response = await axios?.post(`/api/idenfy/verification-session/${ loc?.id.toString() }`);
        const redirect = response?.data.url;
        window.location.href = redirect;
    }, [ client, getOfficer, loc ]);

    return (
        <Frame
            className="DraftLocInstructions"
            title="iDenfy Identity Verification"
        >
            <p>Your logion Legal Officer accepts to verify your identity with iDenfy. Using iDenfy will accelerate the KYC process
                and automate the submission of public data and confidential documents.</p>

            <Button
                onClick={ verifyIdentityCallback }
            >
                Verify my identity using iDenfy
            </Button>
        </Frame>
    );
}
