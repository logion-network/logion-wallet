import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { LegalOfficer } from "@logion/client";
import { ProtectionRequestStatus } from "@logion/client/dist/RecoveryClient.js";

import { ORANGE, GREEN, RED, YELLOW, BackgroundAndForegroundColors } from "../../common/ColorTheme";
import Select, { OptionType } from '../../common/Select';
import Icon from "../../common/Icon";
import FormGroup from '../../common/FormGroup';
import { useCommonContext } from '../../common/CommonContext';

import Officer from './Officer';

import './SelectLegalOfficer.css';

export type Mode = 'select' | 'view';

export function buildOptions(legalOfficers: LegalOfficer[]): OptionType<string>[] {
    const options: OptionType<string>[] = [];
    legalOfficers.forEach(legalOfficer => {
        options.push(buildOption(legalOfficer));
    });
    return options;
}

function buildOption(legalOfficer: LegalOfficer): OptionType<string> {
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
    setLegalOfficer?: (legalOfficer: LegalOfficer) => void,
    mode: Mode,
    status?: ProtectionRequestStatus,
    label: string,
    fillEmptyOfficerDetails?: boolean,
    colors?: BackgroundAndForegroundColors,
    feedback?: string
}

export default function SelectLegalOfficer(props: Props) {
    const { colorTheme } = useCommonContext();
    const colors = props.colors !== undefined ? props.colors : colorTheme.frame;
    const feedback = props.feedback ? props.feedback : "Required and different from other legal officer";
    const { label } = props;
    const legalOfficersOptions = buildOptions(props.legalOfficers);
    const legalOfficersByAddress: Record<string, LegalOfficer> = {};
    props.legalOfficers.forEach(legalOfficer => {
        legalOfficersByAddress[legalOfficer.address] = legalOfficer;
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
        <div className="SelectLegalOfficer">
            <Row>
                <Col md={ 8 }>
                    <FormGroup
                        id={ `legalOfficer${props.legalOfficerNumber}` }
                        label={ label }
                        control={
                            <Select
                                isInvalid={ props.legalOfficer === null || (props.otherLegalOfficer !== null && props.legalOfficer.address === props.otherLegalOfficer.address) }
                                options={ legalOfficersOptions }
                                value={ props.legalOfficer !== null ? props.legalOfficer.address : null}
                                onChange={ value => props.setLegalOfficer!(legalOfficersByAddress[value!] || null) }
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
                officer={ props.legalOfficer }
                colors={ colors }
                borderColor={ statusColor }
                fillEmptyOfficerDetails={ props.fillEmptyOfficerDetails }
            />
        </div>
    );
}
