import './Checkbox.css';

export interface Props {
    checked: boolean;
    setChecked: (value: boolean) => void;
}

export default function Checkbox(props: Props) {
    return (
        <div role="checkbox" aria-checked={ props.checked } className={"Checkbox" + ( props.checked ? " checked": "")} onClick={() => props.setChecked(!props.checked)}></div>
    );
}
