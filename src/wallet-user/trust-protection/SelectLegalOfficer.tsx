import React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

import { ColorTheme, ORANGE, GREEN, RED } from "../../component/ColorTheme";
import Select, { OptionType } from '../../component/Select';
import LegalOfficer from "../../component/types/LegalOfficer";
import Icon from "../../component/Icon";

import { LegalOfficerDecisionStatus } from "../../legal-officer/Types";

import Officer from './Officer';
import './SelectLegalOfficer.css';

export type Mode = 'choose' | 'view';

function buildOption(legalOfficer: LegalOfficer): OptionType {
    return {
        label: legalOfficer.name,
        value: legalOfficer.address,
    };
}

export interface Props {
    legalOfficerNumber: number,
    legalOfficers: LegalOfficer[],
    legalOfficer: LegalOfficer | null,
    otherLegalOfficer: LegalOfficer | null,
    setLegalOfficer: (legalOfficer: LegalOfficer) => void,
    colorTheme: ColorTheme,
    mode: Mode,
    decision?: LegalOfficerDecisionStatus,
}

export default function SelectLegalOfficer(props: Props) {

    const legalOfficersByAddress: Record<string, LegalOfficer> = {};
    const legalOfficersOptions: OptionType[] = [];
    props.legalOfficers.forEach(legalOfficer => {
        legalOfficersOptions.push(buildOption(legalOfficer));
        legalOfficersByAddress[legalOfficer.address] = legalOfficer;
    });

    const label = props.mode === 'choose' ? `Choose Legal Officer N°${props.legalOfficerNumber}`: `Legal Officer N°${props.legalOfficerNumber}`;
    let icon;
    let status;
    let borderColor;
    if(props.decision !== undefined) {
        if(props.decision === "PENDING") {
            icon = (<Icon
                colorThemeType={ props.colorTheme.type }
                icon={{ id: "pending" }}
            />);
            status = <span style={{color: ORANGE}}>Pending</span>;
            borderColor = ORANGE;
        } else if(props.decision === "ACCEPTED") {
            icon = (<Icon
                colorThemeType={ props.colorTheme.type }
                icon={{ id: "accepted" }}
            />);
            status = <span style={{color: GREEN}}>Accepted</span>;
            borderColor = GREEN;
        } else if(props.decision === "REJECTED") {
            icon = (<Icon
                colorThemeType={ props.colorTheme.type }
                icon={{ id: "rejected" }}
            />);
            status = <span style={{color: RED}}>Rejected</span>;
            borderColor = RED;
        } else {
            icon = null;
            status = null;
        }
    }

    return (
        <div className="SelectLegalOfficer">
            <Row>
                <Col md={ 8 }>
                    <Form.Group controlId={ `legalOfficer${props.legalOfficerNumber}` } data-testid={ `legalOfficer${props.legalOfficerNumber}` }>
                        <Form.Label>{ label }</Form.Label>
                        <Select
                            isInvalid={ props.legalOfficer === null || (props.otherLegalOfficer !== null && props.legalOfficer.address === props.otherLegalOfficer.address) }
                            options={ legalOfficersOptions }
                            value={ props.legalOfficer !== null ? buildOption(props.legalOfficer) : null}
                            onChange={ value => props.setLegalOfficer(legalOfficersByAddress[value!.value] || null) }
                            colors={ props.colorTheme.select }
                            disabled={ props.mode === "view" }
                        />
                        <Form.Control.Feedback
                            type="invalid"
                            data-testid={ `legalOfficer${props.legalOfficerNumber}Message` }
                        >
                            Required and different from other legal officer
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={ 4 }>
                    <div className="icon-status">
                        { icon } { status }
                    </div>
                </Col>
            </Row>
            <Officer
                officer={ props.legalOfficer }
                colors={ props.colorTheme.frame }
                borderColor={ borderColor }
            />
        </div>
    );
}
