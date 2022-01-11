import { GREEN, RED } from '../common/ColorTheme';
import Icon from '../common/Icon';
import './CheckFileResult.css';

export type CheckFileResultType = 'POSITIVE' | 'NEGATIVE';

export interface Props {
    type: CheckFileResultType;
    hash: string;
}

export default function CheckFileResult(props: Props) {
    return (
        <div className="CheckFileResult">
            {
                props.type === "POSITIVE" &&
                <>
                    <p><strong>Check result: <span style={{color: GREEN}}>positive</span></strong></p>
                    <p>The document you uploaded has the following "hash":<br/><strong>{props.hash}</strong><br/>
                    and is referenced in the above LOC at the line <strong>with a dotted pink border</strong>.</p>
                    <Icon icon={{id: "ok"}} />
                </>
            }
            {
                props.type === "NEGATIVE" &&
                <>
                    <p><strong>Check result: <span style={{color: RED}}>negative</span></strong></p>
                    <p>The document you uploaded has the following "hash":<br/><strong>{props.hash}</strong><br/>
                    and <strong>has NO match in the above LOC</strong>. Please be careful and execute a deeper due diligence.</p>
                    <Icon icon={{id: "ko"}} />
                </>
            }
        </div>
    );
}
