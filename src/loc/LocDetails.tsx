import { useParams } from "react-router";
import { UUID } from "logion-api/dist/UUID";
import { LocType } from "logion-api/dist/Types";

import { LocContextProvider } from "./LocContext";
import ContextualizedLocDetails from "./ContextualizedLocDetails";
import { Viewer } from "./types";

export interface Props {
    backPath: string;
    detailsPath: (locId: UUID, type: LocType) => string;
    viewer: Viewer;
}

export default function LocDetails(props: Props) {
    const locId: UUID = new UUID(useParams<"locId">().locId);

    return (
        <LocContextProvider
            locId={ locId }
            backPath={ props.backPath }
            detailsPath={ props.detailsPath }
        >
            <ContextualizedLocDetails viewer={ props.viewer } />
        </LocContextProvider>
    )
}
