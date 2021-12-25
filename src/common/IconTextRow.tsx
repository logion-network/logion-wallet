import './IconTextRow.css';
import { Children, customClassName } from './types/Helpers';

export interface Props {
    icon: Children;
    text: Children;
    className?: string;
}

export default function IconTextRow(props: Props) {
    const className = customClassName("IconTextRow", props.className);
    return (
        <div className={ className }>
            <div className="icon">
                { props.icon }
            </div>
            <div className="text">
                { props.text }
            </div>
        </div>
    );
}
