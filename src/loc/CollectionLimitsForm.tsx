import { Col, Row } from 'react-bootstrap';
import CheckedControl from '../common/CheckedControl';
import { BackgroundAndForegroundColors } from '../common/ColorTheme';
import Icon from '../common/Icon';

import './CollectionLimitsForm.css'

export class CollectionLimits {

    constructor(args: {
        hasDateLimit?: boolean,
        dateLimit?: string,
        hasDataNumberLimit?: boolean,
        dataNumberLimit?: string,
    }) {
        this.hasDateLimit = args.hasDateLimit || false;
        this.dateLimit = args.dateLimit || "";
        this.hasDataNumberLimit = args.hasDataNumberLimit || false;
        this.dataNumberLimit = args.dataNumberLimit || "";
    }

    readonly hasDateLimit: boolean;
    readonly dateLimit: string;
    readonly hasDataNumberLimit: boolean;
    readonly dataNumberLimit: string;

    areValid(): boolean {
        return (this.hasDateLimit && (this.dateLimit ? true : false)) || (this.hasDataNumberLimit && (this.dataNumberLimit ? true : false));
    }
}

export const DEFAULT_LIMITS = new CollectionLimits({});

export interface Props {
    value: CollectionLimits;
    onChange: (limits: CollectionLimits) => void;
    colors: BackgroundAndForegroundColors;
}

export default function CollectionLimitsForm(props: Props) {
    return (
        <>
        <Row className="CollectionLimitsForm">
            <Col>
                <div className="limit-container date">
                    <CheckedControl
                        baseId="dateLimit"
                        label="Date limit"
                        type="date"
                        checked={ props.value.hasDateLimit }
                        onChangeChecked={ () => props.onChange(new CollectionLimits({
                            ...props.value,
                            hasDateLimit: !props.value.hasDateLimit
                        })) }
                        value={ props.value.dateLimit }
                        onChangeValue={ value => props.onChange(new CollectionLimits({
                            ...props.value,
                            dateLimit: value
                        })) }
                        colors={ props.colors }
                        append={ <Icon icon={{id: 'calendar'}} /> }
                    />
                </div>
            </Col>
            <Col>
                <div className="limit-container data-number">
                    <CheckedControl
                        baseId="maxSize"
                        label="Data number limit"
                        type="number"
                        checked={ props.value.hasDataNumberLimit }
                        onChangeChecked={ () => props.onChange(new CollectionLimits({
                            ...props.value,
                            hasDataNumberLimit: !props.value.hasDataNumberLimit
                        })) }
                        value={ props.value.dataNumberLimit }
                        onChangeValue={ value => props.onChange(new CollectionLimits({
                            ...props.value,
                            dataNumberLimit: value
                        })) }
                        colors={ props.colors }
                    />
                </div>
            </Col>
        </Row>
        </>
    );
}
