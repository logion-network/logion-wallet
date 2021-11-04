import { LocContextProvider } from "./LocContext";
import ContextualizedLocDetails from "./ContextualizedLocDetails";
import { UUID } from "../../logion-chain/UUID";
import { useParams } from "react-router";

export default function LocDetails() {
    const locId: UUID = new UUID(useParams<{ locId: string }>().locId);

    return (
        <LocContextProvider locId={ locId }>
            <ContextualizedLocDetails />
        </LocContextProvider>
    )
}
