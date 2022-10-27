import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import queryString from 'query-string';
import { ProtectionRequest } from "@logion/client/dist/RecoveryClient";

import { useLocContext } from "./LocContext";
import CheckFileFrame from 'src/components/checkfileframe/CheckFileFrame';
import CertificateAndLimits from "./CertificateAndLimits";
import { LOCollectionLocItemChecker } from "./CollectionLocItemChecker";
import { useLegalOfficerContext } from "../legal-officer/LegalOfficerContext";
import LocPane from "./LocPane";
import LocDetailsTab from "./LocDetailsTab";
import VoidDisclaimer from "./VoidDisclaimer";
import LegalOfficerInstructions from "./LegalOfficerInstructions";
import SupersedesDisclaimer from "./SupersedesDisclaimer";
import VoidFrame from "./VoidFrame";
import AcceptRejectLocRequest from "./AcceptRejectLocRequest";
import { locRequestsPath } from "src/legal-officer/LegalOfficerPaths";

export default function ContextualizedLocDetails() {
    const { pendingProtectionRequests, pendingRecoveryRequests } = useLegalOfficerContext();
    const location = useLocation();
    const {
        backPath,
        detailsPath,
        locState,
        loc,
        supersededLoc,
        locItems,
        deleteMetadata,
        deleteFile,
        deleteLink,
        addFile,
        checkHash,
        checkResult,
        collectionItem,
    } = useLocContext();
    const [ protectionRequest, setProtectionRequest ] = useState<ProtectionRequest | null | undefined>();

    useEffect(() => {
        if (location.search) {
            const params = queryString.parse(location.search);
            let requestId: string;
            let requests: ProtectionRequest[];
            if ('protection-request' in params) {
                requestId = params['protection-request'] as string;
                requests = pendingProtectionRequests!;
            } else if ('recovery-request' in params) {
                requestId = params['recovery-request'] as string;
                requests = pendingRecoveryRequests!;
            } else {
                requestId = "";
                requests = [];
            }

            if (protectionRequest === undefined || (protectionRequest !== null && requestId !== protectionRequest.id)) {
                const request = requests.find(request => request.id === requestId);
                if (request !== undefined) {
                    setProtectionRequest(request);
                } else {
                    setProtectionRequest(null);
                }
            }
        }
    }, [ location, pendingProtectionRequests, protectionRequest, setProtectionRequest, pendingRecoveryRequests ]);

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
                protectionRequest={ protectionRequest || null }
            />
            <LocDetailsTab
                loc={ loc }
                locState={ locState }
                locItems={ locItems }
                addFile={ addFile }
                checkResult={ checkResult }
                deleteFile={ deleteFile }
                deleteLink={ deleteLink }
                deleteMetadata={ deleteMetadata }
                viewer="LegalOfficer"
                detailsPath={ detailsPath }
                protectionRequest={ protectionRequest }
            />
            <VoidDisclaimer
                loc={ loc }
                detailsPath={ detailsPath }
            />
            {
                loc.status !== "REQUESTED" &&
                <CertificateAndLimits
                    loc={ loc }
                    viewer="LegalOfficer"
                />
            }
            {
                loc.status === "REQUESTED" &&
                <AcceptRejectLocRequest
                    loc={ loc }
                    rejectPath={ locRequestsPath(loc.locType) }
                />
            }
            { loc.locType === 'Collection' && loc.closed &&
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
                loc.status !== "REQUESTED" &&
                <VoidFrame
                    loc={ loc }
                />
            }
        </LocPane>
    );
}
