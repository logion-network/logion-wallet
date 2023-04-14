import Button from "../../common/Button";
import { useState, useCallback, useMemo } from "react";
import IdentityForm, { FormValues } from "../../components/identity/IdentityForm";
import { useForm } from "react-hook-form";
import { useCommonContext } from "../../common/CommonContext";
import SelectLegalOfficer from "./SelectLegalOfficer";
import { LegalOfficer, LegalOfficerClass, LocsState, UserIdentity, PostalAddress, DraftRequest } from "@logion/client";
import { useUserContext } from "../UserContext";
import Form from "react-bootstrap/Form";
import Frame from "../../common/Frame";
import { useLogionChain } from "../../logion-chain";
import { FullWidthPane } from "../../common/Dashboard";
import { useNavigate } from "react-router";
import { Row, Col } from "react-bootstrap";
import FormGroup from "src/common/FormGroup";
import './IdentityLocRequest.css';
import { locDetailsPath } from "../UserRouter";
import IconTextRow from "src/common/IconTextRow";
import Icon from "src/common/Icon";
import { useSearchParams } from "react-router-dom";
import { backendTemplate, CUSTOM_LOC_TEMPLATE_ID } from "src/loc/Template";

export interface Props {
    backPath: string,
}

function getInvalidCompanyName(company: boolean, companyIdentityLoc: boolean, companyName: string | undefined): string | undefined {
    if((company || companyIdentityLoc) && !companyName) {
        return "Required if you are representing a legal entity";
    } else {
        return undefined;
    }
}

export default function IdentityLocRequest(props: Props) {
    const [ search ] = useSearchParams();
    const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>();
    const { colorTheme, availableLegalOfficers } = useCommonContext();
    const [ legalOfficer, setLegalOfficer ] = useState<LegalOfficer | null>(null);
    const { locsState, mutateLocsState } = useUserContext();
    const [ agree, setAgree ] = useState<boolean>(false);
    const [ company, setCompany ] = useState<boolean>(false);
    const [ companyName, setCompanyName ] = useState("");
    const [ invalidCompanyName, setInvalidCompanyName ] = useState<string>();
    const { accounts } = useLogionChain();
    const navigate = useNavigate();
    const legalOfficersWithoutValidIdentityLoc = useMemo(() => {
        const legalOfficersWithValidIdentityLoc = locsState?.legalOfficersWithValidIdentityLoc.map(lo => lo.address);
        return availableLegalOfficers?.filter(lo => legalOfficersWithValidIdentityLoc?.includes(lo.address) === false)
    }, [ locsState?.legalOfficersWithValidIdentityLoc, availableLegalOfficers ]);
    const templateId = useMemo(() => backendTemplate(search.get("templateId") || undefined), [ search ]);
    const companyIdentityLoc = useMemo(() => templateId === "company_identity", [ templateId ]);

    const clear = useCallback(() => {
        reset();
        setLegalOfficer(null);
    }, [ reset ])

    const submit = useCallback(async (formValues: FormValues) => {
        if (legalOfficer === null || !(legalOfficer instanceof LegalOfficerClass) || accounts === null) {
            return
        }

        const invalidCompanyName = getInvalidCompanyName(company, companyIdentityLoc, companyName);
        setInvalidCompanyName(invalidCompanyName);
        if(invalidCompanyName) {
            return;
        }

        const userIdentity: UserIdentity = {
            firstName: formValues.firstName,
            lastName: formValues.lastName,
            email: formValues.email,
            phoneNumber: formValues.phoneNumber,
        };
        const userPostalAddress: PostalAddress = {
            line1: formValues.line1,
            line2: formValues.line2,
            postalCode: formValues.postalCode,
            city: formValues.city,
            country: formValues.country,
        };
        let draftRequest: DraftRequest;
        await mutateLocsState(async (locsState: LocsState) => {
            draftRequest = await locsState.requestIdentityLoc({
                legalOfficer,
                description: `KYC ${ userIdentity.firstName } ${ userIdentity.lastName } - ${ accounts.current?.accountId.toKey() }`,
                userIdentity,
                userPostalAddress,
                company: (company || companyIdentityLoc) ? companyName : undefined,
                draft: true,
                template: templateId,
            }) as DraftRequest;
            return draftRequest.locsState();
        })
        clear();
        navigate(locDetailsPath(draftRequest!.data().id, "Identity"));
    }, [ mutateLocsState, legalOfficer, accounts, clear, navigate, company, companyName, companyIdentityLoc, templateId ])

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

                    {
                        (templateId === undefined || templateId === CUSTOM_LOC_TEMPLATE_ID || templateId === "company_identity") &&
                        <Frame className="company-frame">
                            <IconTextRow
                                icon={ <Icon icon={{id: "company"}} height="45px" /> }
                                text={ <p>Check the box below if you are acting on behalf and representing a company, association, fondation (the Legal Officer will request a proof of authority):</p> }
                            />
                            <div className="company-check-container">
                                <Form.Check
                                    data-testid="company"
                                    type="checkbox"
                                    checked={ company || companyIdentityLoc }
                                    onChange={ () => setCompany(!company) }
                                    label="Yes, I am representing a legal entity"
                                    disabled={ templateId !== undefined }
                                />
                            </div>
                            {
                                (company || companyIdentityLoc) &&
                                <div className="company-name-container">
                                    <FormGroup
                                        id="companyName"
                                        label="Legal entity name"
                                        control={
                                            <Form.Control
                                                isInvalid={ invalidCompanyName !== undefined }
                                                type="text"
                                                data-testid="companyName"
                                                value={ companyName }
                                                onChange={ e => { setInvalidCompanyName(undefined) ; setCompanyName(e.target.value) } }
                                            />
                                        }
                                        feedback={ invalidCompanyName }
                                        colors={ colorTheme.frame }
                                    />
                                </div>
                            }
                        </Frame>
                    }
                </Col>
                <Col md={ 6 }>
                    <Frame disabled={ legalOfficer === null }>

                        <h3>Fill in your personal information</h3>

                        <Form onSubmit={ handleSubmit(submit, () => setInvalidCompanyName(getInvalidCompanyName(company, companyIdentityLoc, companyName))) }>

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
