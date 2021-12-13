import { Link } from "react-router-dom";
import DangerFrame from "./DangerFrame";
import Icon from "./Icon";
import IconTextRow from "./IconTextRow";

import './NetworkWarning.css';

export interface Props {
    settingsPath?: string;
}

export default function NetworkWarning(props: Props) {

    return (
        <DangerFrame className="NetworkWarning">
            <IconTextRow
                icon={ <Icon icon={{id: 'ko'}} width="45px" /> }
                text={
                    <>
                        <p>The logion network is partially unavailable. As a consequence, some data may be temporarily
                        unavailable.</p>
                        {
                            props.settingsPath !== undefined &&
                            <p>See <Link to={ props.settingsPath }>Settings</Link> for more details.</p>
                        }
                    </>
                }
            />
        </DangerFrame>
    );
}
