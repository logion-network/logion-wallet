import React from "react";
import { ColorTheme } from "../../component/ColorTheme";
import LegalOfficer from "../../component/types/LegalOfficer";

import { LegalOfficerDecisionStatus } from "../../legal-officer/Types";

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
                />
            </div>
        </div>
    );
}
