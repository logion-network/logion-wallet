import { FullWidthPane } from "../common/Dashboard";
import Frame from "../common/Frame";
import SelectLegalOfficer from "../wallet-user/trust-protection/SelectLegalOfficer";
import { Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useState } from "react";
import { LegalOfficerClass } from "@logion/client";
import { useUserContext } from "../wallet-user/UserContext";
import { useCommonContext } from "../common/CommonContext";
import CollectionLocRequestForm from "./CollectionLocRequestForm";

export interface Props {
    backPath: string,
}

export default function CollectionLocRequest(props: Props) {
    const { colorTheme } = useCommonContext();
    const [ legalOfficer, setLegalOfficer ] = useState<LegalOfficerClass | null>(null);
    const { locsState } = useUserContext();
    const navigate = useNavigate();

    return (
        <FullWidthPane
            className="CollectionLocRequest"
            mainTitle="Request a Collection Protection"
            titleIcon={ { icon: { id: "collection" } } }
            onBack={ () => navigate(props.backPath) }
        >
            <Row>
                <Col md={ 6 }>
                    <Frame>
                        <SelectLegalOfficer
                            legalOfficer={ legalOfficer }
                            legalOfficerNumber={ 1 }
                            legalOfficers={ locsState?.legalOfficersWithValidIdentityLoc || [] }
                            mode="select"
                            otherLegalOfficer={ null }
                            setLegalOfficer={ setLegalOfficer }
                            label="Select your Legal Officer"
                            fillEmptyOfficerDetails={ true }
                            feedback="Required"
                        />
                    </Frame>
                </Col>
                <Col>
                    <CollectionLocRequestForm
                        colors={ colorTheme.dialog }
                        legalOfficer={ legalOfficer?.address }
                    />
                </Col>
            </Row>
        </FullWidthPane>
    )
}
