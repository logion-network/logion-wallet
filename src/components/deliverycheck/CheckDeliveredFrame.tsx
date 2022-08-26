import { useCallback, useState } from "react";
import { AxiosInstance } from 'axios';

import Icon from "src/common/Icon";
import PolkadotFrame from "src/common/PolkadotFrame";

import IconTextRow from "src/common/IconTextRow";
import { ColorTheme } from "src/common/ColorTheme";
import CheckFileResult from "src/components/checkfileresult/CheckFileResult";

import { CheckLatestDeliveryResponse } from "src/loc/FileModel";

import CheckDeliveredButton, { CheckResult } from "./CheckDeliveredButton";
import './CheckDeliveredFrame.css';

export interface Props {
    collectionLocId: string;
    itemId: string;
    axiosFactory: () => AxiosInstance;
    colorTheme?: ColorTheme;
}

export default function CheckDeliveredFrame(props: Props) {
    const [ checking, setChecking ] = useState(false);
    const [ checked, setChecked ] = useState(false);
    const [ matchingCopy, setMatchingCopy ] = useState<CheckLatestDeliveryResponse | undefined>();

    const onChecking = useCallback(() => {
        setChecking(true);
        setMatchingCopy(undefined);
        setChecked(false);
    }, []);

    const onChecked = useCallback((result: CheckResult) => {
        setMatchingCopy(result.match);
        setChecked(true);
    }, []);

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
                        <CheckDeliveredButton
                            axiosFactory={ props.axiosFactory }
                            collectionLocId={ props.collectionLocId }
                            itemId={ props.itemId }
                            onChecking={ onChecking }
                            onChecked={ onChecked }
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
                                    checked && matchingCopy === undefined &&
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
