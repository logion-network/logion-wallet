import { UUID } from "@logion/node-api";
import { useParams } from "react-router-dom";
import { locDetailsPath } from "src/legal-officer/LegalOfficerPaths";
import { VTP_PATH } from "src/wallet-user/UserRouter";
import { LegalOfficerLocContextProvider } from "../LegalOfficerLocContext";
import { useLocContext } from "../LocContext";
import LocPane from "../LocPane";
import { ContributionMode } from "../types";
import { UserLocContextProvider } from "../UserLocContext";
import TokensRecordFrame from "./TokensRecordFrame";

export interface Props {
    contributionMode?: ContributionMode;
}

export default function TokensRecordPane(props: Props) {
    const { loc, backPath } = useLocContext();

    return (
        <LocPane
            loc={ loc }
            backPath={ backPath }
            contributionMode={ props.contributionMode }
        >
            <TokensRecordFrame/>
        </LocPane>
    );
}

export function LegalOfficerTokensRecordPane() {
    const locId = new UUID(useParams<"locId">().locId);
    return (
        <LegalOfficerLocContextProvider
            locId={ locId }
            backPath={ locDetailsPath(locId, "Collection") }
            detailsPath={ locDetailsPath }
        >
            <TokensRecordPane/>
        </LegalOfficerLocContextProvider>
    )
}

export function UserTokensRecordPane(props: { contributionMode: ContributionMode }) {
    const locId = new UUID(useParams<"locId">().locId);
    const backPath = props.contributionMode === "Requester" ? locDetailsPath(locId, "Collection") : VTP_PATH;

    return (
        <UserLocContextProvider
            locId={ locId }
            backPath={ backPath }
            detailsPath={ locDetailsPath }
        >
            <TokensRecordPane contributionMode={props.contributionMode}/>
        </UserLocContextProvider>
    )
}
