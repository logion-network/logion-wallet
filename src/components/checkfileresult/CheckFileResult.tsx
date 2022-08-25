import { Children } from 'src/common/types/Helpers';

import './CheckFileResult.css';

export interface Props {
    children: Children;
}

export default function CheckFileResult(props: Props) {
    return (
        <div className="CheckFileResult">
            { props.children }
        </div>
    );
}
