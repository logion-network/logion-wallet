import { RejectedProtection, LocsState, LogionClient } from "@logion/client";
import Button from "../../common/Button";
import { useUserContext } from "../UserContext";
import { useMemo, useState } from "react";
import SelectLegalOfficerAndLoc, { LegalOfficerAndLoc } from "./SelectLegalOfficerAndLoc";
import { useCommonContext } from "../../common/CommonContext";
import './ProtectionRefusal.css';
import { RED } from "../../common/ColorTheme";
import ButtonGroup from "../../common/ButtonGroup";
import { LegalOfficerProtectionState } from "@logion/client/dist/Recovery.js";
import { Refusal } from "./ProtectionRecoveryRequest";
import { useLogionChain } from "src/logion-chain";

export function getLegalOfficerAndLocs(locsState: LocsState | undefined, client: LogionClient | null) {
    if(locsState && client) {
        const closedIdentityLocs = locsState.closedLocs["Identity"];
        const list: LegalOfficerAndLoc[] = [];
        for(const loc of closedIdentityLocs) {
            list.push({
                loc: loc.locId,
                legalOfficer: client.getLegalOfficer(loc.data().ownerAddress),
            });
        }
        return list;
    } else {
        return [];
    }
}

export interface Props {
    protection: RejectedProtection
    refusal: Refusal
}

export default function ProtectionRefusal(props: Props) {
    const { protection, refusal } = props;
    const { cancelProtection, resubmitProtection, changeProtectionLegalOfficer } = useUserContext()
    const rejectedState = protection.protectionParameters.states[0];
    const currentLegalOfficer = rejectedState.legalOfficer;
    const [ legalOfficerAndLoc, setLegalOfficerAndLoc ] = useState<LegalOfficerAndLoc | null>(null)
    const otherState = protection.protectionParameters.states[1];
    const otherLegalOfficerAndLoc = {
        legalOfficer: otherState.legalOfficer,
        loc: otherState.identityLoc,
    }
    const { availableLegalOfficers } = useCommonContext();
    const { locsState } = useUserContext();
    const { client } = useLogionChain();

    const legalOfficersAndLocs = useMemo(() => getLegalOfficerAndLocs(locsState, client), [ locsState, client ]);

    if (!availableLegalOfficers || !locsState) {
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
                    <p>Two Legal Officers - { currentLegalOfficer.name } and { otherLegalOfficerAndLoc.legalOfficer.name } - did not accept
                        your protection request due to the following reasons:</p>
                    { reasonBox(rejectedState) }
                    { reasonBox(otherState) }
                    <p>Please contact { currentLegalOfficer.name } and { otherLegalOfficerAndLoc.legalOfficer.name } for more details and select the following next
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
                        <SelectLegalOfficerAndLoc
                            legalOfficerAndLoc={ legalOfficerAndLoc }
                            legalOfficerNumber={ 3 }
                            legalOfficersAndLocs={ legalOfficersAndLocs }
                            mode="select"
                            otherLegalOfficerAndLoc={ otherLegalOfficerAndLoc }
                            setLegalOfficerAndLoc={ setLegalOfficerAndLoc }
                            label=""
                            fillEmptyOfficerDetails={ false }
                        />
                        <ButtonGroup>
                            <Button
                                disabled={ legalOfficerAndLoc === null }
                                onClick={ () => changeProtectionLegalOfficer(rejectedState.legalOfficer, legalOfficerAndLoc!.legalOfficer, legalOfficerAndLoc!.loc) }
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
