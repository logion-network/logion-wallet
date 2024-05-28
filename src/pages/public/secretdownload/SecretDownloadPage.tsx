import { Col, Container, Row } from "react-bootstrap";
import { useCommonContext } from "src/common/CommonContext";
import Frame from "src/common/Frame";

import "./SecretDownloadPage.css";
import ButtonGroup from "src/common/ButtonGroup";
import Button from "src/common/Button";
import { useCallback, useState } from "react";
import Alert from "src/common/Alert";
import Icon from "src/common/Icon";
import { useLogionChain } from "../../../logion-chain";
import { UUID } from "@logion/node-api";
import SecretDownloadForm from "./SecretDownloadForm";
import { useParams } from "react-router-dom";
import CopyPasteButton from "src/common/CopyPasteButton";

export default function SecretDownloadPage() {
    const { colorTheme } = useCommonContext();
    const { locId, challenge, requestId } = useParams();

    const [ error, setError ] = useState<string>();
    const [ submitting, setSubmitting ] = useState(false);
    const [ secretValue, setSecretValue ] = useState<string>();
    const { client } = useLogionChain();

    const download = useCallback(async () => {
        setError(undefined);
        setSubmitting(true);
        setSecretValue(undefined);

        const requesterIdentityLocId = UUID.fromAnyString(locId || "");
        if(!requesterIdentityLocId || !challenge || !requestId) {
            setError("Wrong URL data");
        } else {
            try {
                const secretValue = await client!.secretRecovery.downloadSecret({
                    challenge,
                    requesterIdentityLocId,
                    requestId,
                });
                setSecretValue(secretValue);
            } catch(e) {
                if(e instanceof Error) {
                    setError(e.message);
                } else {
                    setError("" + e);
                }
            }
        }
        setSubmitting(false);
    }, [ client, locId, challenge, requestId ]);

    return (
        <div className="SecretDownloadPage">
            {
                secretValue === undefined &&
                <Container>
                    <Row>
                        <Col>
                            <Frame
                                title="Secret to download"
                            >
                                <p>Below data will be used to download the secret's value.{" "}
                                    <strong>Click download only once your recovery request has been approved by your Logion Legal Officer.</strong></p>
                                <SecretDownloadForm
                                    challenge={ challenge }
                                    locId={ locId }
                                    requestId={ requestId }
                                    colors={ colorTheme.frame }
                                />
                            </Frame>
                        </Col>
                    </Row>
                    <Row>
                        <ButtonGroup>
                            <Button onClick={ download } disabled={ submitting }>Download</Button>
                        </ButtonGroup>
                        {
                            error !== undefined &&
                            <div className="alert-container">
                                <Alert variant="danger">{ error }</Alert>
                            </div>
                        }
                    </Row>
                </Container>
            }
            {
                secretValue !== undefined &&
                <Container>
                    <Row>
                        <Col>
                            <Frame
                                title="Download successful"
                                className="success-frame"
                            >
                                <p className="success-icon"><Icon icon={{ id: "ok" }} height="64"/></p>
                                <p>You successfully downloaded the secret value:</p>
                                <p className="secret-value">{ secretValue } <CopyPasteButton value={ secretValue } /></p>
                                <p><strong>Write it down or copy it now, you won't be able to download it again unless you create a new recovery request.</strong></p>
                            </Frame>
                        </Col>
                    </Row>
                </Container>
            }
        </div>
    );
}
