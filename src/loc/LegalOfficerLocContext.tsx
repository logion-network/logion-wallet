import {
    UUID,
    LocType,
} from "@logion/node-api";
import { useLegalOfficerContext } from "../legal-officer/LegalOfficerContext";
import { LocContextProvider, useLocContext } from "./LocContext";

export type { ActiveLoc, FullVoidInfo, LinkTarget } from "./LocContext";

export interface Props {
    locId: UUID
    children: JSX.Element | JSX.Element[] | null
    backPath: string
    detailsPath: (locId: UUID, type: LocType) => string
}

export function LegalOfficerLocContextProvider(props: Props) {
    const { refreshLocs } = useLegalOfficerContext();

    return (
        <LocContextProvider
            locId={ props.locId }
            backPath={ props.backPath }
            detailsPath={ props.detailsPath }
            refreshLocs={ async () => refreshLocs() }
        >
            { props.children }
        </LocContextProvider>
    )
}

export function useLegalOfficerLocContext() {
    return useLocContext();
}
