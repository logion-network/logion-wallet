import CheckFileFrame from 'src/components/checkfileframe/CheckFileFrame';
import CertificateAndLimits from "./CertificateAndLimits";
import { UserCollectionLocItemChecker } from "./CollectionLocItemChecker";
import ItemImporter from "./ItemImporter";
import { useUserLocContext } from "./UserLocContext";
import LocPane from "./LocPane";
import LocDetailsTab from "./LocDetailsTab";
import VoidDisclaimer from "./VoidDisclaimer";
import SupersedesDisclaimer from "./SupersedesDisclaimer";
import { useLogionChain } from 'src/logion-chain';

export default function UserContextualizedLocDetails() {
    const { getOfficer } = useLogionChain();
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

    if (loc === null || locState === null || !getOfficer) {
        return null;
    }

    return (
        <LocPane
            backPath={ backPath }
            loc={ loc }
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
                legalOfficer={ getOfficer(loc.ownerAddress) }
            />
            <VoidDisclaimer
                loc={ loc }
                detailsPath={ detailsPath }
            />
            <CertificateAndLimits
                loc={ loc }
                viewer="User"
            />
            { loc.locType === 'Collection' && loc.closed &&
                <UserCollectionLocItemChecker
                    collectionLoc={ loc }
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
                context={ loc.locType + " LOC" }
                checkedItem="confidential document"
            />
        </LocPane>
    );
}
