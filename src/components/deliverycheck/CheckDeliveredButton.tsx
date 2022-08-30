import { useCallback, useEffect, useState } from "react";
import { AxiosInstance } from 'axios';

import { CheckLatestDeliveryResponse, getAllDeliveries, getLatestDeliveries, ItemDeliveriesResponse } from "src/loc/FileModel";
import FileHasher, { DocumentHash } from "../filehasher/FileHasher";
import Icon from "src/common/Icon";
import { GREEN, RED } from "src/common/ColorTheme";

export enum CheckResultType {
    POSITIVE,
    NEGATIVE,
}

export function checkResultTypeSpan(type: CheckResultType): JSX.Element {
    return (
        <span style={{ color: checkResultTypeColor(type) }}>
            { checkResultTypeText(type) }
        </span>
    );
}

export function checkResultTypeText(type: CheckResultType): string {
    return type === CheckResultType.POSITIVE ? "positive" : "negative";
}

export function checkResultTypeColor(type: CheckResultType): string {
    return type === CheckResultType.POSITIVE ? GREEN : RED;
}

export interface CheckMatch extends CheckLatestDeliveryResponse {
    originalFileHash: string;
}

export interface CheckResult {
    match?: CheckMatch;
    summary: CheckResultType;
    logionOrigin: CheckResultType;
    nftOwnership: CheckResultType;
    latest: CheckResultType;
}

export interface Props {
    collectionLocId: string;
    itemId: string;
    axiosFactory: () => AxiosInstance;
    onChecked: (result: CheckResult) => void;
    onChecking: () => void;
    privilegedUser: boolean;
}

export default function CheckDeliveredButton(props: Props) {
    const [ fetched, setFetched ] = useState(false);
    const [ latestDeliveries, setLatestDeliveries ] = useState<ItemDeliveriesResponse | undefined>();
    const [ hash, setHash ] = useState<DocumentHash | null>(null);
    const [ checked, setChecked ] = useState(false);

    useEffect(() => {
        if(!fetched && !latestDeliveries) {
            setFetched(true);
            (async function() {
                const axios = props.axiosFactory();
                let response: ItemDeliveriesResponse;
                if(props.privilegedUser) {
                    response = await getAllDeliveries(axios, { locId: props.collectionLocId, collectionItemId: props.itemId });
                } else {
                    response = await getLatestDeliveries(axios, { locId: props.collectionLocId, collectionItemId: props.itemId });
                }
                setLatestDeliveries(response);
            })();
        }
    }, [ fetched, latestDeliveries, props ]);

    useEffect(() => {
        if(hash && latestDeliveries && !checked) {
            setChecked(true);
            for(const originalFileHash of Object.keys(latestDeliveries)) {
                for(let i = 0; i < latestDeliveries[originalFileHash].length; ++i) {
                    const delivery = latestDeliveries[originalFileHash][i];
                    if(delivery.copyHash === hash.hash) {
                        props.onChecked({
                            match: {  
                                ...delivery,
                                originalFileHash
                            },
                            summary: i === 0 && delivery.belongsToCurrentOwner ? CheckResultType.POSITIVE : CheckResultType.NEGATIVE,
                            logionOrigin: CheckResultType.POSITIVE,
                            latest: i === 0 ? CheckResultType.POSITIVE : CheckResultType.NEGATIVE,
                            nftOwnership: delivery.belongsToCurrentOwner ? CheckResultType.POSITIVE : CheckResultType.NEGATIVE,
                        });
                        return;
                    }
                }
            }
            props.onChecked({
                summary: CheckResultType.NEGATIVE,
                logionOrigin: CheckResultType.NEGATIVE,
                latest: CheckResultType.NEGATIVE,
                nftOwnership: CheckResultType.NEGATIVE,
            })
        }
    }, [ hash, latestDeliveries, checked, props ]);

    const onFileSelected = useCallback(() => {
        setHash(null);
        setLatestDeliveries(undefined);
        setFetched(false);
        setChecked(false);

        props.onChecking();
    }, [ props ]);

    return (
        <div className="CheckDeliveredButton">
            <FileHasher
                onFileSelected={ onFileSelected }
                onHash={ setHash }
                buttonText={ <span><Icon icon={{ id: "search" }} /> Check NFT Asset</span> }
            />
        </div>
    );
}
