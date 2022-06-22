import { RejectedProtection, LegalOfficer } from "@logion/client";
import Button from "../../common/Button";
import { Row } from "../../common/Grid";
import { useUserContext } from "../UserContext";
import { useState } from "react";
import SelectLegalOfficer from "./SelectLegalOfficer";
import { useCommonContext } from "../../common/CommonContext";

export interface Props {
    protection: RejectedProtection
}

export default function ProtectionRefusal(props: Props) {
    const { protection } = props;
    const { cancelProtection, resubmitProtection, changeProtectionLegalOfficer } = useUserContext()
    const rejectedState = protection.protectionParameters.states[0];
    const currentLegalOfficer = rejectedState.legalOfficer;
    const [ newLegalOfficer, setNewLegalOfficer ] = useState<LegalOfficer | null>(null)
    const otherLegalOfficer = protection.protectionParameters.states[1].legalOfficer;
    const { availableLegalOfficers } = useCommonContext();

    if (!availableLegalOfficers) {
        return null
    }
    const legalOfficers = availableLegalOfficers.filter(lo => lo.address !== currentLegalOfficer.address && lo.address !== otherLegalOfficer.address);

    return (
        <div>
            <h3>Protection Refusal</h3>
            <p>The Legal Officer { currentLegalOfficer.name } did not accept your protection request due to the
                following reason:</p>
            <p>{ rejectedState.decision.rejectReason }</p>
            <p>Please contact { currentLegalOfficer.name } for more details and select one of the following next
                steps:</p>
            <Row>
                <Button onClick={ cancelProtection }>
                    Restart the complete process
                </Button>
                <Button onClick={ () => resubmitProtection(rejectedState.legalOfficer) }>
                    Submit your request again
                </Button>
            </Row>
            <Row>
                <SelectLegalOfficer
                    legalOfficer={ newLegalOfficer }
                    legalOfficerNumber={ 3 }
                    legalOfficers={ legalOfficers }
                    mode="select"
                    otherLegalOfficer={ otherLegalOfficer }
                    setLegalOfficer={ setNewLegalOfficer }
                    label="Or select another Legal Officer for your protection:"
                />

                <Button
                    disabled={ newLegalOfficer === null }
                    onClick={ () => changeProtectionLegalOfficer(rejectedState.legalOfficer, newLegalOfficer!) }
                >
                    Submit a new request
                </Button>
            </Row>
        </div>
    )
}
