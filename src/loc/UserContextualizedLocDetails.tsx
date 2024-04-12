import CheckFileFrame from 'src/components/checkfileframe/CheckFileFrame';
import CertificateAndDetailsButtons from "./CertificateAndDetailsButtons";
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
import IssuerInfo from "../wallet-user/issuer/IssuerInfo";
import { useCommonContext } from 'src/common/CommonContext';
import { useMemo } from 'react';
import IdenfyVerification from './IdenfyVerification';
import { ReadOnlyLocState } from '@logion/client';
import OpenLoc from './OpenLoc';

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
        return backendConfig(loc?.ownerAccountId).features.iDenfy;
    }, [ loc, backendConfig ]);

    const isReadOnly = useMemo(() => {
        return locState !== null && locState instanceof ReadOnlyLocState;
    }, [ locState ]);

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
                <DraftLocInstructions
                    locType={ loc.locType }
                    template={ loc.template }
                />
            }
            {
                hasIdenfyIntegration && loc.status === "DRAFT" && loc.iDenfy?.status !== "APPROVED" && loc.locType === "Identity" &&
                <IdenfyVerification/>
            }
            {
                props.contributionMode === "VerifiedIssuer" &&
                <IssuerInfo/>
            }
            <LocDetailsTab
                loc={ loc }
                locState={ locState }
                locItems={ locItems }
                checkResult={ checkResult }
                viewer="User"
                detailsPath={ detailsPath }
                legalOfficer={ getOfficer(loc.ownerAccountId) }
                contributionMode={ props.contributionMode }
            />
            {
                loc.status === "REVIEW_ACCEPTED" &&
                <OpenLoc
                    loc={ loc }
                />
            }
            {
                (loc.status === "OPEN" || loc.status === "CLOSED") &&
                <>
                <VoidDisclaimer
                    loc={ loc }
                    detailsPath={ detailsPath }
                />
                <CertificateAndDetailsButtons
                    loc={ loc }
                    viewer="User"
                    isReadOnly={ isReadOnly }
                    contributionMode={ props.contributionMode }
                />
                { loc.locType === 'Collection' && loc.status === "CLOSED" &&
                    <UserCollectionLocItemChecker
                        collectionLoc={ loc }
                        collectionItem={ collectionItem }
                    />
                }
                { loc.locType === 'Collection' && loc.status === "CLOSED" && loc.voidInfo === undefined &&
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
