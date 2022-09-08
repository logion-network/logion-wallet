import Button from "../../common/Button";
import { useState, useCallback } from "react";
import Dialog from "../../common/Dialog";
import IdentityForm, { FormValues } from "./IdentityForm";
import { useForm } from "react-hook-form";
import { useCommonContext } from "../../common/CommonContext";
import SelectLegalOfficer from "../../wallet-user/trust-protection/SelectLegalOfficer";
import { LegalOfficer, LocsState } from "@logion/client";
import { Row, Col } from "../../common/Grid";
import { useUserContext } from "../../wallet-user/UserContext";
import Form from "react-bootstrap/Form";
import Frame from "../../common/Frame";
import { useLogionChain } from "../../logion-chain";

export default function IdentityLocRequest() {

    const [ requestLoc, setRequestLoc ] = useState(false);
    const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>();
    const { colorTheme, availableLegalOfficers } = useCommonContext();
    const [ legalOfficer, setLegalOfficer ] = useState<LegalOfficer | null>(null);
    const { mutateLocsState } = useUserContext();
    const [ agree, setAgree ] = useState<boolean>(false);
    const { accounts } = useLogionChain();

    const clear = useCallback(() => {
        reset();
        setRequestLoc(false);
        setLegalOfficer(null);
    }, [ reset ])

    const submit = useCallback(async (formValues: FormValues) => {
        if (legalOfficer === null || accounts === null) {
            return
        }
        const userIdentity = {
            firstName: formValues.firstName,
            lastName: formValues.lastName,
            email: formValues.email,
            phoneNumber: formValues.phoneNumber
        };
        const userPostalAddress = {
            line1: formValues.line1,
            line2: formValues.line2,
            postalCode: formValues.postalCode,
            city: formValues.city,
            country: formValues.country,
        };
        await mutateLocsState(async (locsState: LocsState) => {
            return (await locsState.requestIdentityLoc({
                legalOfficer,
                description: `KYC ${ userIdentity.firstName } ${ userIdentity.lastName } - ${ accounts.current?.address }`,
                userIdentity,
                userPostalAddress,
            })).locsState();
        })
        clear();
    }, [ mutateLocsState, legalOfficer, accounts, clear ])

    return (
        <>
            <Button onClick={ () => setRequestLoc(true) }>Request an Identity Case</Button>
            <Dialog
                show={ requestLoc }
                size="xl"
                actions={ [
                    {
                        id: "cancel",
                        callback: clear,
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary',
                    },
                    {
                        id: "submit",
                        buttonText: 'Submit',
                        buttonVariant: 'primary',
                        type: 'submit',
                        disabled: !agree,
                    }
                ] }
                onSubmit={ handleSubmit(submit) }
            >
                <Row>
                    <Frame altColors={ true }>
                        <SelectLegalOfficer
                            legalOfficer={ legalOfficer }
                            legalOfficerNumber={ 1 }
                            legalOfficers={ availableLegalOfficers || [] }
                            mode="select"
                            otherLegalOfficer={ null }
                            setLegalOfficer={ setLegalOfficer }
                            label="Select your Legal Officer"
                            fillEmptyOfficerDetails={ true }
                            colors={ colorTheme.dialog }
                            feedback="Required"
                        />
                    </Frame>
                    <Frame altColors={ true } disabled={ legalOfficer === null }>
                        <Col>
                            <IdentityForm
                                control={ control }
                                errors={ errors }
                                colors={ colorTheme.dialog }
                            />
                            <Form.Check
                                data-testid="agree"
                                type="checkbox"
                                checked={ agree }
                                onChange={ () => setAgree(!agree) }
                                label="I agree to send my personal information to the chosen Legal Officer"
                            />
                        </Col>
                    </Frame>
                </Row>
            </Dialog>
        </>
    )
}
