import { useMemo } from "react";

import { useLocContext } from "./LocContext";
import CheckFileFrame from 'src/components/checkfileframe/CheckFileFrame';
import CertificateAndDetailsButtons from "./CertificateAndDetailsButtons";
import { LOCollectionLocItemChecker } from "./CollectionLocItemChecker";
import LocPane from "./LocPane";
import LocDetailsTab from "./LocDetailsTab";
import VoidDisclaimer from "./VoidDisclaimer";
import LegalOfficerInstructions from "./LegalOfficerInstructions";
import SupersedesDisclaimer from "./SupersedesDisclaimer";
import VoidFrame from "./VoidFrame";
import AcceptRejectLocRequest from "./AcceptRejectLocRequest";
import { locRequestsPath } from "src/legal-officer/LegalOfficerPaths";
import { ReadOnlyLocState } from "@logion/client";

export default function ContextualizedLocDetails() {
    const {
        backPath,
        detailsPath,
        locState,
        loc,
        supersededLoc,
        locItems,
        checkHash,
        checkResult,
        collectionItem,
    } = useLocContext();

    const isReadOnly = useMemo(() => {
        return locState !== null && locState instanceof ReadOnlyLocState;
    }, [ locState ]);

    if (loc === null || locState === null) {
        return null;
    }

    return (
        <LocPane
            backPath={ backPath }
            loc={ loc }
        >
            <LegalOfficerInstructions
                loc={ loc }
                locState={ locState }
                detailsPath={ detailsPath }
            />
            <LocDetailsTab
                loc={ loc }
                locState={ locState }
                locItems={ locItems }
                checkResult={ checkResult }
                viewer="LegalOfficer"
                detailsPath={ detailsPath }
            />
            <VoidDisclaimer
                loc={ loc }
                detailsPath={ detailsPath }
            />
            {
                loc.status !== "REVIEW_PENDING" &&
                <CertificateAndDetailsButtons
                    loc={ loc }
                    viewer="LegalOfficer"
                    isReadOnly={ isReadOnly }
                />
            }
            {
                loc.status === "REVIEW_PENDING" &&
                <AcceptRejectLocRequest
                    loc={ loc }
                    noLocCreationPath={ locRequestsPath(loc.locType) }
                />
            }
            { loc.locType === 'Collection' && loc.status === "CLOSED" &&
                <LOCollectionLocItemChecker
                    collectionLoc={ loc }
                    collectionItem={ collectionItem }
                />
            }
            <SupersedesDisclaimer
                loc={ loc }
                detailsPath={ detailsPath }
                supersededLoc={ supersededLoc }
            />
            <CheckFileFrame
                checkHash={ checkHash }
                checkResult={ checkResult.result }
                context={ loc.locType + " LOC" }
                checkedItem="confidential document"
            />
            {
                (loc.status === "OPEN" || loc.status === "CLOSED") && !isReadOnly &&
                <VoidFrame
                    loc={ loc }
                />
            }
        </LocPane>
    );
}
