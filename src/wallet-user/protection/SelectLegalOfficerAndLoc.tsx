import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { LegalOfficerClass, ProtectionRequestStatus } from "@logion/client";

import { ORANGE, GREEN, RED, YELLOW, BackgroundAndForegroundColors } from "../../common/ColorTheme";
import Select, { OptionType } from '../../common/Select';
import Icon from "../../common/Icon";
import FormGroup from '../../common/FormGroup';
import { useCommonContext } from '../../common/CommonContext';

import Officer from './Officer';

import './SelectLegalOfficerAndLoc.css';
import { UUID } from "@logion/node-api";

export type Mode = 'select' | 'view';

export interface LegalOfficerAndLoc {
    legalOfficer: LegalOfficerClass;
    loc: UUID;
}

export function buildOptions(legalOfficers: LegalOfficerAndLoc[]): OptionType<string>[] {
    const options: OptionType<string>[] = [];
    legalOfficers.forEach(legalOfficer => {
        options.push(buildOption(legalOfficer));
    });
    return options;
}

function buildOption(legalOfficerAndLoc: LegalOfficerAndLoc): OptionType<string> {
    return {
        label: legalOfficerAndLoc.legalOfficer.name,
        value: legalOfficerAndLoc.loc.toString(),
    };
}

export interface Props {
    legalOfficerNumber: number,
    legalOfficersAndLocs: LegalOfficerAndLoc[],
    legalOfficerAndLoc: LegalOfficerAndLoc | null,
    otherLegalOfficerAndLoc: LegalOfficerAndLoc | null,
    setLegalOfficerAndLoc?: (legalOfficer: LegalOfficerAndLoc) => void,
    mode: Mode,
    status?: ProtectionRequestStatus,
    label: string,
    fillEmptyOfficerDetails?: boolean,
    colors?: BackgroundAndForegroundColors,
    feedback?: string
}

export default function SelectLegalOfficerAndLoc(props: Props) {
    const { colorTheme } = useCommonContext();
    const colors = props.colors !== undefined ? props.colors : colorTheme.frame;
    const feedback = props.feedback ? props.feedback : "Required and different from other legal officer";
    const { label } = props;
    const legalOfficersOptions = buildOptions(props.legalOfficersAndLocs);
    const legalOfficersByLocId: Record<string, LegalOfficerAndLoc> = {};
    props.legalOfficersAndLocs.forEach(legalOfficerAndLoc => {
        legalOfficersByLocId[legalOfficerAndLoc.loc.toString()] = legalOfficerAndLoc;
    });

    let icon;
    let status;
    let statusColor: string | undefined = undefined;
    if(props.status === "PENDING") {
        statusColor = ORANGE;
        icon = (<Icon
            icon={{ id: "pending" }}
        />);
        status = <span style={{color: statusColor}}>Pending</span>;
    } else if(props.status === "ACTIVATED") {
        statusColor = GREEN;
        icon = (<Icon
            icon={{ id: "activated" }}
        />);
        status = <span style={{color: statusColor}}>Accepted</span>;
    } else if(props.status === "ACCEPTED") {
        statusColor = YELLOW;
        icon = (<Icon
            icon={{ id: "accepted" }}
        />);
        status = <span style={{color: statusColor}}>Accepted</span>;
    } else if(props.status === "REJECTED") {
        statusColor = RED;
        icon = (<Icon
            icon={{ id: "rejected" }}
        />);
        status = <span style={{color: statusColor}}>Rejected</span>;
    } else {
        icon = null;
        status = null;
    }

    return (
        <div className="SelectLegalOfficerAndLoc">
            <Row>
                <Col md={ 8 }>
                    <FormGroup
                        id={ `legalOfficer${props.legalOfficerNumber}` }
                        label={ label }
                        control={
                            <Select
                                isInvalid={ props.legalOfficerAndLoc === null || (props.otherLegalOfficerAndLoc !== null && props.legalOfficerAndLoc.legalOfficer.account.equals(props.otherLegalOfficerAndLoc.legalOfficer.account)) }
                                options={ legalOfficersOptions }
                                value={ props.legalOfficerAndLoc !== null ? props.legalOfficerAndLoc.loc.toString() : null}
                                onChange={ value => props.setLegalOfficerAndLoc!(legalOfficersByLocId[value!] || null) }
                                disabled={ props.mode === "view" }
                                statusColor={ statusColor }
                            />
                        }
                        feedback={ feedback }
                        colors={ colors }
                    />
                </Col>
                <Col md={ 4 }>
                    <div className="icon-status">
                        { icon } { status }
                    </div>
                </Col>
            </Row>
            <Officer
                officer={ props.legalOfficerAndLoc?.legalOfficer || null }
                colors={ colors }
                borderColor={ statusColor }
                fillEmptyOfficerDetails={ props.fillEmptyOfficerDetails }
            />
        </div>
    );
}
