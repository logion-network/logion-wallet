import { useCallback, useEffect, useState } from "react";
import { AxiosInstance } from 'axios';

import Icon from "src/common/Icon";
import PolkadotFrame from "src/common/PolkadotFrame";

import IconTextRow from "src/common/IconTextRow";
import { ColorTheme } from "src/common/ColorTheme";
import FileHasher, { DocumentHash } from "src/components/filehasher/FileHasher";
import CheckFileResult from "src/components/checkfileresult/CheckFileResult";

import { CheckLatestDeliveryResponse, getLatestDeliveries, ItemDeliveriesResponse } from "src/loc/FileModel";

import './CheckDeliveredFrame.css';

export interface Props {
    collectionLocId: string;
    itemId: string;
    axiosFactory: () => AxiosInstance;
    colorTheme?: ColorTheme;
}

export default function CheckDeliveredFrame(props: Props) {
    const [ fetched, setFetched ] = useState(false);
    const [ latestDeliveries, setLatestDeliveries ] = useState<ItemDeliveriesResponse | undefined>();
    const [ hash, setHash ] = useState<DocumentHash | null>(null);
    const [ checking, setChecking ] = useState(false);
    const [ checked, setChecked ] = useState(false);
    const [ matchingCopy, setMatchingCopy ] = useState<CheckLatestDeliveryResponse | undefined>();

    useEffect(() => {
        if(!fetched && !latestDeliveries) {
            setFetched(true);
            (async function() {
                const axios = props.axiosFactory();
                const response = await getLatestDeliveries(axios, { locId: props.collectionLocId, collectionItemId: props.itemId });
                setLatestDeliveries(response);
                setFetched(false);
            })();
        }
    }, [ fetched, setFetched, latestDeliveries, setLatestDeliveries, props ]);

    useEffect(() => {
        if(hash && latestDeliveries && !checking) {
            setChecking(true);
            for(const originalFileHash of Object.keys(latestDeliveries)) {
                const latestDelivery = latestDeliveries[originalFileHash][0];
                if(latestDelivery.copyHash === hash.hash) {
                    setMatchingCopy(latestDelivery);
                    break;
                }
            }
            setChecked(true);
        }
    }, [ hash, latestDeliveries, checked, setChecked, checking ]);

    const resetCheck = useCallback(() => {
        setHash(null);
        setChecking(false);
        setChecked(false);
        setMatchingCopy(undefined);
    }, [ setHash, setChecking, setChecked, setMatchingCopy ]);

    return (
        <PolkadotFrame
            className="CheckDeliveredFrame"
            colorTheme={ props.colorTheme }
        >
            <IconTextRow
                icon={ <Icon icon={{id: "polkadot_check_asset"}} width="45px" /> }
                text={
                    <>
                        <p className="text-title">Authenticity Check Tool</p>
                        <FileHasher
                            onFileSelected={ resetCheck }
                            onHash={ setHash }
                            buttonText="Check file"
                        />
                        {
                            checking &&
                            <CheckFileResult>
                                {
                                    !checked &&
                                    <div>
                                        <p>Hashing file and checking...</p>
                                    </div>
                                }
                                {
                                    checked && matchingCopy !== undefined &&
                                    <div>
                                        <p>Submitted file is the latest authentic copy delivered to the owner</p>
                                        <p>Hash: { matchingCopy.copyHash }</p>
                                        <p>Generated on: { matchingCopy.generatedOn }</p>
                                        <p>Owner: { matchingCopy.owner }</p>
                                    </div>
                                }
                                {
                                    checked && !matchingCopy &&
                                    <div>
                                        <p>Submitted file is not latest authentic copy delivered to the owner</p>
                                    </div>
                                }
                            </CheckFileResult>
                        }
                    </>
                }
            />
        </PolkadotFrame>
    )
}
