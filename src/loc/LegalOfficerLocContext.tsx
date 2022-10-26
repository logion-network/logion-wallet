import { LegalOfficer, FetchAllLocsParams, LocsState } from "@logion/client";
import {
    UUID,
    LocType,
} from "@logion/node-api";
import { useLegalOfficerContext } from "../legal-officer/LegalOfficerContext";
import { LocContextProvider, useLocContext } from "./LocContext";

export type { FullVoidInfo, LinkTarget } from "./LocContext";

export interface Props {
    locId: UUID
    children: JSX.Element | JSX.Element[] | null
    backPath: string
    detailsPath: (locId: UUID, type: LocType) => string
}

export function fetchAllLocsParams(legalOfficer: LegalOfficer): FetchAllLocsParams {
    return {
        legalOfficers: [ legalOfficer ],
        spec: {
            ownerAddress: legalOfficer.address,
            locTypes: [ "Collection", "Identity", "Transaction" ],
            statuses: [ "CLOSED", "OPEN", "REJECTED", "REQUESTED" ]
        },
    };
};

export function LegalOfficerLocContextProvider(props: Props) {
    const { refreshLocs, legalOfficer, locsState } = useLegalOfficerContext();

    if(!legalOfficer || !locsState) {
        return null;
    }

    return (
        <LocContextProvider
            locState={ locsState.findById(props.locId) }
            backPath={ props.backPath }
            detailsPath={ props.detailsPath }
            refreshLocs={ async (newLocsState?: LocsState) => refreshLocs(newLocsState) }
            fetchAllLocsParams={ fetchAllLocsParams(legalOfficer) }
        >
            { props.children }
        </LocContextProvider>
    )
}

export { useLocContext as useLegalOfficerLocContext };
