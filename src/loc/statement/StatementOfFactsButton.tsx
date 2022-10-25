import { useEffect, useState, useCallback } from "react";
import { Dropdown } from "react-bootstrap";
import { UUID } from "@logion/node-api/dist/UUID";
import { LegalOfficerCase } from "@logion/node-api/dist/Types";
import { getLegalOfficerCase } from "@logion/node-api/dist/LogionLoc";
import { CollectionItem, LegalOfficer } from "@logion/client";

import { locDetailsPath, STATEMENT_OF_FACTS_PATH } from "../../legal-officer/LegalOfficerPaths";
import { fullCertificateUrl, getBaseUrl } from "../../PublicPaths";
import { useLocContext } from "../LocContext";
import { DEFAULT_SOF_PARAMS, SofParams, FormValues, Language, Prerequisite } from "./SofParams";

import './StatementOfFactsButton.css';
import Dialog from "../../common/Dialog";
import StatementOfFactsForm from "./StatementOfFactsForm";
import { useForm } from "react-hook-form";
import StatementOfFactsSummary from "./StatementOfFactsSummary";
import { useLogionChain } from "../../logion-chain";
import { clearSofParams, storeSofParams } from "../../common/Storage";
import { PrerequisiteWizard } from "./PrerequisiteWizard";
import { PREREQUISITE_WIZARD_STEPS } from "./WizardSteps";
import { useLegalOfficerContext } from "../../legal-officer/LegalOfficerContext";
import { loFileUrl } from "../FileModel";
import { creativeCommonsBadges } from "../../components/license/CreativeCommonsIcon";

type Status = 'IDLE' | 'PRE-REQUISITE' | 'INPUT' | 'READY'

