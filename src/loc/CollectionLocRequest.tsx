import { FullWidthPane } from "../common/Dashboard";
import Frame from "../common/Frame";
import SelectLegalOfficer from "../wallet-user/trust-protection/SelectLegalOfficer";
import { Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useState, useMemo } from "react";
import { LegalOfficerClass } from "@logion/client";
import { useUserContext } from "../wallet-user/UserContext";
import { useCommonContext } from "../common/CommonContext";
import CollectionLocRequestForm from "./CollectionLocRequestForm";
import IdentityLocCreation from "../wallet-user/IdentityLocCreation";
import "./CollectionLocRequest.css";
import ButtonGroup from "../common/ButtonGroup";

export interface Props {
    backPath: string,
}

export default function CollectionLocRequest(props: Props) {
    const { colorTheme } = useCommonContext();
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
            className="CollectionLocRequest"
            mainTitle="Request a Collection Protection"
            titleIcon={ { icon: { id: "collection" } } }
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
                                <IdentityLocCreation />
                            </ButtonGroup>
                        </Frame>
                    }
                    { legalOfficersWithValidIdentityLoc.length === 0 &&
                        <Frame className="request-id-loc-frame">
                            <p className="info-text">To submit a Collection LOC request, you must select a Logion Legal
                                Officer who already executed an Identity LOC linked to your Polkadot address.</p>
                            <p className="info-text">Please request an Identity LOC to the Logion Legal Officer of your
                                choice:</p>
                            <ButtonGroup>
                                <IdentityLocCreation />
                            </ButtonGroup>
                        </Frame>
                    }
            </Col>
            <Col>
                <Frame disabled={ legalOfficer === null }>
                    <CollectionLocRequestForm
                        colors={ colorTheme.frame }
                        legalOfficer={ legalOfficer?.address }
                    />
                </Frame>
            </Col>
        </Row>
</FullWidthPane>
)
}
