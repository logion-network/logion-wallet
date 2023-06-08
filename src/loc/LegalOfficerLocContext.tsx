import { LegalOfficer, FetchAllLocsParams, LocsState, LocRequestState } from "@logion/client";
import {
    UUID,
    LocType,
} from "@logion/node-api";
import { useEffect, useState } from "react";
import { useLogionChain } from "src/logion-chain";
import { useLegalOfficerContext } from "../legal-officer/LegalOfficerContext";
import { LocContextProvider, useLocContext } from "./LocContext";

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
            statuses: [ "CLOSED", "OPEN", "REVIEW_REJECTED", "REVIEW_PENDING", "REVIEW_ACCEPTED" ]
        },
    };
}

export function LegalOfficerLocContextProvider(props: Props) {
    const { refreshLocs, legalOfficer, locsState } = useLegalOfficerContext();

    if(!legalOfficer || !locsState || locsState.discarded) {
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

export function VoterLocContextProvider(props: Props) {
    const { client } = useLogionChain();
    const [ locState, setLocState ] = useState<LocRequestState>();
    const [ fetching, setFetching ] = useState(false);

    useEffect(() => {
        if(client && !locState && !fetching) {
            setFetching(true);
            (async function() {
                const readOnlyLocState = await client.voter.findLocById(props.locId);
                if(readOnlyLocState) {
                    setLocState(readOnlyLocState);
                }
            })();
        }
    }, [ locState, fetching, props.locId, client ]);

    if(!client || !locState) {
        return null;
    }

    return (
        <LocContextProvider
            locState={ locState }
            backPath={ props.backPath }
            detailsPath={ props.detailsPath }
            refreshLocs={ async () => {} }
        >
            { props.children }
        </LocContextProvider>
    )
}

export { useLocContext as useLegalOfficerLocContext };
