import { SofDeliverableFile } from "./SofParams.js";

export interface Props {
    files: SofDeliverableFile[]
}

export default function SofFilesAndDeliveriesFR(props: Props) {
    return (
        <ul>
            {
                props.files.map((file, index) => (
                    <li>
                        <div className="section-name"><strong>Contenu sous-jacent #{ index + 1 }</strong></div>
                        <div>Nom: { file.name }</div>
                        <div>Type de contenu: { file.contentType }</div>
                        <div className="large-value">Hash: { file.hash }</div>
                        <div>Taille: { file.size.toString() } octets</div>
                        {
                            file.deliveries.length > 0 &&
                            <div>Copies réclamées:</div>
                        }
                        {
                            file.deliveries.map((delivery, deliveryIndex) => (
                                <>
                                    <div className="large-value">
                                        Copie #{ deliveryIndex + 1 } - hash de la copie: { delivery.hash }
                                    </div>
                                    <div className="large-value">
                                        Copie #{ deliveryIndex + 1 } - détenteur: { delivery.owner }
                                    </div>
                                </>
                            ))
                        }
                    </li>
                ))
            }
        </ul>
    )
}
