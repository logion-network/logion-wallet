import './Reading.css';

export interface Props {
    readingIntegerPart: string,
    readingDecimalPart?: string,
    unit: string,
    level: number
}

const RED: string = '#ea1f46';
const ORANGE: string = '#ff9b3f';
const GREEN: string = '#37ad4b';

export default function Reading(props: Props) {
    let color;
    if(props.level <= 0.1) {
        color = RED;
    } else if(props.level <= 0.5) {
        color = ORANGE;
    } else {
        color = GREEN;
    }

    return (
        <div className="Reading">
            <div className="value-unit">
                <div className="value"
                    style={{color}}
                >
                    <div className="integer-part">{props.readingIntegerPart}</div>
                    {
                        props.readingDecimalPart !== undefined &&
                        <div className="decimal-part">.{ props.readingDecimalPart }</div>
                    }
                </div>
                <div className="unit">{props.unit}</div>
            </div>
        </div>
    );
}
