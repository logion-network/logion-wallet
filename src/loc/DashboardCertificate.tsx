import { CheckCertifiedCopyResult } from "@logion/client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { useCommonContext } from "src/common/CommonContext";
import PolkadotFrame from "src/common/PolkadotFrame";
import CheckDeliveredFrame from "src/components/deliverycheck/CheckDeliveredFrame";
import ItemFiles from "src/components/itemfiles/ItemFiles";
import { useLogionChain } from "src/logion-chain";
import { getAllDeliveries, ItemDeliveriesResponse } from "./FileModel";
import { useLocContext } from "./LocContext";
import LocPane from "./LocPane";
import { CertificateItemDetails } from "src/components/certificateitemdetails/CertificateItemDetails";
import FrameTitle from "src/components/frametitle/FrameTitle";

import "./DashboardCertificate.css";

export default function DashboardCertificate() {
    const itemId = useParams<"itemId">().itemId;
    const {
        backPath,
        locId,
        loc,
        collectionItems,
    } = useLocContext();
    const collectionItem = useMemo(() => collectionItems.find(item => item.id === itemId), [ itemId, collectionItems ]);
    const [ deliveries, setDeliveries ] = useState<ItemDeliveriesResponse>();
    const { axiosFactory } = useLogionChain();
    const { colorTheme } = useCommonContext();
    const [ result, setResult ] = useState<CheckCertifiedCopyResult>();

    useEffect(() => {
        if(loc && itemId && deliveries === undefined) {
            (async function() {
                const deliveries = await getAllDeliveries(axiosFactory!(loc?.ownerAddress), { locId: locId.toString(), collectionItemId: itemId });
                setDeliveries(deliveries);
            })();
        }
    }, [ collectionItem, axiosFactory, itemId, locId, loc, deliveries ]);

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
                            item={ collectionItem }
                            deliveries={ deliveries }
                            withCheck={ false }
                            checkResult={ result }
                        />
                    </PolkadotFrame>
                </div>
                <div className="frame-container">
                    <CheckDeliveredFrame
                        item={ collectionItem }
                        colorTheme={ colorTheme }
                        detailedError={ true }
                        onChecked={ setResult }
                    />
                </div>
                </>
            }
        </LocPane>
    );
}
