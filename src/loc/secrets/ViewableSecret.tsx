import { useState } from "react";
import Checkbox from "../../components/toggle/Checkbox";
import "./ViewableSecret.css";

export interface Props {
    value: string;
}

export default function ViewableSecret(props: Props) {
    const [ hidden, setHidden ] = useState<boolean>(true);
    return (
        <div className="ViewableSecret">
            { !hidden && <span>{ props.value }</span> }
            { hidden && <span>******</span> }
            <Checkbox checked={ hidden } setChecked={ setHidden } skin="Eye" />
        </div>
    )
}
