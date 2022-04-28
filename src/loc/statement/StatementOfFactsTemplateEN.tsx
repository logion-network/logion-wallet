import { PathModel } from "./PathModel";

export interface Props {
    pathModel: PathModel;
}

export default function StatementOfFactsTemplateEN(props: Props) {
    return (
        <>
            <div className="header">
                <div className="contact">
                    <div className="postal-address">
                        <div>{ props.pathModel.postalAddressLine1 }</div>
                        <div>{ props.pathModel.postalAddressLine2 }</div>
                        <div>{ props.pathModel.postalAddressLine3 }</div>
                        <div>{ props.pathModel.postalAddressLine4 }</div>
                        <div>{ props.pathModel.email }</div>
                    </div>
                    <div className="polkadot-address">
                        <div>Clé publique blockchain du Legal Officer:</div>
                        <div>{ props.pathModel.polkadotAddress }</div>
                    </div>
                </div>
                <div className="logo">
                    <img src={ props.pathModel.logoUrl ? props.pathModel.logoUrl : process.env.PUBLIC_URL + "/logo_black.png" } alt="logo" />
                </div>
            </div>

            <h1 className="main-title">
                Procès verbal de constat - English Version
            </h1>

            <div className="time">
                { props.pathModel.timestampText }
            </div>

            <h2>Demandeur</h2>
            <p>{ props.pathModel.requesterText }</p>
            <p>Identifié par son ID Logion : { props.pathModel.requesterAddress }</p>

            <p className="intro">Je, Soussigné, Me { props.pathModel.firstName } <span className="lastName">{ props.pathModel.lastName }</span>,
                Huissier de Justice qualifié Commissaire de Justice qualifié et Logion Legal Officer - ID Logion { props.pathModel.polkadotAddress } - au sein de
                la société { props.pathModel.company }, titulaire d’un office d’Huissier de Justice à la résidence de { props.pathModel.shortPostalAddress } ;</p>

            <p className="proceeds">Procède aux constatations suivantes&nbsp;:</p>

            <h2 className="facts-title">Constations</h2>

            <p>Les constatations ont été réalisées dans le respect strict du process qui a fait l’objet d’un Procès Verbal de Constat qui contient en outre l’Audit de Sécurité, le tout ayant été enregistré dans le dossier numérique (Legal Officer Case) portant l’ID suivant : { props.pathModel.containingLocId }</p>

            <p>Afin de procéder aux constations, j’effectue les opérations suivantes:</p>
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
                        </div>
                    )
                }
            </div>

            <p className="conclusion-first">Mes constatations terminées, je dresse le présent Procés Verbal de constat et l’enregistre dans le dossier numérique (Legal Officer Case) dont l’identifiant est : { props.pathModel.containingLocId }
            et dont une copie est conservée au rang des minutes de l’étude.</p>

            <p>Adresse du certificat public en ligne du présent constat:<br/>
                <a href={ props.pathModel.certificateUrl }>{ props.pathModel.certificateUrl }</a>
            </p>

            <p>Le certificat public en ligne mentionné permet de vérifier qu’une copie numérique du présent procès verbal de constat est bien celle qui a fait l’objet de la requête telle que réalisée par le signataire. Cette vérification se faisant par la comparaison de l’empreinte numérique de la copie numérique à vérifier avec l’empreinte numérique du présent document.</p>

            <div className="footer">
                <div>
                    <pre>{ props.pathModel.amount }</pre>
                </div>
                <div className="signature-container">
                    <img className="sof-signature" src={ process.env.PUBLIC_URL + "/assets/sof_signature.svg" } alt="signature" />
                    SIGNATURE ÉLECTRONIQUE avec la carte de l’Huissier de Justice
                </div>
            </div>
        </>
    );
}
