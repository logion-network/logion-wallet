import { Children } from "./types/Helpers";
import "./Spacer.css"

export interface Props {
    children: Children
}

export default function Spacer(props: Props) {
    return (
        <div className="Spacer">
            { props.children }
        </div>
    );
}
