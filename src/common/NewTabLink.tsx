import { Children } from "./types/Helpers";
import './NewTabLink.css'
import Icon from "./Icon";

export interface Props {
    href: string
    children: Children
    iconId?: string
}

export default function NewTabLink(props: Props) {
    return (
        <div className="NewTabLink">
            <a href={ props.href } target="_blank" rel="noreferrer">
                { props.children }
                { props.iconId && <Icon icon={ { id: props.iconId } } /> }
            </a>
        </div>
    )
}
