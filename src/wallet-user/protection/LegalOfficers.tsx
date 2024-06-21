import { ProtectionRequestStatus } from "@logion/client";

import './LegalOfficers.css';
import SelectLegalOfficerAndLoc, { LegalOfficerAndLoc } from "./SelectLegalOfficerAndLoc";

export interface Props {
    legalOfficers: LegalOfficerAndLoc[],
    label: string,
    legalOfficer1: LegalOfficerAndLoc | null,
    setLegalOfficer1: (legalOfficer: LegalOfficerAndLoc) => void,
    legalOfficer1Status?: ProtectionRequestStatus,
    legalOfficer2: LegalOfficerAndLoc | null,
    setLegalOfficer2: (legalOfficer: LegalOfficerAndLoc) => void,
    legalOfficer2Status?: ProtectionRequestStatus,
}

export default function LegalOfficers(props: Props) {

    return (
        <div className="LegalOfficers">
            <div className="legal-officer1">
                <SelectLegalOfficerAndLoc
                    legalOfficerNumber={ 1 }
                    legalOfficerAndLoc={ props.legalOfficer1 }
                    otherLegalOfficerAndLoc={ props.legalOfficer2 }
                    setLegalOfficerAndLoc={ props.setLegalOfficer1 }
                    legalOfficersAndLocs={ props.legalOfficers }
                    mode="select"
                    label={ props.label + "1" }
                    status={ props.legalOfficer1Status }
                />
            </div>

            <div className="legal-officer2">
                <SelectLegalOfficerAndLoc
                    legalOfficerNumber={ 2 }
                    legalOfficerAndLoc={ props.legalOfficer2 }
                    otherLegalOfficerAndLoc={ props.legalOfficer1 }
                    setLegalOfficerAndLoc={ props.setLegalOfficer2 }
                    legalOfficersAndLocs={ props.legalOfficers }
                    mode="select"
                    label={ props.label + "2" }
                    status={ props.legalOfficer2Status }
                />
            </div>
        </div>
    );
}
