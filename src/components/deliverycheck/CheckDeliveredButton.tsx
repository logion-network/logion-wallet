import { useCallback, useEffect, useState } from "react";
import { AxiosInstance } from 'axios';

import { CheckLatestDeliveryResponse, getLatestDeliveries, ItemDeliveriesResponse } from "src/loc/FileModel";
import FileHasher, { DocumentHash } from "../filehasher/FileHasher";
import Icon from "src/common/Icon";

export enum CheckResultType {
    POSITIVE,
    NEGATIVE,
}

export interface CheckResult {
    type: CheckResultType;
    match?: CheckLatestDeliveryResponse;
}

export interface Props {
    collectionLocId: string;
    itemId: string;
    axiosFactory: () => AxiosInstance;
    onChecked: (result: CheckResult) => void;
    onChecking: () => void;
}

export default function CheckDeliveredButton(props: Props) {
    const [ fetched, setFetched ] = useState(false);
    const [ latestDeliveries, setLatestDeliveries ] = useState<ItemDeliveriesResponse | undefined>();
    const [ hash, setHash ] = useState<DocumentHash | null>(null);
    const [ checking, setChecking ] = useState(false);
    const [ checked, setChecked ] = useState(false);

    useEffect(() => {
        if(!fetched && !latestDeliveries) {
            setFetched(true);
            (async function() {
                const axios = props.axiosFactory();
                const response = await getLatestDeliveries(axios, { locId: props.collectionLocId, collectionItemId: props.itemId });
                setLatestDeliveries(response);
            })();
        }
    }, [ fetched, latestDeliveries, props ]);

    useEffect(() => {
        if(hash && latestDeliveries && !checked) {
            for(const originalFileHash of Object.keys(latestDeliveries)) {
                const latestDelivery = latestDeliveries[originalFileHash][0];
                if(latestDelivery.copyHash === hash.hash) {
                    props.onChecked({
                        type: CheckResultType.POSITIVE,
                        match: latestDelivery,
                    });
                    return;
                }
            }
            props.onChecked({
                type: CheckResultType.NEGATIVE,
            })
        }
    }, [ hash, latestDeliveries, checked, checking, props ]);

    const onFileSelected = useCallback(() => {
        setHash(null);
        setLatestDeliveries(undefined);
        setChecked(false);
        setFetched(false);

        setChecking(true);
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
