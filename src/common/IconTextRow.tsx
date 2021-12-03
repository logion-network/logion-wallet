import './IconTextRow.css';
import { Children } from './types/Helpers';

export interface Props {
    icon: Children;
    text: Children;
}

export default function IconTextRow(props: Props) {
    return (
        <div className="IconTextRow">
            <div className="icon">
                { props.icon }
            </div>
            <div className="text">
                { props.text }
            </div>
        </div>
    );
}
