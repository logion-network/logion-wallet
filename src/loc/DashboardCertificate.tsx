import { CheckCertifiedCopyResult, CheckHashResult } from "@logion/client";
import { AxiosInstance } from "axios";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";

import { useCommonContext } from "src/common/CommonContext";
import PolkadotFrame from "src/common/PolkadotFrame";
import CheckDeliveredFrame from "src/components/deliverycheck/CheckDeliveredFrame";
import ItemFiles from "src/components/itemfiles/ItemFiles";
import { useLogionChain } from "src/logion-chain";
import { getAllDeliveries, getCollectionItemFileSource, ItemDeliveriesResponse } from "./FileModel";
import { useLocContext } from "./LocContext";
import LocPane from "./LocPane";
import { CertificateItemDetails } from "src/components/certificateitemdetails/CertificateItemDetails";
import FrameTitle from "src/components/frametitle/FrameTitle";

import "./DashboardCertificate.css";
import CheckFileFrame from "../components/checkfileframe/CheckFileFrame";

export default function DashboardCertificate() {
    const itemId = useParams<"itemId">().itemId;
    const {
        backPath,
        loc,
        collectionItems,
    } = useLocContext();
    const collectionItem = useMemo(() => collectionItems.find(item => item.id === itemId), [ itemId, collectionItems ]);
    const [ deliveries, setDeliveries ] = useState<ItemDeliveriesResponse>();
    const { axiosFactory } = useLogionChain();
    const { colorTheme } = useCommonContext();
    const [ checkCertifiedCopyResult, setCheckCertifiedCopyResult ] = useState<CheckCertifiedCopyResult>();
    const [ checkHashResult, setCheckHashResult ] = useState<CheckHashResult>();

    useEffect(() => {
        if(loc && itemId && deliveries === undefined) {
            (async function() {
                const deliveries = await getAllDeliveries(axiosFactory!(loc?.ownerAddress), { locId: loc.id.toString(), collectionItemId: itemId });
                setDeliveries(deliveries);
            })();
        }
    }, [ collectionItem, axiosFactory, itemId, loc, deliveries ]);

    const checkHash = useCallback((hash: string) => {
        if (collectionItem) {
            const result = collectionItem.checkHash(hash);
            setCheckHashResult(result);
        }
    }, [ collectionItem ]);

    if(!collectionItem || !loc) {
        return null;
    }

    return (
        <LocPane
            backPath={ backPath }
            loc={ loc }
            className="DashboardCertificate"
        >
            <PolkadotFrame
                title={
                    <FrameTitle iconId="polkadot_collection" text="Collection Item recorded data"/>
                }
            >
                <CertificateItemDetails
                    item={ collectionItem }
                />
            </PolkadotFrame>
            {
                collectionItem.files.length > 0 &&
                <>
                <div className="frame-container">
                    <PolkadotFrame>
                        <ItemFiles
                            collectionLoc={ loc }
                            files={ collectionItem.files }
                            deliveries={ deliveries }
                            checkCertifiedCopyResultResult={ checkCertifiedCopyResult }
                            checkHashResult={ checkHashResult }
                            downloader={ (axios: AxiosInstance, hash: string) => getCollectionItemFileSource(axios, {
                                locId: loc.id.toString(),
                                collectionItemId: collectionItem.id,
                                hash,
                            }) }
                            icon="polkadot_check_asset"
                            title="List of Collection Item's file(s)"
                        />
                    </PolkadotFrame>
                </div>
                <div className="frame-container">
                    <CheckFileFrame
                        checkHash={ checkHash }
                        checkResult={ checkHashResult === undefined ? "NONE" : ( checkHashResult.collectionItemFile ? "POSITIVE" : "NEGATIVE") }
                        context="Collection Item"
                        checkedItem="file"
                    />
                </div>
                {
                    collectionItem.restrictedDelivery &&
                    <div className="frame-container">
                        <CheckDeliveredFrame
                            checkCertifiedCopy={ hash => collectionItem.checkCertifiedCopy(hash) }
                            colorTheme={ colorTheme }
                            detailedError={ true }
                            onChecked={ setCheckCertifiedCopyResult }
                            icon="polkadot_check_asset"
                            title="NFT Underlying Asset Check Tool"
                            buttonText="Check NFT Asset"
                        />
                    </div>
                }
                </>
            }
        </LocPane>
    );
}
