import { useCommonContext } from './CommonContext';

import './Detail.css';

export interface Props {
    label: string,
    value: string,
}

export default function Detail(props: Props) {
    const { colorTheme } = useCommonContext();

    return (
        <div
            className="Detail"
            style={{
                color: colorTheme.dashboard.foreground,
            }}
        >
            <div className="label">{ props.label }</div>
            <div className="value">{ props.value }</div>
        </div>
    );
}
