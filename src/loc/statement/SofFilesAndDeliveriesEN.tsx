import { SofDeliverableFile } from "./SofParams.js";

export interface Props {
    files: SofDeliverableFile[]
}

export default function SofFilesAndDeliveriesEN(props: Props) {
    return (
        <ul>
            {
                props.files.map((file, index) => (
                    <li>
                        <div className="section-name"><strong>Underlying asset #{index + 1}</strong></div>
                        <div>Name: { file.name }</div>
                        <div>Content Type: { file.contentType }</div>
                        <div className="large-value">Hash: { file.hash }</div>
                        <div>Size: { file.size.toString() } bytes</div>
                        {
                            file.deliveries.length > 0 &&
                            <div>Claimed copies:</div>
                        }
                        {
                            file.deliveries.map((delivery, deliveryIndex) => (
                                <>
                                    <div className="large-value">
                                        Delivery #{ deliveryIndex + 1 } Copy Hash: { delivery.hash }
                                    </div>
                                    <div className="large-value">
                                        Delivery #{ deliveryIndex + 1 } Owner: { delivery.owner }
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
