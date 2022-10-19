import Button from "../../common/Button";
import { useState, useCallback, useMemo } from "react";
import IdentityForm, { FormValues } from "../../components/identity/IdentityForm";
import { useForm } from "react-hook-form";
import { useCommonContext } from "../../common/CommonContext";
import SelectLegalOfficer from "./SelectLegalOfficer";
import { LegalOfficer, LocsState, UserIdentity, PostalAddress } from "@logion/client";
import { useUserContext } from "../UserContext";
import Form from "react-bootstrap/Form";
import Frame from "../../common/Frame";
import { useLogionChain } from "../../logion-chain";
import { FullWidthPane } from "../../common/Dashboard";
import { useNavigate } from "react-router";
import { Row, Col } from "react-bootstrap";
import './IdentityLocRequest.css';

export interface Props {
    backPath: string,
}

export default function IdentityLocRequest(props: Props) {

    const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>();
    const { colorTheme, availableLegalOfficers } = useCommonContext();
    const [ legalOfficer, setLegalOfficer ] = useState<LegalOfficer | null>(null);
    const { locsState, mutateLocsState } = useUserContext();
    const [ agree, setAgree ] = useState<boolean>(false);
    const { accounts } = useLogionChain();
    const navigate = useNavigate();
    const legalOfficersWithoutValidIdentityLoc = useMemo(() => {
        const legalOfficersWithValidIdentityLoc = locsState?.legalOfficersWithValidIdentityLoc.map(lo => lo.address);
        return availableLegalOfficers?.filter(lo => legalOfficersWithValidIdentityLoc?.includes(lo.address) === false)
    }, [ locsState?.legalOfficersWithValidIdentityLoc, availableLegalOfficers ])

    const clear = useCallback(() => {
        reset();
        setLegalOfficer(null);
    }, [ reset ])

    const submit = useCallback(async (formValues: FormValues) => {
        if (legalOfficer === null || accounts === null) {
            return
        }
        const userIdentity: UserIdentity = {
            firstName: formValues.firstName,
            lastName: formValues.lastName,
            email: formValues.email,
            phoneNumber: formValues.phoneNumber,
            company: formValues.company as unknown as boolean,
        };
        const userPostalAddress: PostalAddress = {
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
        navigate(props.backPath);
    }, [ mutateLocsState, legalOfficer, accounts, clear, navigate, props.backPath ])

    return (
        <FullWidthPane
            className="IdentityLocRequest"
            mainTitle="Request an Identity Case"
            titleIcon={ { icon: { id: "identity" } } }
            onBack={ () => navigate(props.backPath) }
        >
            <Row>
                <Col md={ 6 }>
                    <Frame>
                        <SelectLegalOfficer
                            legalOfficer={ legalOfficer }
                            legalOfficerNumber={ 1 }
                            legalOfficers={ legalOfficersWithoutValidIdentityLoc || [] }
                            mode="select"
                            otherLegalOfficer={ null }
                            setLegalOfficer={ setLegalOfficer }
                            label="Select your Legal Officer"
                            fillEmptyOfficerDetails={ true }
                            feedback="Required"
                        />
                    </Frame>
                </Col>
                <Col md={ 6 }>
                    <Frame disabled={ legalOfficer === null }>

                        <h3>Fill in your personal information</h3>

                        <Form onSubmit={ handleSubmit(submit) }>

                            <IdentityForm
                                control={ control }
                                errors={ errors }
                                colors={ colorTheme.frame }
                            />

                            <div className="agree-submit">
                                <Form.Check
                                    data-testid="agree"
                                    type="checkbox"
                                    checked={ agree }
                                    onChange={ () => setAgree(!agree) }
                                    label="I agree to send my personal information to the chosen Legal Officer"
                                />
                                <Button
                                    action={ {
                                        id: "submit",
                                        buttonVariant: "primary",
                                        buttonText: "Submit",
                                        buttonTestId: "btnSubmit",
                                        type: 'submit',
                                        disabled: !agree,
                                    } }
                                />
                            </div>
                        </Form>
                    </Frame>
                </Col>
            </Row>
        </FullWidthPane>
    )
}
