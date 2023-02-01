import { useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { LocData } from "@logion/client";
import { ChainTime } from '@logion/node-api';

import Button from '../common/Button';
import CopyPasteButton from '../common/CopyPasteButton';
import Dialog from '../common/Dialog';
import Icon from '../common/Icon';
import { useLogionChain } from '../logion-chain';
import { fullCertificateUrl } from '../PublicPaths';
import config from '../config';
import NewTabLink from '../common/NewTabLink';
import StaticLabelValue from '../common/StaticLabelValue';

import './CertificateAndLimits.css';
import StatementOfFactsButton from './statement/StatementOfFactsButton';
import StatementOfFactsRequestButton from "./statement/StatementOfFactsRequestButton";
import ArchiveButton from "./archive/ArchiveButton";
import InlineDateTime from 'src/common/InlineDateTime';
import { useCommonContext, Viewer } from 'src/common/CommonContext';
import { isLogionIdentityLoc } from "../common/types/ModelTypes";
import Nominate from "./vtp/Nominate";
import VTPSelectionButton from "./vtp/VTPSelectionButton";
import ButtonGroup from 'src/common/ButtonGroup';
import RequestVoteButton from './RequestVoteButton';

export interface Props {
    loc: LocData;
    viewer: Viewer;
    isReadOnly: boolean;
}

export default function CertificateAndLimits(props: Props) {
    const { api } = useLogionChain();
    const { backendConfig } = useCommonContext();

    const [ dateLimit, setDateLimit ] = useState<string>();
    const [ showSettings, setShowSettings ] = useState(false);

    const certificateUrl = fullCertificateUrl(props.loc.id);

    useEffect(() => {
        if(api !== null && props.loc.collectionLastBlockSubmission) {
            (async function() {
                const chainTime = await (await ChainTime.now(api)).atBlock(props.loc.collectionLastBlockSubmission!);
                setDateLimit(new Date(chainTime.currentTime).toISOString());
            })();
        }
    }, [ api, props.loc ]);

    const hasVoteFeature = useMemo(() => {
        return backendConfig(props.loc.ownerAddress).features.vote;
    }, [ props.loc, backendConfig ]);

    return (
        <div
            className="CertificateAndLimits"
        >
            <Row>
                <Col>
                    <div className="certificate">
                        <h2>LOC Certificate public web address (URL):
                            <ViewCertificateButton url={ certificateUrl }/>
                            <CopyPasteButton value={ certificateUrl } />
                        </h2>
                    </div>
                </Col>
                {
                    props.loc.locType === 'Collection' &&
                    <Col>
                        <div className="limits">
                            <div><strong>Collection Date Limit:</strong> <InlineDateTime dateTime={ dateLimit } dateOnly={ true } /></div>
                            <div><strong>Collection Item Limit:</strong> { itemLimit(props.loc) }</div>
                            <div><strong>Collection Upload Accepted:</strong> { props.loc.collectionCanUpload ? "Yes" : "No" }</div>
                        </div>
                    </Col>
                }
            </Row>
            <Row>
                <Col>
                    <div className="buttons-row">
                        <ButtonGroup
                            align="center"
                        >
                            { props.loc.locType === 'Collection' && props.loc.closed && !props.loc.voidInfo && <Button onClick={ () => setShowSettings(true) }><Icon icon={{id: "cog"}} height="22px"/> Get dev settings</Button> }

                            { props.loc.locType === 'Collection' && props.viewer === 'LegalOfficer' && props.loc.status ==='OPEN' && <VTPSelectionButton/> }
                            { props.loc.locType !== 'Collection' && props.viewer === 'LegalOfficer' && props.loc.status ==='OPEN' && <VTPSelectionButton/> }
                            { props.loc.locType !== 'Collection' && props.viewer === 'LegalOfficer' && props.loc.locType === 'Identity' && !isLogionIdentityLoc(props.loc) && props.loc.status ==='CLOSED' && !props.isReadOnly && <Nominate/> }

                            { props.loc.locType === 'Identity' && !isLogionIdentityLoc(props.loc) && props.viewer === 'LegalOfficer' && props.loc.status === "CLOSED" && hasVoteFeature && !props.loc.voteId && !props.isReadOnly && <RequestVoteButton/> }

                            { props.loc.locType === 'Collection' && props.viewer === 'LegalOfficer' && <ArchiveButton/> }
                            { props.loc.locType !== 'Collection' && props.viewer === 'LegalOfficer' && !props.isReadOnly && <ArchiveButton/> }

                            { props.loc.locType !== 'Collection' && props.viewer === 'LegalOfficer' && !props.isReadOnly && <StatementOfFactsButton/> }
                            { props.loc.locType !== 'Collection' && props.viewer === 'User' && <StatementOfFactsRequestButton/> }
                        </ButtonGroup>
                    </div>
                </Col>
            </Row>
            {
                props.loc.locType === "Collection" && props.loc.closed && !props.loc.voidInfo &&
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
                            <li><strong>collectionLocId:</strong> { props.loc.id.toDecimalString() }</li>
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
            }
        </div>
    );
}

function itemLimit(loc: LocData): string {
    return loc.collectionMaxSize ? loc.collectionMaxSize.toString() : "-";
}

function ViewCertificateButton(props: { url: string }) {
    return (
        <Button className="ViewCertificateButton" onClick={ () => window.open(props.url, "_blank") }>
            <Icon icon={{ id:"view-certificate" }} height="20px" />
        </Button>
    );
}

