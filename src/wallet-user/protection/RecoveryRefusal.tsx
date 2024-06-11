import { RejectedRecovery } from "@logion/client";
import Button from "../../common/Button";
import { useUserContext } from "../UserContext";
import { useCommonContext } from "../../common/CommonContext";
import './RecoveryRefusal.css';
import { RED } from "../../common/ColorTheme";
import ButtonGroup from "../../common/ButtonGroup";
import { LegalOfficerProtectionState } from "@logion/client/dist/Recovery.js";
import { Refusal } from "./ProtectionRecoveryRequest";

export interface Props {
    recovery: RejectedRecovery
    refusal: Refusal
}

export default function RecoveryRefusal(props: Props) {
    const { recovery, refusal } = props;
    const { cancelProtection } = useUserContext()
    const rejectedState = recovery.protectionParameters.states[0];
    const currentLegalOfficer = rejectedState.legalOfficer;
    const otherState = recovery.protectionParameters.states[1];
    const otherLegalOfficer = otherState.legalOfficer;
    const { availableLegalOfficers } = useCommonContext();

    if (!availableLegalOfficers) {
        return null
    }

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
            <h2 className="Title" style={ { color: RED } }>Recovery Refusal</h2>
            { refusal === 'single' &&
                <>
                    <p>The Legal Officer { currentLegalOfficer.name } did not accept your recovery request due to
                        the following reason:</p>
                    <p>«{ rejectedState.decision.rejectReason }»</p>
                    <p>Please contact { currentLegalOfficer.name } for more details and select one of the following next
                        steps:</p>
                </>
            }
            { refusal === 'double' &&
                <>
                    <p>Two Legal Officers - { currentLegalOfficer.name } and { otherLegalOfficer.name } - did not accept
                        your recovery request due to the following reasons:</p>
                    { reasonBox(rejectedState) }
                    { reasonBox(otherState) }
                    <p>Please contact { currentLegalOfficer.name } and { otherLegalOfficer.name } for more details and
                        select the following next step:</p>
                </>
            }
            <div className="restart">
                <ButtonGroup>
                    <Button onClick={ cancelProtection }>
                        Cancel your recovery request
                    </Button>
                </ButtonGroup>
            </div>
        </div>
    )
}
