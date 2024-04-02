import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Button from "src/common/Button";
import { useCommonContext } from "src/common/CommonContext";
import { invitedContributorsPath as legalOfficerInvitedContributorsPath } from "src/legal-officer/LegalOfficerPaths";
import { useLocContext } from "../LocContext";
import { invitedContributorsPath as requesterInvitedContributorsPath } from "src/wallet-user/UserPaths";

export default function InvitedContributorsButton() {
    const { viewer } = useCommonContext();
    const { loc } = useLocContext();
    const navigate = useNavigate();

    const invitedContributorsUrl = useMemo(() => {
        if(!loc) {
            return "";
        }
        if(viewer === "LegalOfficer") {
            return legalOfficerInvitedContributorsPath(loc.id);
        } else {
            return requesterInvitedContributorsPath(loc.id);
        }
    }, [ loc, viewer ]);

    return (
        <Button
            onClick={() => navigate(invitedContributorsUrl)}
        >
            Invited contributors
        </Button>
    );
}
