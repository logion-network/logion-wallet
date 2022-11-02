import {
    UUID,
    LocType,
} from "@logion/node-api";
import { LocsState } from "@logion/client";
import { useUserContext } from "../wallet-user/UserContext";
import { LocContextProvider, useLocContext } from "./LocContext";

export interface Props {
    locId: UUID
    children: JSX.Element | JSX.Element[] | null
    backPath: string
    detailsPath: (locId: UUID, type: LocType) => string
}

export function UserLocContextProvider(props: Props) {
    const { mutateLocsState, locsState } = useUserContext();

    if(!locsState || locsState.discarded) {
        return null;
    }

    return (
        <LocContextProvider
            locState={ locsState.findById(props.locId) }
            backPath={ props.backPath }
            detailsPath={ props.detailsPath }
            refreshLocs={ (newLocsState: LocsState) => mutateLocsState(async () => newLocsState) }
        >
            { props.children }
        </LocContextProvider>
    )
}

export { useLocContext as useUserLocContext };
