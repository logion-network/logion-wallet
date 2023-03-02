import { Children, customClassName } from "./types/Helpers";
import './NewTabLink.css'
import Icon from "./Icon";

export interface Props {
    href: string | undefined;
    children?: Children;
    iconId?: string;
    inline?: boolean;
    className?: string;
}

export default function NewTabLink(props: Props) {
    const className = customClassName("NewTabLink",
        (props.inline !== undefined && props.inline ? "inline" : undefined),
        (props.className !== undefined && props.className ? props.className : undefined)
    )
    return (
        <span className={ className }>
            <a href={ props.href } target="_blank" rel="noreferrer">
                { props.children !== undefined && props.children }
                { props.children === undefined && "-" }
                { props.iconId && props.href && <Icon icon={ { id: props.iconId } } height="30px" /> }
            </a>
        </span>
    )
}
