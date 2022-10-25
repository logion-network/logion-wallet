import { useMemo } from "react";
import InlineDateTime from "src/common/InlineDateTime";
import { SofCollectionItem } from "./SofParams";

export interface Props {
    item: SofCollectionItem;
}

export default function SofTermsAndConditionsFR(props: Props) {

    const { logionClassification, specificLicenses, creativeCommons } = props.item;
    const regionalLimit = useMemo(() => logionClassification?.regionalLimit || [], [ logionClassification ]);

    return (
        <div>
            <h4>Conditions générales</h4>

            <h5>Droit de propriété intellectuelle attribué avec ce Collection Item</h5>
            {
                !logionClassification && !creativeCommons &&
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
                creativeCommons !== undefined &&
                <div className="creative-commons">
                    <img className="creative-commons-badge" src={ creativeCommons.badgeUrl } alt={ creativeCommons.code } />
                    <p className="creative-commons-text">Ce travail est soumis aux termes de la licence <a href={ creativeCommons.url }>Creative Commons Attribution 4.0 International License</a></p>
                </div>
            }

            {
                (specificLicenses === undefined || specificLicenses.length === 0) &&
                <>
                <h5>Licence / Contrat additionnel</h5>
                <p>Aucun</p>
                </>
            }
            {
                specificLicenses && specificLicenses.map(element => (
                    <>
                    <h5>Licence / Contrat additionnel</h5>
                    <p>Le Demandeur a fournit un contract spécifique additionnel portant sur l'objet sous-jacent sur lequel porte ce Collection Item. Ce contrat a été enregistré dans un dossier numérique logion (LOC) dont l'identifiant est:</p>
                    <p>{ element.tcLocId.toDecimalString() }</p>
                    </> 
                ))
            }
        </div>
    );
}
