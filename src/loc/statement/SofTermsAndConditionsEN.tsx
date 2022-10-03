import { LogionClassification, SpecificLicense } from "@logion/client";
import { useMemo } from "react";
import InlineDateTime from "src/common/InlineDateTime";
import { SofCollectionItem } from "./SofParams";

export interface Props {
    item: SofCollectionItem;
}

export default function SofTermsAndConditionsEN(props: Props) {

    const logionClassification = useMemo(() => getLogionClassification(props.item), [ props.item ]);
    const specificLicences = useMemo(() => getSpecificLicenses(props.item), [ props.item ]);
    const regionalLimit = useMemo(() => logionClassification?.regionalLimit || [], [ logionClassification ]);

    return (
        <div>
            <h4>Terms and conditions</h4>

            <h5>IP rights granted with this Collection Item</h5>
            {
                !logionClassification &&
                <p>None</p>
            }
            {
                logionClassification !== undefined &&
                <>
                <p>This is a human-readable summary (but not a substitute) of the Logion IP transfer classification (“LITC”):&nbsp;
                    LITC-v1.0.txt (available here: { props.item.litcUrl })
                    &nbsp;/&nbsp;
                    LITC-v1.0 certificate (available here: { props.item.litcLocUrl })
                </p>
                <p>Should an additional license exist between the parties that shall apply to the subject of this Collection Item, the parties agreed that the LITC supersedes in case of conflict.</p>
                <ul>
                    {
                        logionClassification.transferredRights('en').map((right, index) => (
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
                                        <span className="recorded-data">&gt; Recorded data: <InlineDateTime dateTime={ logionClassification.expiration } dateOnly={ true } /></span>
                                    </>
                                }
                            </li>
                        ))
                    }
                </ul>
                </>
            }

            {
                specificLicences.length === 0 &&
                <>
                <h5>Additional licensing terms / contract</h5>
                <p>None</p>
                </>
            }
            {
                specificLicences.map(element => (
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

function getLogionClassification(item: SofCollectionItem): LogionClassification | undefined {
    const element = item.termsAndConditions.find(element => element.type === "logion_classification");
    if(element) {
        return LogionClassification.fromDetails(element.tcLocId, element.details);
    } else {
        return undefined;
    }
}

function getSpecificLicenses(item: SofCollectionItem): SpecificLicense[] {
    return item.termsAndConditions
        .filter(element => element.type === "specific_license")
        .map(element => SpecificLicense.fromDetails(element.tcLocId, element.details));
}
