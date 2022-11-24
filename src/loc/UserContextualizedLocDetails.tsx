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
import DraftLocInstructions from './DraftLocInstructions';
import { ContributionMode } from "./types";
import VTPInfo from "../wallet-user/vtp/VTPInfo";

export interface Props {
    contributionMode: ContributionMode;
}

export default function UserContextualizedLocDetails(props: Props) {
    const { getOfficer } = useLogionChain();
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
    } = useUserLocContext();

    if (loc === null || locState === null || !getOfficer) {
        return null;
    }

    return (
        <LocPane
            backPath={ backPath }
            loc={ loc }
            contributionMode={ props.contributionMode }
        >
            {
                loc.status === "DRAFT" &&
                <DraftLocInstructions/>
            }
            {
                props.contributionMode === "VTP" &&
                <VTPInfo/>
            }
            <LocDetailsTab
                loc={ loc }
                locState={ locState }
                locItems={ locItems }
                checkResult={ checkResult }
                viewer="User"
                detailsPath={ detailsPath }
                legalOfficer={ getOfficer(loc.ownerAddress) }
            />
            {
                loc.status !== "DRAFT" &&
                <>
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
                </>
            }
        </LocPane>
    );
}
