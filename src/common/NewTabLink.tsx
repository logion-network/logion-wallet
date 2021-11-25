import { Children, customClassName } from "./types/Helpers";
import './NewTabLink.css'
import Icon from "./Icon";

export interface Props {
    href: string
    children: Children
    iconId?: string
    inline?: boolean;
}

export default function NewTabLink(props: Props) {
    const className = customClassName("NewTabLink", (props.inline !== undefined && props.inline ? "inline" : undefined))
    return (
        <div className={ className }>
            <a href={ props.href } target="_blank" rel="noreferrer">
                { props.children }
                { props.iconId && <Icon icon={ { id: props.iconId } } height="30px" /> }
            </a>
        </div>
    )
}
