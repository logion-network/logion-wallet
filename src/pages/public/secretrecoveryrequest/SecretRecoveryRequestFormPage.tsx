import { Col, Container, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useCommonContext } from "src/common/CommonContext";
import Frame from "src/common/Frame";
import IdentityForm, { FormValues as IdentityFormValues } from "src/components/identity/IdentityForm";

import "./SecretRecoveryRequestFormPage.css";
import SecretRecoveryRequestForm, { FormValues as SecretFormValues } from "./SecretRecoveryRequestForm";
import ButtonGroup from "src/common/ButtonGroup";
import Button from "src/common/Button";
import { useCallback, useState } from "react";
import Alert from "src/common/Alert";
import Icon from "src/common/Icon";
import CopyPasteButton from "src/common/CopyPasteButton";
import { useLogionChain } from "../../../logion-chain";
import { UUID } from "@logion/node-api";

export default function SecretRecoveryRequestFormPage() {
    const { colorTheme } = useCommonContext();
    const { control: secretControl, trigger: secretTrigger, formState: { errors: secretErrors }, setValue, getValues } = useForm<SecretFormValues>();
    const { control: identityControl, trigger: identityTrigger, formState: { errors: identityErrors }, getValues: getIdentityValues } = useForm<IdentityFormValues>();
    const [ error, setError ] = useState<string>();
    const [ submitting, setSubmitting ] = useState(false);
    const [ submitted, setSubmitted ] = useState(false);
    const { client } = useLogionChain();

    const submit = useCallback(async () => {
        setError(undefined);
        setSubmitting(true);
        setSubmitted(false);
        const results = await Promise.all([ secretTrigger(), identityTrigger() ]);
        const formError = !(results[0] && results[1]);
        const { locId, secretName, challenge } = getValues();
        const requesterIdentityLocId = UUID.fromAnyString(locId);
        if(formError || requesterIdentityLocId === undefined) {
            setError("Some information above is not valid");
        } else {
            try {
                const identity = getIdentityValues();
                await client!.secretRecovery.createSecretRecoveryRequest({
                    requesterIdentityLocId,
                    secretName,
                    challenge,
                    userIdentity: {
                        firstName: identity.firstName,
                        lastName: identity.lastName,
                        email: identity.email,
                        phoneNumber: identity.phoneNumber,
                    },
                    userPostalAddress: {
                        line1: identity.line1,
                        line2: identity.line2,
                        postalCode: identity.postalCode,
                        city: identity.city,
                        country: identity.country,
                    },
                })
                setSubmitted(true);
            } catch(e) {
                if(e instanceof Error) {
                    setError(e.message);
                } else {
                    setError("" + e);
                }
            }
        }
        setSubmitting(false);
    }, [ secretTrigger, identityTrigger, client, getValues, getIdentityValues ]);

    return (
        <div className="SecretRecoveryRequestFormPage">
            {
                !submitted &&
                <Container>
                    <Row>
                        <Col>
                            <Frame
                                title="Secret to recover"
                            >
                                <p>The information below can be found in an e-mail you received after
                                    creating the recoverable secret.</p>
                                <SecretRecoveryRequestForm
                                    control={ secretControl }
                                    errors={ secretErrors }
                                    colors={ colorTheme.frame }
                                    setValue={ setValue }
                                />
                            </Frame>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Frame
                                title="Personal information"
                            >
                                <p>The information below must match what you provided in the Identity LOC
                                    mentioned in the above frame.</p>
                                <IdentityForm
                                    control={ identityControl }
                                    errors={ identityErrors }
                                    colors={ colorTheme.frame }
                                />
                            </Frame>
                        </Col>
                    </Row>
                    <Row>
                        <ButtonGroup>
                            <Button onClick={ submit } disabled={ submitting }>Submit</Button>
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
                submitted &&
                <Container>
                    <Row>
                        <Col>
                            <Frame
                                title="Submission successful"
                                className="success-frame"
                            >
                                <p className="success-icon"><Icon icon={{ id: "ok" }} height="64"/></p>
                                <p>Your request to recover secret <strong>{ getValues().secretName }</strong>{" "}
                                    from LOC <strong>{ getValues().locId }</strong>{" "}
                                    has been submitted successfully.</p>
                                <p><strong>Please keep below challenge in a safe place, you will need it in order
                                    to retrieve the secret once your request has been approved</strong>:</p>
                                <p className="challenge">{ getValues().challenge } <CopyPasteButton value={ getValues().challenge } /></p>
                            </Frame>
                        </Col>
                    </Row>
                </Container>
            }
        </div>
    );
}
