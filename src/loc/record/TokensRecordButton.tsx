import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Button from "src/common/Button";
import { useCommonContext } from "src/common/CommonContext";
import Icon from "src/common/Icon";
import { tokensRecordPath } from "src/legal-officer/LegalOfficerPaths";
import { useLocContext } from "../LocContext";
import { ContributionMode } from "../types";
import { tokensRecordPath as requesterTokensRecordPath, issuerTokensRecordPath } from "src/wallet-user/UserRouter";

export default function TokensRecordButton(props: { contributionMode?: ContributionMode }) {
    const { viewer } = useCommonContext();
    const { loc } = useLocContext();
    const navigate = useNavigate();

    const tokensRecordUrl = useMemo(() => {
        if(!loc) {
            return "";
        }
        if(viewer === "LegalOfficer") {
            return tokensRecordPath(loc.id);
        } else if(props.contributionMode === "Requester") {
            return requesterTokensRecordPath(loc.id);
        } else if(props.contributionMode === "Issuer") {
            return issuerTokensRecordPath(loc.id);
        } else {
            return "";
        }
    }, [ loc, viewer, props.contributionMode ]);

    return (
        <Button
            onClick={() => navigate(tokensRecordUrl)}
        >
            <Icon icon={{id: "records_white"}}/> Tokens record
        </Button>
    );
}
