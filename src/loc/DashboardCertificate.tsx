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

    useEffect(() => {
        if(loc && itemId && deliveries === undefined) {
            (async function() {
                const deliveries = await getAllDeliveries(axiosFactory!(loc?.ownerAddress), { locId: locId.toString(), collectionItemId: itemId });
                setDeliveries(deliveries);
            })();
        }
    }, [ collectionItem, axiosFactory, itemId, locId, loc, deliveries ]);

    return (
        <LocPane
            backPath={ backPath }
            loc={ loc }
            className="DashboardCertificate"
        >
            <PolkadotFrame>
                {
                    collectionItem !== undefined && collectionItem.files.length > 0 &&
                    <ItemFiles
                        item={ collectionItem }
                        deliveries={ deliveries }
                        withCheck={ false }
                    />
                }
            </PolkadotFrame>
            {
                collectionItem !== undefined && collectionItem.files.length > 0 &&
                <div className="CheckDeliveredFrame-container">
                    <CheckDeliveredFrame
                        item={ collectionItem }
                        colorTheme={ colorTheme }
                        detailedError={ true }
                    />
                </div>
            }
        </LocPane>
    );
}
