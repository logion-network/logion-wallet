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
import Nominate from "./issuer/Nominate";
import IssuerSelectionButton from "./issuer/IssuerSelectionButton";
import ButtonGroup from 'src/common/ButtonGroup';
import RequestVoteButton from './RequestVoteButton';
import TokensRecordButton from './record/TokensRecordButton';
import { ContributionMode } from './types';
import ViewQrCodeButton from './ViewQrCodeButton';
import ViewCertificateButton from './ViewCertificateButton';
import InvitedContributorsButton from "./invited-contributor/InvitedContributorsButton";

export interface Props {
    loc: LocData;
    viewer: Viewer;
    isReadOnly: boolean;
    contributionMode?: ContributionMode;
}

export default function CertificateAndLimits(props: Props) {
    const { loc } = props;
    const { api } = useLogionChain();
    const { backendConfig } = useCommonContext();

    const [ dateLimit, setDateLimit ] = useState<string>();
    const [ showSettings, setShowSettings ] = useState(false);

    const certificateUrl = fullCertificateUrl(loc.id);

    useEffect(() => {
        if(api !== null && loc.collectionLastBlockSubmission) {
            (async function() {
                const chainTime = await (await ChainTime.now(api.polkadot)).atBlock(loc.collectionLastBlockSubmission!);
                setDateLimit(new Date(chainTime.currentTime).toISOString());
            })();
        }
    }, [ api, loc ]);

    const hasVoteFeature = useMemo(() => {
        return backendConfig(loc.ownerAddress).features.vote;
    }, [ loc, backendConfig ]);

    return (
        <div
            className="CertificateAndLimits"
        >
            <Row>
                <Col>
                    <div className="certificate">
                        <h2>LOC Certificate public web address (URL):
                            <ViewCertificateButton url={ certificateUrl }/>
                            <CopyPasteButton value={ certificateUrl } tooltip="Copy certificate URL to clipboard" />
                            <ViewQrCodeButton certificateUrl={ certificateUrl } />
                        </h2>
                    </div>
                </Col>
                {
                    loc.locType === 'Collection' &&
                    <Col>
                        <div className="limits">
                            <div><strong>Collection Date Limit:</strong> <InlineDateTime dateTime={ dateLimit } dateOnly={ true } /></div>
                            <div><strong>Collection Item Limit:</strong> { itemLimit(loc) }</div>
                            <div><strong>Collection Upload Accepted:</strong> { loc.collectionCanUpload ? "Yes" : "No" }</div>
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
                            { showInvitedContributors(props) && <InvitedContributorsButton/> }
                            { loc.locType === 'Collection' && loc.status === "CLOSED" && !loc.voidInfo && <TokensRecordButton contributionMode={props.contributionMode}/> }
                            { loc.locType === 'Collection' && loc.status === "CLOSED" && !loc.voidInfo && <Button onClick={ () => setShowSettings(true) }><Icon icon={{id: "cog"}} height="22px"/> Get dev settings</Button> }

                            { loc.locType === 'Collection' && props.viewer === 'LegalOfficer' && <IssuerSelectionButton/> }
                            { loc.locType !== 'Collection' && props.viewer === 'LegalOfficer' && loc.status ==='OPEN' && <IssuerSelectionButton/> }
                            { loc.locType === 'Identity' && props.viewer === 'LegalOfficer' && !isLogionIdentityLoc({ ...loc, requesterAddress: loc.requesterAddress?.address }) && loc.requesterAddress?.type === "Polkadot" && loc.status ==='CLOSED' && !props.isReadOnly && <Nominate/> }

                            { loc.locType === 'Identity' && !isLogionIdentityLoc({ ...loc, requesterAddress: loc.requesterAddress?.address }) && props.viewer === 'LegalOfficer' && loc.status === "CLOSED" && hasVoteFeature && !loc.voteId && !props.isReadOnly && <RequestVoteButton/> }

                            { loc.locType === 'Collection' && props.viewer === 'LegalOfficer' && <ArchiveButton/> }
                            { loc.locType !== 'Collection' && props.viewer === 'LegalOfficer' && !props.isReadOnly && <ArchiveButton/> }

                            { loc.locType !== 'Collection' && props.viewer === 'LegalOfficer' && !props.isReadOnly && <StatementOfFactsButton/> }
                            { loc.locType !== 'Collection' && props.viewer === 'User' && <StatementOfFactsRequestButton/> }
                        </ButtonGroup>
                    </div>
                </Col>
            </Row>
            {
                loc.locType === "Collection" && loc.status === "CLOSED" && !loc.voidInfo &&
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
                    <h2>Get developer settings for the requester application</h2>
                    <p>Settings available below must be communicated to the developer of the application that will send data using logion API to record it according to the current Collection LOC scope.</p>

                    <StaticLabelValue
                        label='Documentation'
                        value={
                        <ul>
                            <li><strong>API to logion network:</strong> <NewTabLink href="https://logion-network.github.io/logion-api/"/></li>
                            <li><strong>Details on Collection items:</strong> <NewTabLink href="https://logion-network.github.io/logion-api/docs/client/loc#collection-item"/></li>
                            <li><strong>How to import tokens into a collection:</strong> <NewTabLink href="https://github.com/logion-network/logion-solidity/#importing-tokens-into-a-logion-collection"/></li>
                        </ul>
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
                            <p>{ loc.requesterAddress?.address }</p>
                        }
                    />

                    <div className="arguments">
                        <h3>Arguments</h3>
                        <ul>
                            <li><strong>collectionLocId:</strong> { loc.id.toDecimalString() }</li>
                        </ul>
                    </div>
                    <div className="limits">
                        <h3>Collection limits</h3>
                        <ul>
                            <li><strong>Date limit:</strong> { dateLimit }</li>
                            <li><strong>Item number limit:</strong> { itemLimit(loc) }</li>
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

function showInvitedContributors(props: Props): boolean {
    const { loc } = props;
    return loc.locType === 'Collection'
        && (loc.status === "OPEN" || loc.status === "CLOSED")
        && !loc.voidInfo
        && props.contributionMode !== "VerifiedIssuer"
}
