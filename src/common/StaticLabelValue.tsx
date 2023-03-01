import './StaticLabelValue.css';
import { Children, customClassName } from './types/Helpers';

export interface Props {
    label: string;
    value: Children;
    tooltip?: boolean;
    formStyle?: boolean;
}

export default function StaticLabelValue(props: Props) {
    const className = customClassName("StaticLabelValue", props.formStyle ? "form-style" : undefined);
    return (
        <div className={ className }>
            <div className="label">{ props.label }</div>
            <div className="value">{ props.value }</div>
        </div>
    );
}
