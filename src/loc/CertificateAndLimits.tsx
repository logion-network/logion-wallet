import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
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
import FormGroup from '../common/FormGroup';
import { useCommonContext } from '../common/CommonContext';
import NewTabLink from '../common/NewTabLink';

export interface Props {
    locId: UUID;
    loc: LegalOfficerCase;
}

export default function CertificateAndLimits(props: Props) {
    const { api } = useLogionChain();
    const { colorTheme } = useCommonContext();
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
                    props.loc.locType === 'Collection' && props.loc.closed &&
                    <Col className="col-xxxl-3 col-xxl-6 col-xl-6 col-lg-6 col-md-6 col-sd-6 col-xs-6">
                        <div className="api-settings">
                            <Button onClick={ () => setShowSettings(true) }><Icon icon={{id: "cog"}}/> Get dev settings</Button>
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
                <h2>Get developper settings for the requester application</h2>
                <p>Settings available below must be communicated to the developer of the application that will send data using logion API to record it according to the current Collection LOC scope.</p>
                <FormGroup
                    id="documentation"
                    label='Documentation'
                    control={
                        <NewTabLink
                            href="https://github.com/logion-network/logion-collection-item-submitter#logion-collection-item-submitter"
                        >
                            https://github.com/logion-network/logion-collection-item-submitter
                        </NewTabLink>
                    }
                    colors={ colorTheme.dialog }
                />

                <FormGroup
                    id="endpoint"
                    label='Logion endpoint'
                    control={
                        <p>{ config.edgeNodes[0].socket }</p>
                    }
                    colors={ colorTheme.dialog }
                />

                <FormGroup
                    id="signer"
                    label='Signature will be executed by the following public key'
                    control={
                        <p>{ props.loc.requesterAddress }</p>
                    }
                    colors={ colorTheme.dialog }
                />

                <FormGroup
                    id="extrinsic"
                    label='Extrinsic'
                    control={
                        <p>logionLoc.addCollectionItem(collectionLocId, itemId, itemDescription)</p>
                    }
                    colors={ colorTheme.dialog }
                />

                <div className="arguments">
                    <p>Arguments</p>
                    <ul>
                        <li>collectionLocId: <strong>{ props.locId.toDecimalString() }</strong></li>
                        <li>itemId: <strong>a "0x" prefixed HEX string representation of 32 bytes uniquely identifying the item in this collection.</strong> For instance, the identifier may be a SHA256 hash.</li>
                        <li>itemDescription: <strong>a UTF-8 encoded string of at most 4096 bytes</strong></li>
                    </ul>
                </div>
                <div className="limits">
                    <p>Collection limits</p>
                    <ul>
                        <li>Date limit: <strong>{ dateLimit }</strong></li>
                        <li>Item number limit: <strong>{ itemLimit(props.loc) }</strong></li>
                    </ul>
                </div>
            </Dialog>
        </div>
    );
}

function itemLimit(loc: LegalOfficerCase): string {
    return loc.collectionMaxSize ? loc.collectionMaxSize.toString() : "-";
}
