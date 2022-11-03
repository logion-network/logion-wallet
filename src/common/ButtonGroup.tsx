import BootStrapButtonGroup, { ButtonGroupProps } from "react-bootstrap/ButtonGroup";
import "./ButtonGroup.css"
import { customClassName } from "./types/Helpers";

export interface Props extends ButtonGroupProps {
    align?: string;
    narrow?: boolean;
}

export default function ButtonGroup(props: Props) {
    const className = customClassName(
        "ButtonGroup",
        props.align,
        props.narrow ? "narrow" : undefined,
    );
    const filteredProperties = {
        ...props,
        narrow: undefined,
    };
    return (
        <div className={ className }>
            <BootStrapButtonGroup { ...filteredProperties } />
        </div>
    );
}
