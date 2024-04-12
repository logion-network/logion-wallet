import { FullWidthPane } from "../common/Dashboard";
import Frame from "../common/Frame";
import SelectLegalOfficer from "../wallet-user/protection/SelectLegalOfficer";
import { Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useState, useMemo } from "react";
import { LegalOfficerClass } from "@logion/client";
import { useUserContext } from "../wallet-user/UserContext";
import { useCommonContext } from "../common/CommonContext";
import CollectionLocRequestForm from "./CollectionLocRequestForm";
import LocRequestButton from "../components/locrequest/LocRequestButton";
import "./DataLocRequest.css";
import ButtonGroup from "../common/ButtonGroup";
import TransactionLocRequestForm from "./TransactionLocRequestForm";

export interface Props {
    backPath: string,
    locType: 'Transaction' | 'Collection'
    iconId: string,
}

export default function DataLocRequest(props: Props) {
    const { colorTheme } = useCommonContext();
    const { locType, iconId } = props;
    const [ legalOfficer, setLegalOfficer ] = useState<LegalOfficerClass | null>(null);
    const { locsState } = useUserContext();
    const navigate = useNavigate();
    const legalOfficersWithValidIdentityLoc = useMemo(() => {
        if (locsState !== undefined) {
            return locsState.legalOfficersWithValidIdentityLoc
        } else {
            return []
        }
    }, [ locsState ])

    return (
        <FullWidthPane
            className="DataLocRequest"
            mainTitle={ `Request a ${ locType } Protection` }
            titleIcon={ { icon: { id: iconId } } }
            onBack={ () => navigate(props.backPath) }
        >
            <Row>
                <Col md={ 6 }>
                    { legalOfficersWithValidIdentityLoc.length > 0 &&
                        <Frame>
                            <SelectLegalOfficer
                                legalOfficer={ legalOfficer }
                                legalOfficerNumber={ 1 }
                                legalOfficers={ legalOfficersWithValidIdentityLoc }
                                mode="select"
                                otherLegalOfficer={ null }
                                setLegalOfficer={ setLegalOfficer }
                                label="Select your Legal Officer"
                                fillEmptyOfficerDetails={ true }
                                feedback="Required"
                            />
                        </Frame>
                    }
                    { legalOfficersWithValidIdentityLoc.length > 0 &&
                        <Frame className="request-additional-id-loc-frame">
                            <p className="info-text">If you do not see the Logion Legal officer you are looking for,
                                please request an Identity LOC to the Logion Legal Officer of your choice by
                                clicking on the related button below:</p>
                            <ButtonGroup>
                                <LocRequestButton locType="Identity"/>
                            </ButtonGroup>
                        </Frame>
                    }
                    { legalOfficersWithValidIdentityLoc.length === 0 &&
                        <Frame className="request-id-loc-frame">
                            <p className="info-text">To submit a { locType } LOC request, you must select a Logion Legal
                                Officer who already executed an Identity LOC linked to your Polkadot address.</p>
                            <p className="info-text">Please request an Identity LOC to the Logion Legal Officer of your
                                choice:</p>
                            <ButtonGroup>
                                <LocRequestButton locType="Identity"/>
                            </ButtonGroup>
                        </Frame>
                    }
                </Col>
                <Col>
                    <Frame disabled={ legalOfficer === null }>
                        { locType === "Collection" &&
                            <CollectionLocRequestForm
                                colors={ colorTheme.frame }
                                legalOfficer={ legalOfficer?.account }
                            />
                        }
                        { locType === "Transaction" &&
                            <TransactionLocRequestForm
                                colors={ colorTheme.frame }
                                legalOfficer={ legalOfficer?.account }
                            />
                        }
                    </Frame>
                </Col>
            </Row>
        </FullWidthPane>
    )
}
