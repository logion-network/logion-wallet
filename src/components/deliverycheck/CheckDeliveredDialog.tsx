import { AxiosInstance } from 'axios';
import { useCallback, useState } from 'react';
import { Col, Row } from "react-bootstrap";
import Button from 'src/common/Button';

import Dialog from 'src/common/Dialog';
import Icon from 'src/common/Icon';

import CheckDeliveredButton, { CheckResult, CheckResultType, checkResultTypeSpan } from "./CheckDeliveredButton";

export interface Props {
    axiosFactory: () => AxiosInstance;
    locId: string;
    itemId: string;
    onChecked: (result: CheckResult) => void;
}

export default function CheckDeliveredDialog(props: Props) {
    const [ showDialog, setShowDialog ] = useState(false);
    const [ checking, setChecking ] = useState(false);
    const [ checkResult, setCheckResult ] = useState<CheckResult>();

    const onChecking = useCallback(() => {
        setCheckResult(undefined);
        setChecking(true);
    }, []);

    const onChecked = useCallback((result: CheckResult) => {
        setCheckResult(result);
        setChecking(false);
        setShowDialog(false);
        props.onChecked(result);
    }, []);

    return (
        <Row>
            <Col md={ 4 }>
                <Button
                    onClick={ () => setShowDialog(true) }
                    disabled={ checking }
                >
                    <span><Icon icon={{ id: "search" }} /> Check NFT Asset</span>
                </Button>
                <Dialog
                    show={ showDialog }
                    actions={[]}
                    size="lg"
                >
                    <h2>NFT underlying asset check tool</h2>
                    <p>Check a file to verify if it has been generated by logion and if the related file version belongs to the current NFT owner.</p>
                    <p>This tool will generate the “hash” - a digital fingerprint - of the submitted file, and compare it with the file version “hash”
                        previously recorded at the delivery to the current NFT owner. If the check is positive, the version will be highlighted (dotted square)
                        above. Otherwise, it will mean that the submitted file version is not legit and/or not up-to-date: this version does not belong to the
                        current rightful NFT owner and/or is not the currently active version.</p>
                    <p>Important: the file you submit is NOT uploaded to a server as the test is done by your browser.</p>
                    <CheckDeliveredButton
                        axiosFactory={ props.axiosFactory }
                        collectionLocId={ props.locId }
                        itemId={ props.itemId }
                        onChecking={ onChecking }
                        onChecked={ onChecked }
                        privilegedUser={ true }
                    />
                </Dialog>
            </Col>
            <Col md={ 8 }>
                {
                    checkResult &&
                    <Row>
                        <Col md={ 7 }>
                            Check result: <strong>{ checkResultTypeSpan(checkResult.summary) }</strong>
                            <ul>
                                <li><strong>Logion origin: { checkResultTypeSpan(checkResult.logionOrigin) }</strong></li>
                                <li><strong>Belongs to current NFT owner: { checkResultTypeSpan(checkResult.nftOwnership) }</strong></li>
                                <li><strong>Latest generated file: { checkResultTypeSpan(checkResult.latest) }</strong></li>
                            </ul>
                        </Col>
                        <Col md={ 5 }>
                            {
                                checkResult.summary === CheckResultType.POSITIVE &&
                                <Icon icon={{ id: "ok" }} />
                            }
                            {
                                checkResult.summary === CheckResultType.NEGATIVE &&
                                <Icon icon={{ id: "ko" }} />
                            }
                        </Col>
                    </Row>
                }
            </Col>
        </Row>
    );
}
