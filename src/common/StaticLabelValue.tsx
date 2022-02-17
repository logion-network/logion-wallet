import './StaticLabelValue.css';
import { Children } from './types/Helpers';

export interface Props {
    label: string;
    value: Children;
}

export default function StaticLabelValue(props: Props) {
    return (
        <div className="StaticLabelValue">
            <div className="label">{ props.label }</div>
            <div className="value">{ props.value }</div>
        </div>
    );
}
