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

    return (
        <LocContextProvider
            locId={ props.locId }
            backPath={ props.backPath }
            detailsPath={ props.detailsPath }
            refreshLocs={ (newLocsState?: LocsState) => newLocsState ? mutateLocsState(() => Promise.resolve(newLocsState)) : mutateLocsState(async () => await locsState!.refresh()) }
        >
            { props.children }
        </LocContextProvider>
    )
}

export { useLocContext as useUserLocContext };
