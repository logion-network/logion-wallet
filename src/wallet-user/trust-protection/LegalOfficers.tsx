import React from "react";
import { ColorTheme } from "../../common/ColorTheme";
import { LegalOfficer } from "../../common/types/LegalOfficer";

import { LegalOfficerDecisionStatus, ProtectionRequestStatus } from "../../common/types/ModelTypes";

import SelectLegalOfficer, { Mode } from './SelectLegalOfficer';
import './LegalOfficers.css';

export interface Props {
    legalOfficers: LegalOfficer[],
    legalOfficer1: LegalOfficer | null,
    setLegalOfficer1: (legalOfficer: LegalOfficer) => void,
    legalOfficer2: LegalOfficer | null,
    setLegalOfficer2: (legalOfficer: LegalOfficer) => void,
    colorTheme: ColorTheme,
    mode: Mode,
    legalOfficer1Decision?: LegalOfficerDecisionStatus,
    legalOfficer2Decision?: LegalOfficerDecisionStatus,
    status: ProtectionRequestStatus | null,
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
                    colorTheme={ props.colorTheme }
                    legalOfficers={ props.legalOfficers }
                    mode={ props.mode }
                    decision={ props.legalOfficer1Decision }
                    status={ props.status }
                />
            </div>

            <div className="legal-officer2">
                <SelectLegalOfficer
                    legalOfficerNumber={ 2 }
                    legalOfficer={ props.legalOfficer2 }
                    otherLegalOfficer={ props.legalOfficer1 }
                    setLegalOfficer={ props.setLegalOfficer2 }
                    colorTheme={ props.colorTheme }
                    legalOfficers={ props.legalOfficers }
                    mode={ props.mode }
                    decision={ props.legalOfficer2Decision }
                    status={ props.status }
                />
            </div>
        </div>
    );
}
