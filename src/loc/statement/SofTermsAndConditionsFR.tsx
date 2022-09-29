import { LogionClassification, SpecificLicense, LogionTransferredRightCode, LogionTransferredRightDescription } from "@logion/client";
import { useMemo } from "react";
import InlineDateTime from "src/common/InlineDateTime";
import { SofCollectionItem } from "./SofParams";

export interface Props {
    item: SofCollectionItem;
}

export default function SofTermsAndConditionsFR(props: Props) {

    const logionClassification = useMemo(() => getLogionClassification(props.item), [ props.item ]);
    const specificLicences = useMemo(() => getSpecificLicenses(props.item), [ props.item ]);
    const regionalLimit = useMemo(() => logionClassification?.regionalLimit || [], [ logionClassification ]);

    return (
        <div>
            <h4>Terms and conditions</h4>

            <p>IP rights granted with this Collection Item</p>
            {
                !logionClassification &&
                <p>None</p>
            }
            {
                logionClassification !== undefined &&
                <>
                <p>This is a human-readable summary (but not a substitute) of the Logion IP transfer classification (“LITC”):
                    LITC-v1.0.txt
                    /
                    LITC-v1.0 certificate
                </p>
                <p>Should an additional license exist between the parties that shall apply to the subject of this Collection Item, the parties agreed that the LITC supersedes in case of conflict.</p>
                <ul>
                    {
                        logionClassification.transferredRights.map((right, index) => (
                            <li key={ index }>
                                <span>{ DESCRIPTIONS[right.code].shortDescription } ({ right.code }): { DESCRIPTIONS[right.code].description }</span>
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
                <p>Additional licensing terms / contract</p>
                <p>None</p>
                </>
            }
            {
                specificLicences.map(element => (
                    <>
                    <p>Additional licensing terms / contract</p>
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

export const DESCRIPTIONS: Record<LogionTransferredRightCode, LogionTransferredRightDescription> = {
    "PER-PRIV": {
        shortDescription: "PERSONAL, PRIVATE USE ONLY",
        description:
            "Use the Underlying Asset for your personal use, exclusively in private spheres and so long as that " +
            "personal use is non-commercial, i.e. does not, directly or indirectly, result in compensation, " +
            "financial benefit or commercial gain, To the extent that such use is non-commercial and private, you " +
            "may use, reproduce, display and as necessary perform but not modify the Underlying Asset."
    },
    "PER-PUB": {
        shortDescription: "PERSONAL, PRIVATE, AND PUBLIC USE",
        description:
            "Use the Underlying Asset for your personal use, both in private and public spheres and so long as that " +
            "personal use is non-commercial, i.e. does not, directly or indirectly, result in compensation, " +
            "financial benefit or commercial gain, Includes the right to display the Underlying Assets as a profile " +
            "picture or in the metaverse. To the extent that such use is non-commercial, you may use, reproduce, " +
            "display and as necessary perform but not modify the Underlying Asset."
    },
    "COM-NOMOD": {
        shortDescription: "COMMERCIAL USE WITHOUT MODIFICATION",
        description:
            "Use the Underlying Asset for commercial use, i.e. directly or indirectly, results in compensation, " +
            "financial benefit or commercial gain and may include promoting, marketing, advertising, and selling. " +
            "Such commercial use includes the right to use, reproduce, display, distribute and as necessary perform, " +
            "but not modify the Underlying Asset. Commercial use also confers personal, private and public use of " +
            "the Underlying Asset. Includes the right to display the Underlying Asset as a profile picture, display " +
            "on products or services using the Underlying Asset, display on sold merchandise, display in a physical " +
            "or digital museum. Includes the right to sublicense such rights."
    },
    "COM-MOD": {
        shortDescription: "COMMERCIAL USE WITH THE RIGHT TO MODIFY",
        description:
            "Use the Underlying Asset for commercial use, i.e. directly or indirectly, results in compensation, " +
            "financial benefit or commercial gain and may include promoting, marketing, advertising, and selling. " +
            "Such commercial use includes the right to use, reproduce, display, distribute and as necessary perform " +
            "and modify the Underlying Asset. Includes the right to adapt the Underlying Asset, i.e. to recast, " +
            "transform, translate or adapt, including in any form recognizably derived from the original and in so " +
            "doing create derivative works of art. Commercial use also confers personal, private and public use of " +
            "the Underlying Asset. Includes the right to display the Underlying Asset as a profile picture, display " +
            "on products or services using the Underlying Asset and/or its derivatives, display on sold merchandise, " +
            "display in a physical or digital museum. Includes the right to sublicense such rights."
    },
    "EX": {
        shortDescription: "EXCLUSIVE USE",
        description:
            "The above-mentioned rights, as applicable, are exclusive in nature, i.e. are licensed and/or assigned " +
            "to no other person or entity."
    },
    "NOEX": {
        shortDescription: "NON-EXCLUSIVE USE",
        description:
            "The above-mentioned rights, as applicable, are non-exclusive in nature, i.e. they can be licensed " +
            "and/or assigned to other persons or entities."
    },
    "WW": {
        shortDescription: "WORLDWIDE USE",
        description:
            "Covers use in all countries of the world, existing and future, not limited territorially."
    },
    "REG": {
        shortDescription: "COUNTRY-SPECIFIC OR REGIONAL USE",
        description:
            "Means that some territorial limitations apply. The list of allowed countries is recorded by the logion " +
            "infrastructure."
    },
    "NOTIME": {
        shortDescription: "FOR THE ENTIRE DURATION OF THE IP RIGHTS",
        description:
            "The duration of the IP rights contemplated - author rights and copyright - are for the entire life of " +
            "the Creator and 70 years afterward, counted from the moment the work of art has been disclosed."
    },
    "TIME": {
        shortDescription: "FOR A LIMITED PERIOD OF TIME",
        description:
            "Means that the license/assignment grant is limited in time as recorded by the logion infrastructure"
    },
}
