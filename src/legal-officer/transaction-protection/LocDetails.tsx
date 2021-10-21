import { LocContextProvider } from "./LocContext";
import ContextualizedLocDetails from "./ContextualizedLocDetails";
import { UUID } from "../../logion-chain/UUID";
import { useParams } from "react-router";

export interface Props {
    backPath: string,
}

export default function LocDetails(props: Props) {
    const locId: UUID = new UUID(useParams<{ locId: string }>().locId);

    return (
        <LocContextProvider locId={ locId }>
            <ContextualizedLocDetails backPath={ props.backPath } />
        </LocContextProvider>
    )
}
