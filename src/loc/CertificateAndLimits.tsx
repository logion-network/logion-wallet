import { useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import Button from '../common/Button';
import CopyPasteButton from '../common/CopyPasteButton';
import Dialog from '../common/Dialog';
import Icon from '../common/Icon';
import { useLogionChain } from '../logion-chain';
import { ChainTime } from '../logion-chain/ChainTime';
import { format } from '../logion-chain/datetime';
import { LegalOfficerCase } from '../logion-chain/Types';
import { UUID } from '../logion-chain/UUID';
import { fullCertificateUrl } from '../PublicPaths';
import './CertificateAndLimits.css';
import config from '../config';

export interface Props {
    locId: UUID;
    loc: LegalOfficerCase;
}

export default function CertificateAndLimits(props: Props) {
    const { api } = useLogionChain();
    const [ dateLimit, setDateLimit ] = useState("-");
    const [ showSettings, setShowSettings ] = useState(false);

    const certificateUrl = fullCertificateUrl(props.locId);

    useEffect(() => {
        if(api !== null && props.loc.collectionLastBlockSubmission) {
            (async function() {
                const chainTime = await (await ChainTime.now(api)).atBlock(props.loc.collectionLastBlockSubmission!);
                setDateLimit(format(new Date(chainTime.currentTime).toISOString()).date);
            })();
        }
    }, [ api, props.locId, props.loc.collectionLastBlockSubmission ]);

    const settings = `Polkadot SDK documentation: https://polkadot.js.org/docs/api
Logion endpoint: ${config.edgeNodes[0].socket}
Signer: ${props.loc.requesterAddress}
Extrinsic: logionLoc.addCollectionItem(collectionLocId, itemId, itemDescription)
Arguments:
    - collectionLocId: ${props.locId.toDecimalString()}
    - itemId: a "0x" prefixed HEX string representation of 32 bytes uniquely identifying the item in this collection; the identifier may for instance be a SHA256 hash.
    - itemDescription: a UTF-8 encoded string of at most 4096 bytes`;

    return (
        <div
            className="CertificateAndLimits"
        >
            <Row>
                <Col className="col-xxxl-6 col-xxl-12 col-xl-12 col-lg-12 col-md-12 col-sd-12 col-xs-12">
                    <div className="certificate">
                        <h2>Public web address (URL) of this Legal Officer Case related Certificate:</h2>
                        <a href={ certificateUrl } target="_blank" rel="noreferrer">{ certificateUrl }</a> <CopyPasteButton value={ certificateUrl } />
                    </div>
                </Col>
                {
                    props.loc.locType === 'Collection' &&
                    <Col className="col-xxxl-3 col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sd-6 col-xs-6">
                        <div className="limits">
                            <div><strong>Collection Date Limit:</strong> { dateLimit }</div>
                            <div><strong>Collection Item Limit:</strong> { itemLimit(props.loc) }</div>
                        </div>
                    </Col>
                }
                {
                    props.loc.locType === 'Collection' &&
                    <Col className="col-xxxl-3 col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sd-6 col-xs-6">
                        <div className="api-settings">
                            <Button onClick={ () => setShowSettings(true) }><Icon icon={{id: "cog"}}/> Get API settings</Button>
                        </div>
                    </Col>
                }
            </Row>
            <Dialog
                className="CertificateAndLimits"
                actions={[
                    {
                        id: "close",
                        buttonText: "Close",
                        callback: () => setShowSettings(false),
                        buttonVariant: "primary"
                    }
                ]}
                show={ showSettings }
                size="xl"
            >
                <h2>Get API settings for the requester application</h2>
                <p>Settings available below must be communicated to the developer of the application that will send data using logion API to record it according to the current Collection LOC scope.</p>
                <Row>
                    <Col md={11}>
                        <Form.Control
                            as="textarea"
                            value={ settings }
                            style={{ height: "300px" }}
                        />
                    </Col>
                    <Col md={1}>
                        <div className="copy-paste-container">
                            <CopyPasteButton value={ settings } />
                        </div>
                    </Col>
                </Row>
            </Dialog>
        </div>
    );
}

function itemLimit(loc: LegalOfficerCase): string {
    return loc.collectionMaxSize ? loc.collectionMaxSize.toString() : "-";
}
