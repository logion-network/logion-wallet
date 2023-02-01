import { useParams } from "react-router";
import { UUID, LocType } from "@logion/node-api";

import { UserLocContextProvider } from "./UserLocContext";
import { LegalOfficerLocContextProvider } from "./LegalOfficerLocContext";
import DashboardCertificate from "./DashboardCertificate";
import { Viewer } from "src/common/CommonContext";

export interface Props {
    detailsPath: (locId: UUID, type: LocType) => string;
    viewer: Viewer;
    locType: LocType;
}

export default function DashboardCertiticateRouter(props: Props) {
    const locId: UUID = new UUID(useParams<"locId">().locId);

    if (props.viewer === "LegalOfficer") {
        return (
            <LegalOfficerLocContextProvider
                locId={ locId }
                backPath={ props.detailsPath(locId, props.locType) }
                detailsPath={ props.detailsPath }
            >
                <DashboardCertificate/>
            </LegalOfficerLocContextProvider>
        )
    } else {
        return (
            <UserLocContextProvider
                locId={ locId }
                backPath={ props.detailsPath(locId, props.locType) }
                detailsPath={ props.detailsPath }
            >
                <DashboardCertificate/>
            </UserLocContextProvider>
        )
    }
}
