import { Col, Form, Row } from 'react-bootstrap';
import FormGroup from 'src/common/FormGroup';
import CheckedControl from '../common/CheckedControl';
import { BackgroundAndForegroundColors } from '../common/ColorTheme';
import DatePicker from '../common/DatePicker';

import './CollectionLimitsForm.css'
import { LogionNodeApiClass, ChainTime } from "@logion/node-api";

export interface ApiLimits {
    collectionCanUpload: boolean,
    collectionLastBlockSubmission: bigint | undefined,
    collectionMaxSize: number | undefined,
}

export class CollectionLimits {

    constructor(args: {
        hasDateLimit?: boolean,
        dateLimit?: Date | null,
        hasDataNumberLimit?: boolean,
        dataNumberLimit?: string,
        canUpload: boolean,
    }) {
        this.hasDateLimit = args.hasDateLimit || false;
        this.dateLimit = args.dateLimit || null;
        this.hasDataNumberLimit = args.hasDataNumberLimit || false;
        this.dataNumberLimit = args.dataNumberLimit || "";
        this.canUpload = args.canUpload;
    }

    readonly hasDateLimit: boolean;
    readonly dateLimit: Date | null;
    readonly hasDataNumberLimit: boolean;
    readonly dataNumberLimit: string;
    readonly canUpload: boolean;

    areValid(): boolean {
        return (this.hasDateLimit && (this.dateLimit ? true : false)) || (this.hasDataNumberLimit && (this.dataNumberLimit ? true : false));
    }

    async toApiLimits(api: LogionNodeApiClass): Promise<ApiLimits> {
        let lastBlock: bigint | undefined;
        if(this.hasDateLimit) {
            const now = await ChainTime.now(api!.polkadot);
            const atDateLimit = await now.atDate(this.dateLimit!);
            lastBlock = atDateLimit.currentBlock;
        }

        let maxSize: number | undefined;
        if(this.hasDataNumberLimit) {
            maxSize = Number(this.dataNumberLimit);
        }

        return {
            collectionCanUpload: this.canUpload,
            collectionLastBlockSubmission: lastBlock,
            collectionMaxSize: maxSize,
        }
    }
}

export const DEFAULT_LIMITS = new CollectionLimits({ canUpload: false });

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
                        valueControl={
                            <DatePicker
                                value={ props.value.dateLimit }
                                onChange={ (value: Date) => props.onChange(new CollectionLimits({
                                    ...props.value,
                                    dateLimit: value
                                })) }
                                minDate={ new Date(Date.now() + (1000 * 3600 * 24)) }
                            />
                        }
                        colors={ props.colors }
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
                        valueControl={
                            <Form.Control
                                value={ props.value.dataNumberLimit }
                                onChange={ e => props.onChange(new CollectionLimits({
                                    ...props.value,
                                    dataNumberLimit: e.target.value
                                })) }
                            />
                        }
                        colors={ props.colors }
                    />
                </div>
            </Col>
        </Row>
        <Row className="CollectionLimitsForm">
            <Col>
                <div className="can-upload-check-container">
                    <FormGroup
                        id="canUploadCheck"
                        control={
                            <Form.Check
                                label="Accepts upload of item files"
                                type="checkbox"
                                checked={ props.value.canUpload }
                                onChange={ () => props.onChange(new CollectionLimits({
                                    ...props.value,
                                    canUpload: !props.value.canUpload
                                })) }
                            />
                        }
                        colors={ props.colors }
                    />
                </div>
            </Col>
        </Row>
        </>
    );
}
