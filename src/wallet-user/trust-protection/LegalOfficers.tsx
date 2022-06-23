import { LegalOfficer } from "@logion/client";
import { ProtectionRequestStatus } from "@logion/client/dist/RecoveryClient";

import SelectLegalOfficer from './SelectLegalOfficer';
import './LegalOfficers.css';

export interface Props {
    legalOfficers: LegalOfficer[],
    label: string,
    legalOfficer1: LegalOfficer | null,
    setLegalOfficer1: (legalOfficer: LegalOfficer) => void,
    legalOfficer1Status?: ProtectionRequestStatus,
    legalOfficer2: LegalOfficer | null,
    setLegalOfficer2: (legalOfficer: LegalOfficer) => void,
    legalOfficer2Status?: ProtectionRequestStatus,
}

export default function LegalOfficers(props: Props) {

    return (
        <div className="LegalOfficers">
            <div className="legal-officer1">
                <SelectLegalOfficer
                    legalOfficerNumber={ 1 }
                    legalOfficer={ props.legalOfficer1 }
                    otherLegalOfficer={ props.legalOfficer2 }
                    setLegalOfficer={ props.setLegalOfficer1 }
                    legalOfficers={ props.legalOfficers }
                    mode="select"
                    label={ props.label + "1" }
                    status={ props.legalOfficer1Status }
                />
            </div>

            <div className="legal-officer2">
                <SelectLegalOfficer
                    legalOfficerNumber={ 2 }
                    legalOfficer={ props.legalOfficer2 }
                    otherLegalOfficer={ props.legalOfficer1 }
                    setLegalOfficer={ props.setLegalOfficer2 }
                    legalOfficers={ props.legalOfficers }
                    mode="select"
                    label={ props.label + "2" }
                    status={ props.legalOfficer2Status }
                />
            </div>
        </div>
    );
}
