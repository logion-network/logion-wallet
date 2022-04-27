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
import config from '../config';
import NewTabLink from '../common/NewTabLink';
import StaticLabelValue from '../common/StaticLabelValue';

import './CertificateAndLimits.css';
import StatementOfFactsButton from './statement/StatementOfFactsButton';
import { useCommonContext } from '../common/CommonContext';
import { useDirectoryContext } from '../directory/DirectoryContext';

export interface Props {
    locId: UUID;
    loc: LegalOfficerCase;
}

export default function CertificateAndLimits(props: Props) {
    const { api } = useLogionChain();
    const { isLegalOfficer } = useDirectoryContext();
    const { accounts } = useCommonContext();

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

    if(accounts?.current?.address === undefined) {
        return null;
    }

    return (
        <div
            className="CertificateAndLimits"
        >
            <Row>
                <Col className="col-xxxl-6 col-xxl-12 col-xl-12 col-lg-12 col-md-12 col-sd-12 col-xs-12">
                    <div className="certificate">
                        <h2>Public web address (URL) of this Legal Officer Case related Certificate:</h2>
                        <div className="url-copy-paste-container">
                            <div className="url-container">
                                <a href={ certificateUrl } target="_blank" rel="noreferrer">{ certificateUrl }</a>
                            </div>
                            <CopyPasteButton value={ certificateUrl } />
                        </div>
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
                            <div>
                                <Button onClick={ () => setShowSettings(true) }><Icon icon={{id: "cog"}} height="22px"/> Get dev settings</Button>
                            </div>
                        </div>
                    </Col>
                }
                {
                    props.loc.locType !== 'Collection' && isLegalOfficer(accounts.current.address) &&
                    <Col className="col-xxxl-6 col-xxl-12 col-xl-12 col-lg-12 col-md-12 col-sd-12 col-xs-12">
                        <div className="preview">
                            <StatementOfFactsButton/>
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

                <StaticLabelValue
                    label='Documentation'
                    value={
                        <NewTabLink
                            href="https://github.com/logion-network/logion-collection-item-submitter#logion-collection-item-submitter"
                        >
                            https://github.com/logion-network/logion-collection-item-submitter
                        </NewTabLink>
                    }
                />

                <StaticLabelValue
                    label='Logion endpoint'
                    value={
                        <p>{ config.edgeNodes[0].socket }</p>
                    }
                />

                <StaticLabelValue
                    label='Signature will be executed by the following public key'
                    value={
                        <p>{ props.loc.requesterAddress }</p>
                    }
                />

                <StaticLabelValue
                    label='Extrinsic'
                    value={
                        <p>logionLoc.addCollectionItem(collectionLocId, itemId, itemDescription)</p>
                    }
                />

                <div className="arguments">
                    <h3>Arguments</h3>
                    <ul>
                        <li><strong>collectionLocId:</strong> { props.locId.toDecimalString() }</li>
                        <li><strong>itemId:</strong> a "0x" prefixed HEX string representation of 32 bytes uniquely identifying the item in this collection. For instance, the identifier may be a SHA256 hash.</li>
                        <li><strong>itemDescription:</strong> a UTF-8 encoded string of at most 4096 bytes</li>
                    </ul>
                </div>
                <div className="limits">
                    <h3>Collection limits</h3>
                    <ul>
                        <li><strong>Date limit:</strong> { dateLimit }</li>
                        <li><strong>Item number limit:</strong> { itemLimit(props.loc) }</li>
                    </ul>
                </div>
            </Dialog>
        </div>
    );
}

function itemLimit(loc: LegalOfficerCase): string {
    return loc.collectionMaxSize ? loc.collectionMaxSize.toString() : "-";
}
