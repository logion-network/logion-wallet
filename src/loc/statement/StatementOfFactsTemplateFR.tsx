import { useEffect } from "react";
import { loadPagedJs } from "./PagedJS";
import { SofParams } from "./SofParams";
import SofTermsAndConditionsFR from "./SofTermsAndConditionsFR";
import SofTokensRecordFR from "./SofTokensRecordFR";
import SofFilesAndDeliveriesFR from "./SofFilesAndDeliveriesFR";

export interface Props {
    sofParams: SofParams;
}

export default function StatementOfFactsTemplateFR(props: Props) {

    useEffect(() => {
        loadPagedJs();
    }, []);

    return (
        <>
            <style>{`
                .pagedjs_pagebox > .pagedjs_area > .pagedjs_page_content {
                    background-image: url("${ props.sofParams.sealUrl }");
                    background-size: 100%;
                    background-position: center;
                    background-repeat: no-repeat;
                }
                .pagedjs_page .pagedjs_margin-bottom-center > .pagedjs_margin-content::after {
                    content: "Toutes les heures sont affichées en temps universel coordonné (UTC)";
                }
            `}</style>
            <div className="header">
                <div className="contact">
                    <div className="postal-address">
                        <div>{ props.sofParams.postalAddressLine1 }</div>
                        <div>{ props.sofParams.postalAddressLine2 }</div>
                        <div>{ props.sofParams.postalAddressLine3 }</div>
                        <div>{ props.sofParams.postalAddressLine4 }</div>
                        <div>{ props.sofParams.email }</div>
                    </div>
                </div>
                <div className="logo">
                    <img src={ props.sofParams.logoUrl } alt="logo" />
                </div>
            </div>

            <div className="polkadot-address">
                <div>Clé publique blockchain du Legal Officer:</div>
                <div>{ props.sofParams.polkadotAddress }</div>
            </div>

            <h1 className="main-title">
                Procès verbal de constat
            </h1>

            <div className="time">
                { props.sofParams.timestampText }
            </div>

            <h2 className="prerequisite-title">Prérequis</h2>
            { props.sofParams.prerequisites.map((prerequisite, index) => <div key={ index } className="prerequisite">
                    <h3>{ prerequisite.label }</h3>
                    { prerequisite.imageSrc.length > 0 &&
                        <img src={ prerequisite.imageSrc } width="100%" alt="Snapshot" />
                    }
                    { prerequisite.text.length > 0 &&
                        <p>{ prerequisite.text }</p>
                    }
                </div>
            ) }

            <h2 className="requester-title">Demandeur</h2>
            <p>{ props.sofParams.requesterText }</p>
            <p>Identifié par son ID : { props.sofParams.requester }</p>

            <p className="intro">Je, Soussigné, Me { props.sofParams.firstName } <span className="lastName">{ props.sofParams.lastName }</span>,
                Huissier de Justice qualifié Commissaire de Justice qualifié et Logion Legal Officer - ID Logion { props.sofParams.polkadotAddress } - au sein de
                la société { props.sofParams.company }, titulaire d’un office d’Huissier de Justice à la résidence de { props.sofParams.shortPostalAddress } ;</p>

            <p className="proceeds">Procède aux constatations suivantes&nbsp;:</p>

            <h2 className="facts-title">Constatations</h2>

            <p>Les constatations ont été réalisées dans le respect strict du process qui a fait l’objet d’un Procès Verbal de Constat qui contient en outre l’Audit de Sécurité, le tout ayant été enregistré dans le dossier numérique (Legal Officer Case) portant l’ID suivant : { props.sofParams.containingLocId }</p>

            <p>Afin de procéder aux constatations, j’effectue les opérations suivantes:</p>
            <ul>
                <li>Je me rends sur l’adresse { props.sofParams.nodeAddress } et procède à mon identification.</li>
                <li>Je me rends sur le dossier numérique (Legal Officer Case) objet de la demande de procès verbal de constat dont l’identifiant est: { props.sofParams.locId }</li>
            </ul>

            <p>Les éléments suivants sont enregistrés dans le dossier numérique (Legal Officer Case) { props.sofParams.locId }&nbsp;:</p>

            <h3>1 - Données publiques</h3>

            {
                props.sofParams.publicItems.map(item =>
                    <div className="fact-container">
                        <div>Description publique: { item.description }</div>
                        <div>Contenu: { item.content }</div>
                        <div>Timestamp: { item.timestamp }</div>
                    </div>
                )
            }

            <h3 className="confidential-title">2 - Documents confidentiels</h3>

            <p>Concernant les documents confidentiels, seules les empreintes numériques - réalisées selon la technique du HASH - ont été publiées sur la blockchain logion. Les fichiers associés aux empreintes numériques - ou  HASH SHA256 - listées sont les suivantes:</p>

            {
                props.sofParams.privateItems.map(item =>
                    <div className="fact-container">
                        <div>Description publique: { item.publicDescription }</div>
                        <div>Description privée: { item.privateDescription }</div>
                        <div>Hash: { item.hash }</div>
                        <div>Timestamp: { item.timestamp }</div>
                        {
                            item.deliveries.length > 0 &&
                            <div>Copies réclamées:</div>
                        }
                        {
                            item.deliveries.map((delivery, deliveryIndex) => (
                                <>
                                <div className="large-value">Delivery #{ deliveryIndex + 1 } - hash de la copie: { delivery.hash }</div>
                                <div className="large-value">Delivery #{ deliveryIndex + 1 } - détenteur: { delivery.owner }</div>
                                </>
                            ))
                        }
                    </div>
                )
            }

            {
                props.sofParams.collectionItem &&
                <>
                <h3 className="item-title">3 - Données d’une Collection (Collection item)</h3>

                <p>Le dossier numérique mentionné - { props.sofParams.locId } - étant un dossier numérique de collection (Collection Legal Officer Case), les données suivantes ont été enregistrées par le requêteur lui même sur l’infrastructure logion dans le cadre du dossier numérique susmentionné:</p>

                <hr/>
                <div><strong>Description</strong></div>
                <div className="large-value">Collection item ID: { props.sofParams.collectionItem.id }</div>
                <div>Description: { props.sofParams.collectionItem.description }</div>
                <div>Timestamp: { props.sofParams.collectionItem.addedOn }</div>
                <div>Diffusion restreinte: { props.sofParams.collectionItem.restrictedDelivery ? "Oui" : "Non" }</div>
                {
                    props.sofParams.collectionItem.token &&
                    <>
                    <div>Type de token sous-jacent: { props.sofParams.collectionItem.token.type }</div>
                    <div>ID du token sous-jacent: { props.sofParams.collectionItem.token.id }</div>
                    </>
                }
                <SofFilesAndDeliveriesFR files={ props.sofParams.collectionItem.files } />
                <SofTermsAndConditionsFR item={ props.sofParams.collectionItem } />
                <hr/>
                </>
            }
            {
                props.sofParams.tokensRecords.length > 0 &&
                <>
                    <h3 className="item-title">4 - Enregistrements liés aux jetons</h3>
                    {
                        props.sofParams.tokensRecords.map((tokensRecord, i) => (
                            <>
                                { i > 0 && <hr /> }
                                <SofTokensRecordFR tokensRecords={ tokensRecord } />
                            </>
                        ))
                    }
                </>
            }
            <p className="conclusion-first">Mes constatations terminées, je dresse le présent Procés Verbal de constat
                et l’enregistre dans le dossier numérique (Legal Officer Case) dont l’identifiant
                est: { props.sofParams.containingLocId } et dont une copie est conservée au rang des minutes de l’étude.</p>

            <p>Adresse du certificat public en ligne du présent constat:<br/>
                <a href={ props.sofParams.certificateUrl }>{ props.sofParams.certificateUrl }</a>
            </p>

            <p>Le certificat public en ligne mentionné permet de vérifier qu’une copie numérique du présent procès-verbal de constat est bien celle qui a fait l’objet de la requête telle que réalisée par le signataire. Cette vérification se faisant par la comparaison de l’empreinte numérique (techniquement dénommée HASH) de la copie numérique à vérifier avec l’empreinte numérique du présent document tel que enregistré dans le dossier numérique (Legal Officer Case) correspondant. En cas de litige seul l’exemplaire conservé par le Logion Legal Officer fera foi.</p>

            <div className="footer">
                <div>
                    <h3>Prix</h3>
                    <pre>{ props.sofParams.amount }</pre>
                </div>
                <div className="signature-container">
                    <h3>Signature</h3>
                    <img className="sof-signature" src={ process.env.PUBLIC_URL + "/assets/sof_signature.svg" } alt="signature" />
                </div>
            </div>

            <div className="appendix">
                <h2>Prestation de serment de l’Officier en charge de ce constat</h2>
                <div className="oath-container">
                    <div className="oath">
                        <p>{ props.sofParams.oathText }</p>
                    </div>
                    <div className="oath-logo">
                        <img src={ props.sofParams.oathLogoUrl } alt="oath logo" />
                    </div>
                </div>
            </div>
        </>
    );
}
