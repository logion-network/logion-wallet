import './Checkbox.css';
import './Toggle.css';
import { customClassName } from "../../common/types/Helpers";

export type Skin = "Checkbox" | "Toggle";

export interface Props {
    checked: boolean;
    setChecked?: (value: boolean) => void;
    skin?: Skin
}

export default function Checkbox(props: Props) {
    const className = customClassName(
        props.skin || "Checkbox",
        props.checked ? "checked": undefined,
        props.setChecked ? "clickable" : undefined
    );
    return (
        <div role="checkbox" aria-checked={ props.checked } className={ className } onClick={() => props.setChecked && props.setChecked(!props.checked)}></div>
    );
}