export default function StatementOfFactsButton(props: { item?: CollectionItem }) {
    const { api, accounts, getOfficer } = useLogionChain();
    const { locId, loc: locData } = useLocContext();
    const { settings } = useLegalOfficerContext();
    const [ sofParams, setSofParams ] = useState<SofParams>(DEFAULT_SOF_PARAMS);
    const [ item, setItem ] = useState<CollectionItem>();
    const [ status, setStatus ] = useState<Status>('IDLE')
    const [ language, setLanguage ] = useState<Language | null>(null)
    const { control, handleSubmit, formState: { errors }, reset, setError } = useForm<FormValues>();
    type ContainingLoc = (LegalOfficerCase & { id: UUID })
    const [ containingLoc, setContainingLoc ] = useState<ContainingLoc | null | undefined>(null)
    const [ legalOfficer, setLegalOfficer ] = useState<LegalOfficer>();
    const [ submitError, setSubmitError ] = useState<string | undefined>(undefined);

    const submit = useCallback(async (formValues: FormValues) => {
        if (api) {
            const containingLocId = UUID.fromAnyString(formValues.containingLocId);
            if (!containingLocId) {
                setError("containingLocId", { type: "value", message: "Invalid LOC ID" })
                return
            }
            if (containingLocId.toString() === locId.toString()) {
                setError("containingLocId", { type: "value", message: "Choose a different LOC to upload Statement of Facts" })
                return
            }
            const loc = await getLegalOfficerCase({ locId: containingLocId, api })
            if (!loc) {
                setError("containingLocId", { type: "value", message: "LOC not found on chain" })
            } else if (loc.closed) {
                setError('containingLocId', { type: "value", message: "LOC must be open" })
            } else if (loc.voidInfo) {
                setError('containingLocId', { type: "value", message: "LOC must not be void" })
            } else {
                setContainingLoc({
                    id: containingLocId,
                    ...loc
                })
                const sp:SofParams = ({
                    ...sofParams,
                    ...formValues,
                    certificateUrl: fullCertificateUrl(containingLocId),
                    language: language || 'en',
                    logoUrl: loFileUrl(legalOfficer!, 'header-logo', accounts!.current!.token!),
                    oathLogoUrl: loFileUrl(legalOfficer!, 'oath-logo', accounts!.current!.token!),
                    sealUrl: loFileUrl(legalOfficer!, 'seal', accounts!.current!.token!),
                    oathText: settings!['oath'] || "-"
                })
                try {
                    clearSofParams();
                    storeSofParams(sp);
                    setStatus('READY');
                } catch(error) {
                    let message = "" + error;
                    if (message.startsWith("QuotaExceededError")) {
                        message = `The overall screen capture file size quota has been exceeded.\nPlease try to reduce each file size to not exceed 10Mo.`
                    }
                    else {
                        message = `Failed to store SOF info to Local Storage\n ${ message }`;
                    }
                    setSubmitError(message)
                }
            }
        }
    }, [ api, sofParams, setContainingLoc, setError, locId, language, accounts, legalOfficer, settings ])

    const dropDownItem = (language: Language) => {
        return (
            <Dropdown.Item onClick={ () => {
                reset();
                setLanguage(language);
                setStatus('PRE-REQUISITE');
                setSubmitError(undefined);
            } }>{ language.toUpperCase() }</Dropdown.Item>
        )
    }

    useEffect(() => {
        if (getOfficer !== undefined
            && accounts?.current?.address !== undefined
            && accounts.current.address !== sofParams.polkadotAddress) {
            const polkadotAddress = accounts.current.address;
            const legalOfficer = getOfficer(polkadotAddress);
            setLegalOfficer(legalOfficer);
            setSofParams({
                ...sofParams,
                polkadotAddress,
                postalAddressLine1: legalOfficer?.postalAddress.company || "",
                postalAddressLine2: legalOfficer?.postalAddress.line1 || "",
                postalAddressLine3: legalOfficer?.postalAddress.line2 || "",
                postalAddressLine4: `${legalOfficer?.postalAddress.postalCode} ${legalOfficer?.postalAddress.city}`,
                email: legalOfficer?.userIdentity.email || "",
                firstName: legalOfficer?.userIdentity.firstName || "",
                lastName: legalOfficer?.userIdentity.lastName || "",
                company: legalOfficer?.postalAddress.company || "",
                shortPostalAddress: `${legalOfficer?.postalAddress.postalCode} ${legalOfficer?.postalAddress.city}, ${legalOfficer?.postalAddress.line1}, ${legalOfficer?.postalAddress.line2}`,
                nodeAddress: legalOfficer?.node || "",
                logoUrl: legalOfficer?.logoUrl || "",
            });
        }
    }, [ getOfficer, accounts, sofParams, setSofParams ]);

    useEffect(() => {
        if (locId.toDecimalString() !== sofParams.locId) {
            const requester = locData?.requesterAddress ? locData.requesterAddress : locData?.requesterLocId?.toDecimalString() || ""
            setSofParams({
                ...sofParams,
                locId: locId.toDecimalString(),
                requester,
                publicItems: locData!.metadata.map(item => ({
                    description: item.name,
                    content: item.value,
                    timestamp: item.addedOn || "",
                })),
                privateItems: locData!.files.map(item => ({
                    publicDescription: item.nature,
                    privateDescription: item.name,
                    hash: item.hash,
                    timestamp: item.addedOn || "",
                })),
            });
        }
    }, [ locData, locId, sofParams, setSofParams ]);

    useEffect(() => {
        if (language !== null && ((props.item && !item) || (!props.item && item) || (props.item && item && props.item.id !== item.id))) {
            setItem(props.item);
            setSofParams({
                    ...sofParams,
                    collectionItem: (props.item ? {
                        id: props.item.id,
                        addedOn: props.item.addedOn,
                        description: props.item.description,
                        restrictedDelivery: props.item.restrictedDelivery,
                        token: props.item.token,
                        files: props.item.files.map(file => ({
                            ...file,
                            size: file.size.toString(),
                        })),
                        logionClassification: props.item.logionClassification,
                        litcUrl: `${ getBaseUrl() }/license/LITC-v1.0.txt`,
                        litcLocUrl: props.item.logionClassification ? fullCertificateUrl(props.item.logionClassification.tcLocId) : "",
                        specificLicenses: props.item.specificLicenses,
                        creativeCommons: props.item.creativeCommons ?
                            {
                                code: props.item.creativeCommons?.parameters,
                                url: props.item.creativeCommons.deedUrl(language),
                                badgeUrl: creativeCommonsBadges[props.item.creativeCommons.parameters],
                            } : undefined,
                    } : undefined),
                }
            )
        }
    }, [ props, item, setItem, sofParams, setSofParams, locId, language ]);

    const cancelCallback = useCallback(() => {
        setStatus('IDLE')
        setLanguage(null)
    }, [ setStatus, setLanguage ])

    const previousCallback = useCallback(() => {
        setStatus('PRE-REQUISITE')
    }, [ setStatus ])

    const prerequisitesDoneCallback = useCallback((prerequisites: Prerequisite[]) => {
        setSofParams({
                ...sofParams,
                prerequisites,
            }
        )
        setStatus('INPUT');
    }, [ sofParams ])

    if(settings === undefined) {
        return null;
    }

    return (
        <>
            <Dropdown className="StatementOfFactsButtonDropdownItem">
                <Dropdown.Toggle className="Button" id="StatementOfFacts-dropdown-toggle">Statement of
                    facts</Dropdown.Toggle>
                <Dropdown.Menu>
                    { dropDownItem('en') }
                    { dropDownItem('fr') }
                </Dropdown.Menu>
            </Dropdown>

            <PrerequisiteWizard
                show={ status === 'PRE-REQUISITE' }
                language={ language || 'en' }
                steps={ PREREQUISITE_WIZARD_STEPS }
                onDone={ prerequisitesDoneCallback }
                onCancel={ cancelCallback }
            />

            <Dialog
                show={ status === 'INPUT' }
                size="lg"
                actions={ [
                    {
                        id: "cancel",
                        callback: cancelCallback,
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary',
                    },
                    {
                        id: "previous",
                        callback: previousCallback,
                        buttonText: 'Previous',
                        buttonVariant: 'primary',
                    },
                    {
                        id: "submit",
                        buttonText: 'Submit',
                        buttonVariant: 'primary',
                        type: 'submit',
                    }
                ] }
                onSubmit={ handleSubmit(submit) }
            >

                <StatementOfFactsForm
                    type={ locData!.locType }
                    control={ control }
                    errors={ errors }
                    language={ language || 'en' }
                    submitError={ submitError }
                />
            </Dialog>

            <Dialog
                show={ status === 'READY' }
                size={ "lg" }
                actions={ [
                    {
                        id: "cancel",
                        callback: cancelCallback,
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary',
                    }
                ] }
            >
                <StatementOfFactsSummary
                    previewPath={ STATEMENT_OF_FACTS_PATH }
                    relatedLocPath={ containingLoc ? locDetailsPath(containingLoc!.id, containingLoc!.locType) : "" }
                    locId={ locId }
                    nodeOwner={ locData!.ownerAddress }
                />
            </Dialog>
        </>
    );
}
