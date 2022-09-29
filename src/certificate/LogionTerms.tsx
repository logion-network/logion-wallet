import { LogionClassification } from "@logion/client";
import InlineDateTime from "src/common/InlineDateTime";

import "./LogionTerms.css";

export interface Props {
    terms: LogionClassification;
}

export default function LogionTerms(props: Props) {
    const { terms } = props;

    const regionalLimit = terms.regionalLimit || [];
    return (
        <ul className="LogionTerms">
            {
                terms.transferredRights.map((transferredRight, index) => (
                    <li key={ index }>
                        <span className="short-code">{ transferredRight.shortDescription } ({ transferredRight.code })</span>
                        <span className="description">{ transferredRight.description }</span>
                        {
                            transferredRight.code === "REG" &&
                            <>
                                <br/>
                                <span className="recorded-data">&gt; Recorded data: { regionalLimit.join(" - ") }</span>
                            </>
                        }
                        {
                            transferredRight.code === "TIME" &&
                            <>
                                <br/>
                                <span className="recorded-data">&gt; Recorded data: <InlineDateTime dateTime={ terms.expiration } dateOnly={ true } /></span>
                            </>
                        }
                    </li>
                ))
            }
        </ul>
    );
}
