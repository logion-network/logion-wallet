import { useParams } from "react-router";
import { UUID } from "@logion/node-api/dist/UUID";
import { LocType } from "@logion/node-api/dist/Types";

import ContextualizedLocDetails from "./ContextualizedLocDetails";
import { UserLocContextProvider } from "./UserLocContext";
import UserContextualizedLocDetails from "./UserContextualizedLocDetails";
import { LegalOfficerLocContextProvider } from "./LegalOfficerLocContext";
import { Viewer } from "src/common/CommonContext";

export interface Props {
    backPath: string;
    detailsPath: (locId: UUID, type: LocType) => string;
    viewer: Viewer;
}

export default function LocDetails(props: Props) {
    const locId: UUID = new UUID(useParams<"locId">().locId);

    if (props.viewer === "LegalOfficer") {
        return (
            <LegalOfficerLocContextProvider
                locId={ locId }
                backPath={ props.backPath }
                detailsPath={ props.detailsPath }
            >
                <ContextualizedLocDetails/>
            </LegalOfficerLocContextProvider>
        )
    } else {
        return (
            <UserLocContextProvider
                locId={ locId }
                backPath={ props.backPath }
                detailsPath={ props.detailsPath }
            >
                <UserContextualizedLocDetails/>
            </UserLocContextProvider>
        )
    }
}
