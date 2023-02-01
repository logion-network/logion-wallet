import { UUID, LocType } from "@logion/node-api";
import { useParams } from "react-router";
import { LegalOfficerLocContextProvider } from "../LegalOfficerLocContext";
import VTPSelectionPane from "./VTPSelectionPane";

export interface Props {
    detailsPath: (locId: UUID, type: LocType) => string;
    locType: LocType;
}

export default function VTPSelection(props: Props) {

    const locId: UUID = new UUID(useParams<"locId">().locId);

    return (
        <LegalOfficerLocContextProvider
            locId={ locId }
            backPath={ props.detailsPath(locId, props.locType) }
            detailsPath={ props.detailsPath }
        >
            <VTPSelectionPane/>
        </LegalOfficerLocContextProvider>
    )
}
