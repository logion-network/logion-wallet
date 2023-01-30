import { CheckCertifiedCopyResult, CheckResultType } from "@logion/client";
import { UUID } from "@logion/node-api";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCommonContext } from "src/common/CommonContext";
import Frame from "src/common/Frame";
import CheckDeliveredFrame from "src/components/deliverycheck/CheckDeliveredFrame";
import ItemFiles from "src/components/itemfiles/ItemFiles";
import { locDetailsPath } from "src/legal-officer/LegalOfficerPaths";
import { useLogionChain } from "src/logion-chain";
import { locDetailsPath as userLocDetailsPath } from "src/wallet-user/UserRouter";
import { getAllCollectionDeliveries, getFile, ItemDeliveriesResponse } from "./FileModel";
import { LegalOfficerLocContextProvider } from "./LegalOfficerLocContext";
import { useLocContext } from "./LocContext";
import LocPane from "./LocPane";
import { UserLocContextProvider } from "./UserLocContext";
import "./DocumentClaimHistory.css";

export default function DocumentClaimHistory() {
    const { loc, backPath } = useLocContext();
    const hash = useParams<"hash">().hash;
    const [ deliveries, setDeliveries ] = useState<ItemDeliveriesResponse>();
    const [ checkCertifiedCopyResult, setCheckCertifiedCopyResult ] = useState<CheckCertifiedCopyResult>();
    const { axiosFactory } = useLogionChain();
    const { colorTheme } = useCommonContext();

    useEffect(() => {
        if(loc && hash && deliveries === undefined) {
            (async function() {
                const deliveries = await getAllCollectionDeliveries(axiosFactory!(loc?.ownerAddress), { locId: loc.id.toString(), hash });
                setDeliveries({
                    [hash]: deliveries.deliveries,
                });
            })();
        }
    }, [ hash, axiosFactory, loc, deliveries ]);

    const checkCertifiedCopy = useCallback(async (fileHash: string): Promise<CheckCertifiedCopyResult> => {
        if(deliveries && hash && hash in deliveries) {
            const fileDeliveries = deliveries[hash];
            for(let i = 0; i < fileDeliveries.length; ++i) {
                const delivery = fileDeliveries[i];
                if(delivery.copyHash === fileHash) {
                    return {
                        latest: i === 0 ? CheckResultType.POSITIVE : CheckResultType.NEGATIVE,
                        logionOrigin: CheckResultType.POSITIVE,
                        nftOwnership: CheckResultType.POSITIVE,
                        summary: CheckResultType.POSITIVE,
                        match: {
                            ...delivery,
                            belongsToCurrentOwner: false,
                            originalFileHash: fileHash,
                        }
                    };
                }
            }
        }
        return {
            latest: CheckResultType.NEGATIVE,
            logionOrigin: CheckResultType.NEGATIVE,
            nftOwnership: CheckResultType.NEGATIVE,
            summary: CheckResultType.NEGATIVE,
        };
    }, [ deliveries, hash ]);

    if(!loc) {
        return null;
    }

    return (
        <LocPane
            backPath={backPath}
            loc={loc}
            className="DocumentClaimHistory"
        >
            <Frame>
                <ItemFiles
                    collectionLoc={loc}
                    deliveries={ deliveries }
                    checkCertifiedCopyResultResult={ checkCertifiedCopyResult }
                    files={ loc.files.filter(file => file.hash === hash).map(file => ({
                        ...file,
                        size: BigInt(-1),
                    })) }
                    downloader={(axios, hash) => getFile(axios, {
                        hash,
                        locId: loc.id.toString(),
                    })}
                    defaultExpanded={true}
                    icon="check_document"
                    title="Document claim history"
                />
            </Frame>
            <div className="check-delivered-container">
                <CheckDeliveredFrame
                    checkCertifiedCopy={ checkCertifiedCopy }
                    colorTheme={ colorTheme }
                    detailedError={ false }
                    icon="check_document_tool"
                    title="Restricted download Check Tool"
                    buttonText="Check document"
                    onChecked={result => setCheckCertifiedCopyResult(result)}
                />
            </div>
        </LocPane>
    );
}

export function GuardianDocumentClaimHistory() {
    const locId = new UUID(useParams<"locId">().locId);
    return (
        <LegalOfficerLocContextProvider
            locId={ locId }
            backPath={ locDetailsPath(locId, "Collection") }
            detailsPath={ locDetailsPath }
        >
            <DocumentClaimHistory />
        </LegalOfficerLocContextProvider>
    )
}

export function UserDocumentClaimHistory() {
    const locId = new UUID(useParams<"locId">().locId);
    return (
        <UserLocContextProvider
            locId={ locId }
            backPath={ userLocDetailsPath(locId, "Collection") }
            detailsPath={ userLocDetailsPath }
        >
            <DocumentClaimHistory />
        </UserLocContextProvider>
    )
}
