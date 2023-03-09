import { useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Button from "src/common/Button";
import Dialog from "src/common/Dialog";
import Icon from "src/common/Icon";
import QrCode from "src/components/qrcode/QrCode";
import "./ViewQrCodeButton.css";

export interface Props {
    certificateUrl: string;
}

export default function ViewQrCodeButton(props: Props) {
    const [ dialogVisible, setDialogVisible ] = useState(false);

    return (
        <>
            <OverlayTrigger
                placement="bottom"
                delay={ 500 }
                overlay={
                    <Tooltip id={`view-qr-code-${props.certificateUrl}`}>
                        QR code of the certificate
                    </Tooltip>
                }
            >
                <span className="Button-container">
                    <Button
                        className="ViewQrCodeButton"
                        onClick={ () => setDialogVisible(true) }
                    >
                        <Icon icon={{ id: "qr" }}/>
                    </Button>
                    <Dialog
                        show={ dialogVisible }
                        actions={[
                            {
                                id: "close",
                                buttonText: "Close",
                                buttonVariant: "primary",
                                callback: () => setDialogVisible(false),
                            }
                        ]}
                        size="lg"
                    >
                        <h3>Certificate QR code</h3>
                        <p>This QR code below leads to the web address of the current public certificate. This QR code is a picture: you can right-click on it and copy - to paste it into a document or an email - or save it for future usage.</p>
                        <QrCode
                            data={ props.certificateUrl }
                            width="200px"
                        />
                    </Dialog>
                </span>
            </OverlayTrigger>
        </>
    );
}
