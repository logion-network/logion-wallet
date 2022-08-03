import { useEffect } from "react";
import { loadPagedJs } from "./PagedJS";
import { SofParams } from "./SofParams";

export interface Props {
    pathModel: SofParams;
}

export default function StatementOfFactsTemplateFR(props: Props) {

    useEffect(() => {
        loadPagedJs();
    }, []);

    return (
        <>
            <style>{`
                .pagedjs_pagebox > .pagedjs_area > .pagedjs_page_content {
                    background-image: url("${ props.pathModel.sealUrl }");
                    background-size: 100%;
                    background-position: center;
                    background-repeat: no-repeat;
                }
            `}</style>
            <div className="header">
                <div className="contact">
                    <div className="postal-address">
                        <div>{ props.pathModel.postalAddressLine1 }</div>
                        <div>{ props.pathModel.postalAddressLine2 }</div>
                        <div>{ props.pathModel.postalAddressLine3 }</div>
                        <div>{ props.pathModel.postalAddressLine4 }</div>
                        <div>{ props.pathModel.email }</div>
                    </div>
                </div>
                <div className="logo">
                    <img src={ props.pathModel.logoUrl } alt="logo" />
                </div>
            </div>

            <div className="polkadot-address">
                <div>Clé publique blockchain du Legal Officer:</div>
                <div>{ props.pathModel.polkadotAddress }</div>
            </div>

            <h1 className="main-title">
                Procès verbal de constat
            </h1>

            <div className="time">
                { props.pathModel.timestampText }
            </div>

            <h2 className="prerequisite-title">Prérequis</h2>
            { props.pathModel.prerequisites.map((prerequisite, index) => <div key={ index } className="prerequisite">
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
            <p>{ props.pathModel.requesterText }</p>
            <p>Identifié par son ID : { props.pathModel.requester }</p>

            <p className="intro">Je, Soussigné, Me { props.pathModel.firstName } <span className="lastName">{ props.pathModel.lastName }</span>,
                Huissier de Justice qualifié Commissaire de Justice qualifié et Logion Legal Officer - ID Logion { props.pathModel.polkadotAddress } - au sein de
                la société { props.pathModel.company }, titulaire d’un office d’Huissier de Justice à la résidence de { props.pathModel.shortPostalAddress } ;</p>

            <p className="proceeds">Procède aux constatations suivantes&nbsp;:</p>

            <h2 className="facts-title">Constatations</h2>

            <p>Les constatations ont été réalisées dans le respect strict du process qui a fait l’objet d’un Procès Verbal de Constat qui contient en outre l’Audit de Sécurité, le tout ayant été enregistré dans le dossier numérique (Legal Officer Case) portant l’ID suivant : { props.pathModel.containingLocId }</p>

            <p>Afin de procéder aux constatations, j’effectue les opérations suivantes:</p>
            <ul>
                <li>Je me rends sur l’adresse { props.pathModel.nodeAddress } et procède à mon identification.</li>
                <li>Je me rends sur le dossier numérique (Legal Officer Case) objet de la demande de procès verbal de constat dont l’identifiant est: { props.pathModel.locId }</li>
            </ul>

            <p>Les éléments suivants sont enregistrés dans le dossier numérique (Legal Officer Case) { props.pathModel.locId }&nbsp;:</p>

            <h3>1 - Données publiques</h3>

            <div className="facts">
                {
                    props.pathModel.publicItems.map(item =>
                        <div className="fact-container">
                            <div>Description publique: { item.description }</div>
                            <div>Contenu: { item.content }</div>
                            <div>Timestamp: { item.timestamp }</div>
                        </div>
                    )
                }
            </div>

            <h3 className="confidential-title">2 - Documents confidentiels</h3>

            <p>Concernant les documents confidentiels, seules les empreintes numériques - réalisées selon la technique du HASH - ont été publiées sur la blockchain logion. Les fichiers associés aux empreintes numériques - ou  HASH SHA256 - listées sont les suivantes:</p>

            <div className="facts">
                {
                    props.pathModel.privateItems.map(item =>
                        <div className="fact-container">
                            <div>Description publique: { item.publicDescription }</div>
                            <div>Description privée: { item.privateDescription }</div>
                            <div>Hash: { item.hash }</div>
                            <div>Timestamp: { item.timestamp }</div>
                        </div>
                    )
                }
            </div>

            {
                props.pathModel.collectionItem &&
                <>
                <h3 className="item-title">3 - Données d’une Collection (Collection item)</h3>

                <p>Le dossier numérique mentionné - { props.pathModel.locId } - étant un dossier numérique de collection (Collection Legal Officer Case), les données suivantes ont été enregistrées par le requêteur lui même sur l’infrastructure logion dans le cadre du dossier numérique susmentionné:</p>

                <div className="facts">
                    <div className="fact-container">
                        <div>Collection item ID: { props.pathModel.collectionItem.id }</div>
                        <div>Description: { props.pathModel.collectionItem.description }</div>
                        <div>Timestamp: { props.pathModel.collectionItem.addedOn }</div>
                        <div>Diffusion restreinte: { props.pathModel.collectionItem.restrictedDelivery }</div>
                        {
                            props.pathModel.collectionItem.token &&
                            <>
                            <div>Type de token sous-jacent: { props.pathModel.collectionItem.token.type }</div>
                            <div>ID du token sous-jacent: { props.pathModel.collectionItem.token.id }</div>
                            </>
                        }
                        {
                            props.pathModel.collectionItem.files.map((file, index) => (
                                <>
                                <div>Fichier #{index + 1} - nom: { file.name }</div>
                                <div>Fichier #{index + 1} - type de contenu: { file.contentType }</div>
                                <div>Fichier #{index + 1} - hash: { file.hash }</div>
                                <div>Fichier #{index + 1} - taille: { file.size.toString() }</div>
                                </>
                            ))
                        }
                    </div>
                </div>
                </>
            }

            <p className="conclusion-first">Mes constatations terminées, je dresse le présent Procés Verbal de constat
                et l’enregistre dans le dossier numérique (Legal Officer Case) dont l’identifiant
                est: { props.pathModel.containingLocId } et dont une copie est conservée au rang des minutes de l’étude.</p>

            <p>Adresse du certificat public en ligne du présent constat:<br/>
                <a href={ props.pathModel.certificateUrl }>{ props.pathModel.certificateUrl }</a>
            </p>

            <p>Le certificat public en ligne mentionné permet de vérifier qu’une copie numérique du présent procès-verbal de constat est bien celle qui a fait l’objet de la requête telle que réalisée par le signataire. Cette vérification se faisant par la comparaison de l’empreinte numérique (techniquement dénommée HASH) de la copie numérique à vérifier avec l’empreinte numérique du présent document tel que enregistré dans le dossier numérique (Legal Officer Case) correspondant. En cas de litige seul l’exemplaire conservé par le Logion Legal Officer fera foi.</p>

            <div className="footer">
                <div>
                    <h3>Prix</h3>
                    <pre>{ props.pathModel.amount }</pre>
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
                        <p>{ props.pathModel.oathText }</p>
                    </div>
                    <div className="oath-logo">
                        <img src={ props.pathModel.oathLogoUrl } alt="oath logo" />
                    </div>
                </div>
            </div>
        </>
    );
}
