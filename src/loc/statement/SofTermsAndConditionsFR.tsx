import { LogionClassification, SpecificLicense } from "@logion/client";
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
            <h4>Conditions générales</h4>

            <h5>Droit de propriété intellectuelle attribué avec ce Collection Item</h5>
            {
                !logionClassification &&
                <p>Aucun</p>
            }
            {
                logionClassification !== undefined &&
                <>
                <p>Ce qui suit est une version simplifiée (mais ne remplaçant pas) la classification logion des transferts de propriété intellectuelle. La version de référence de ce texte est Logion IP Transfer Classification ("LTIC"):&nbsp;
                    LITC-v1.0.txt (accessible à l'adresse : { props.item.litcUrl })
                    &nbsp;/&nbsp;
                    LITC-v1.0 certificate (accessible à l'adresse : { props.item.litcLocUrl })
                </p>
                <p>Dans le cas où une licence additionnelle existe entre les parties et s'applique à l'objet du Collection Item, les parties acceptent que les termes de la classification LTIC priment en cas de conflit.</p>
                <ul>
                    {
                        logionClassification.transferredRights('fr').map((right, index) => (
                            <li key={ index }>
                                <span><strong>{ right.shortDescription } ({ right.code }):</strong> { right.description }</span>
                                {
                                    right.code === "REG" &&
                                    <>
                                        <br/>
                                        <span className="recorded-data">&gt; Donnée(s) Enregistrée(s): { regionalLimit.join(" - ") }</span>
                                    </>
                                }
                                {
                                    right.code === "TIME" &&
                                    <>
                                        <br/>
                                        <span className="recorded-data">&gt; Donnée(s) Enregistrée(s): <InlineDateTime dateTime={ logionClassification.expiration } dateOnly={ true } /></span>
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
                <h5>Licence / Contrat additionnel</h5>
                <p>Aucun</p>
                </>
            }
            {
                specificLicences.map(element => (
                    <>
                    <h5>Additional licensing terms / contract</h5>
                    <p>Le Demandeur a fournit un contract spécifique additionnel portant sur l'objet sous-jacent sur lequel porte ce Collection Item. Ce contrat a été enregistré dans un dossier numérique logion (LOC) dont l'identifiant est:</p>
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
