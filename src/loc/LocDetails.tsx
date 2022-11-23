import { useParams } from "react-router";
import { UUID } from "@logion/node-api/dist/UUID";
import { LocType } from "@logion/node-api/dist/Types";

import ContextualizedLocDetails from "./ContextualizedLocDetails";
import { UserLocContextProvider } from "./UserLocContext";
import UserContextualizedLocDetails from "./UserContextualizedLocDetails";
import { LegalOfficerLocContextProvider } from "./LegalOfficerLocContext";
import { ContributionMode } from "./types";

export interface LocDetailsProps {
    backPath: string;
    detailsPath: (locId: UUID, type: LocType) => string;
}

export default function LocDetails(props: LocDetailsProps) {
    const locId: UUID = new UUID(useParams<"locId">().locId);
    return (
        <LegalOfficerLocContextProvider
            locId={ locId }
            backPath={ props.backPath }
            detailsPath={ props.detailsPath }
        >
            <ContextualizedLocDetails />
        </LegalOfficerLocContextProvider>
    )
}

export interface UserLocDetailsProps extends LocDetailsProps {
    contributionMode: ContributionMode
}

export function UserLocDetails(props: UserLocDetailsProps) {
    const locId: UUID = new UUID(useParams<"locId">().locId);
    return (
        <UserLocContextProvider
            locId={ locId }
            backPath={ props.backPath }
            detailsPath={ props.detailsPath }
        >
            <UserContextualizedLocDetails
                contributionMode={ props.contributionMode }
            />
        </UserLocContextProvider>
    )
}
