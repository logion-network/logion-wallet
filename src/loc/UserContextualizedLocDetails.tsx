import { LegalOfficer } from "@logion/client";
import { useEffect, useState } from "react";
import { useLogionChain } from "../logion-chain";

import CheckFileFrame from 'src/components/checkfileframe/CheckFileFrame';
import CertificateAndLimits from "./CertificateAndLimits";
import { UserCollectionLocItemChecker } from "./CollectionLocItemChecker";
import ItemImporter from "./ItemImporter";
import { useUserLocContext } from "./UserLocContext";
import LocPane from "./LocPane";
import LocDetailsTab from "./LocDetailsTab";
import VoidDisclaimer from "./VoidDisclaimer";
import SupersedesDisclaimer from "./SupersedesDisclaimer";

export default function UserContextualizedLocDetails() {
    const { getOfficer } = useLogionChain();
    const [ legalOfficer, setLegalOfficer ] = useState<LegalOfficer | null>(null)
    const {
        backPath,
        detailsPath,
        locState,
        loc,
        supersededLoc,
        locItems,
        deleteMetadata,
        deleteFile,
        addMetadata,
        addFile,
        checkHash,
        checkResult,
        collectionItem,
    } = useUserLocContext();

    useEffect(() => {
        if (legalOfficer === null && loc) {
            const owner = getOfficer!(loc.ownerAddress);
            if(owner !== undefined) {
                setLegalOfficer(owner);
            }
        }
    }, [ legalOfficer, loc, getOfficer, setLegalOfficer ])

    if (loc === null || locState === null) {
        return null;
    }

    return (
        <LocPane
            backPath={ backPath }
            loc={ loc }
            locState={ locState }
        >
            <LocDetailsTab
                loc={ loc }
                locState={ locState }
                locItems={ locItems }
                addFile={ addFile }
                addMetadata={ addMetadata }
                checkResult={ checkResult }
                deleteFile={ deleteFile }
                deleteLink={ null }
                deleteMetadata={ deleteMetadata }
                viewer="User"
                detailsPath={ detailsPath }
            />
            <VoidDisclaimer
                loc={ loc }
                detailsPath={ detailsPath }
            />
            <CertificateAndLimits
                locId={ loc.id }
                loc={ loc }
                viewer="User"
            />
            { loc.locType === 'Collection' && loc.closed &&
                <UserCollectionLocItemChecker
                    locId={ loc.id }
                    locOwner={ loc.ownerAddress }
                    collectionItem={ collectionItem }
                />
            }
            { loc.locType === 'Collection' && loc.closed && loc.voidInfo === undefined &&
                <ItemImporter />
            }
            <SupersedesDisclaimer
                loc={ loc }
                detailsPath={ detailsPath }
                supersededLoc={ supersededLoc }
            />
            <CheckFileFrame
                checkHash={ checkHash }
                checkResult={ checkResult.result }
            />
        </LocPane>
    );
}
