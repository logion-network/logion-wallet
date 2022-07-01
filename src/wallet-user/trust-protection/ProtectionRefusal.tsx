import { RejectedProtection, LegalOfficer } from "@logion/client";
import Button from "../../common/Button";
import { useUserContext } from "../UserContext";
import { useState } from "react";
import SelectLegalOfficer from "./SelectLegalOfficer";
import { useCommonContext } from "../../common/CommonContext";
import './ProtectionRefusal.css';
import { RED } from "../../common/ColorTheme";
import ButtonGroup from "../../common/ButtonGroup";
import { LegalOfficerProtectionState } from "@logion/client/dist/Recovery";
import { Refusal } from "./ProtectionRecoveryRequest";

export interface Props {
    protection: RejectedProtection
    refusal: Refusal
}

export default function ProtectionRefusal(props: Props) {
    const { protection, refusal } = props;
    const { cancelProtection, resubmitProtection, changeProtectionLegalOfficer } = useUserContext()
    const rejectedState = protection.protectionParameters.states[0];
    const currentLegalOfficer = rejectedState.legalOfficer;
    const [ newLegalOfficer, setNewLegalOfficer ] = useState<LegalOfficer | null>(null)
    const otherState = protection.protectionParameters.states[1];
    const otherLegalOfficer = otherState.legalOfficer;
    const { availableLegalOfficers } = useCommonContext();

    if (!availableLegalOfficers) {
        return null
    }
    const legalOfficers = availableLegalOfficers.filter(lo => lo.address !== currentLegalOfficer.address && lo.address !== otherLegalOfficer.address);

    function reasonBox(state: LegalOfficerProtectionState) {
        const legalOfficer = state.legalOfficer;
        const reason = state.decision.rejectReason;
        return (
            <p>
                <strong>{ legalOfficer.name }</strong>:<br />
                «{ reason }»
            </p>
        )
    }

    return (
        <div className="ProtectionRefusal">
            <h2 className="Title" style={ { color: RED } }>Protection Refusal</h2>
            { refusal === 'single' &&
                <>
                    <p>The Legal Officer { currentLegalOfficer.name } did not accept your protection request due to
                        the
                        following reason:</p>
                    <p>«{ rejectedState.decision.rejectReason }»</p>
                    <p>Please contact { currentLegalOfficer.name } for more details and select one of the following next
                        steps:</p>
                </>
            }
            { refusal === 'double' &&
                <>
                    <p>Two Legal Officers - { currentLegalOfficer.name } and { otherLegalOfficer.name } - did not accept
                        your protection request due to the following reasons:</p>
                    { reasonBox(rejectedState) }
                    { reasonBox(otherState) }
                    <p>Please contact { currentLegalOfficer.name } and { otherLegalOfficer.name } for more details and select the following next
                        step:</p>
                </>
            }
            <div className="restart">
                <ButtonGroup>
                    <Button onClick={ cancelProtection }>
                        Restart the complete process
                    </Button>
                </ButtonGroup>
                { refusal === 'single' &&
                    <ButtonGroup>
                        <Button onClick={ () => resubmitProtection(rejectedState.legalOfficer) }>
                            Submit your request again
                        </Button>
                    </ButtonGroup>
                }
            </div>
            { refusal === 'single' &&
                <>
                    <div>Or select another Legal Officer for your protection:</div>
                    <div className="select">
                        <SelectLegalOfficer
                            legalOfficer={ newLegalOfficer }
                            legalOfficerNumber={ 3 }
                            legalOfficers={ legalOfficers }
                            mode="select"
                            otherLegalOfficer={ otherLegalOfficer }
                            setLegalOfficer={ setNewLegalOfficer }
                            label=""
                            fillEmptyOfficerDetails={ false }
                        />
                        <ButtonGroup>
                            <Button
                                disabled={ newLegalOfficer === null }
                                onClick={ () => changeProtectionLegalOfficer(rejectedState.legalOfficer, newLegalOfficer!) }
                            >
                                Submit a new request
                            </Button>
                        </ButtonGroup>
                    </div>
                </>
            }
        </div>
    )
}
