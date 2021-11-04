import React from "react";
import { LegalOfficer } from "../../common/types/LegalOfficer";

import { ProtectionRequestStatus } from "../../common/types/ModelTypes";

import SelectLegalOfficer, { Mode } from './SelectLegalOfficer';
import './LegalOfficers.css';

export interface Props {
    legalOfficers: LegalOfficer[],
    mode: Mode,
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
                    mode={ props.mode }
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
                    mode={ props.mode }
                    status={ props.legalOfficer2Status }
                />
            </div>
        </div>
    );
}
