import { LocContextProvider } from "./LocContext";
import ContextualizedLocDetails from "./ContextualizedLocDetails";
import { UUID } from "../../logion-chain/UUID";
import { useParams } from "react-router";
import { useLocation } from "react-router-dom";

export interface Props {
    backPath: string,
}

export default function LocDetails(props: Props) {
    const locId: UUID = new UUID(useParams<{ locId: string }>().locId);
    const otherLocId = new URLSearchParams(useLocation().search).get("otherLocId")

    return (
        <LocContextProvider locId={ locId }>
            <ContextualizedLocDetails backPath={ props.backPath } otherLocId={ otherLocId ? new UUID(otherLocId) : undefined } />
        </LocContextProvider>
    )
}
