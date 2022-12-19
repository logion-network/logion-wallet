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
import { useCommonContext } from 'src/common/CommonContext';
import { useCallback, useMemo } from 'react';
import IdenfyVerification from './IdenfyVerification';

export interface Props {
    contributionMode: ContributionMode;
}

export default function UserContextualizedLocDetails(props: Props) {
    const { getOfficer } = useLogionChain();
    const { backendConfig } = useCommonContext();
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

    const hasIdenfyIntegration = useMemo(() => {
        const legalOfficer = loc?.ownerAddress;
        return legalOfficer !== undefined && backendConfig[legalOfficer].integrations.iDenfy;
    }, [ loc, backendConfig ]);

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
                hasIdenfyIntegration &&
                <IdenfyVerification/>
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
                contributionMode={ props.contributionMode }
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
