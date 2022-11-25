import { LogionClassification } from "@logion/client";
import { UUID } from "@logion/node-api";
import { useMemo } from "react";
import InlineDateTime from "src/common/InlineDateTime";
import { SofCollectionItem } from "./SofParams";

export interface Props {
    item: SofCollectionItem;
}

export default function SofTermsAndConditionsEN(props: Props) {

    const { logionClassification, specificLicenses, creativeCommons } = props.item;

    const actualLogionClassification = useMemo(() => logionClassification ?
        LogionClassification.fromDetails(new UUID(logionClassification.locId), logionClassification.details) : undefined
    , [ logionClassification ]);

    const regionalLimit = useMemo(() => actualLogionClassification?.regionalLimit || [], [ actualLogionClassification ]);

    return (
        <div>
            <h4>Terms and conditions</h4>

            <h5>IP rights granted with this Collection Item</h5>
            {
                !actualLogionClassification && !creativeCommons &&
                <p>None</p>
            }
            {
                actualLogionClassification !== undefined &&
                <>
                <p>This is a human-readable summary (but not a substitute) of the Logion IP transfer classification (“LITC”):&nbsp;
                    LITC-v1.0.txt (available here: { props.item.litcUrl })
                    &nbsp;/&nbsp;
                    LITC-v1.0 certificate (available here: { props.item.litcLocUrl })
                </p>
                <p>Should an additional license exist between the parties that shall apply to the subject of this Collection Item, the parties agreed that the LITC supersedes in case of conflict.</p>
                <ul>
                    {
                        actualLogionClassification.transferredRights('en').map((right, index) => (
                            <li key={ index }>
                                <span><strong>{ right.shortDescription } ({ right.code }):</strong> { right.description }</span>
                                {
                                    right.code === "REG" &&
                                    <>
                                        <br/>
                                        <span className="recorded-data">&gt; Recorded data: { regionalLimit.join(" - ") }</span>
                                    </>
                                }
                                {
                                    right.code === "TIME" &&
                                    <>
                                        <br/>
                                        <span className="recorded-data">&gt; Recorded data: <InlineDateTime dateTime={ actualLogionClassification.expiration } dateOnly={ true } /></span>
                                    </>
                                }
                            </li>
                        ))
                    }
                </ul>
                </>
            }

            {
                creativeCommons !== undefined &&
                <div className="creative-commons">
                    <div className="creative-commons-main">
                        <img className="creative-commons-badge" src={ creativeCommons.badgeUrl } alt={ creativeCommons.code } />
                        <p className="creative-commons-text">This work is licensed under a <a
                            href={ creativeCommons.url }>
                            Creative Commons Attribution 4.0 International License</a>
                        </p>
                    </div>
                    <a href={ creativeCommons.url }>{ creativeCommons.url }</a>
                </div>
            }

            {
                (specificLicenses === undefined || specificLicenses.length === 0) &&
                <>
                <h5>Additional licensing terms / contract</h5>
                <p>None</p>
                </>
            }
            {
                specificLicenses && specificLicenses.map(element => (
                    <>
                    <h5>Additional licensing terms / contract</h5>
                    <p>The Requester provided an additional specific contract with regards to the Collection Item Underlying Asset. This contract has been recorded in a LOC with the following ID:</p>
                    <p>{ element.tcLocId.toDecimalString() }</p>
                    </> 
                ))
            }
        </div>
    );
}
