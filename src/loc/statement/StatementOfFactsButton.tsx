import { useEffect, useState, useCallback } from "react";
import { Dropdown } from "react-bootstrap";
import { UUID, LegalOfficerCase, Hash } from "@logion/node-api";
import { CollectionItem, LegalOfficer, ClosedCollectionLoc, TokensRecord } from "@logion/client";

import { locDetailsPath, STATEMENT_OF_FACTS_PATH } from "../../legal-officer/LegalOfficerPaths";
import { fullCertificateUrl, getBaseUrl } from "../../PublicPaths";
import { useLocContext } from "../LocContext";
import { DEFAULT_SOF_PARAMS, SofParams, FormValues, Language, Prerequisite, SofFileDelivery } from "./SofParams";

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
import {
    getAllCollectionDeliveries,
    getAllDeliveries,
    ItemDeliveriesResponse,
    loFileUrl,
    getTokensRecordDeliveries
} from "../FileModel";
import { creativeCommonsBadges } from "../../components/license/CreativeCommonsIcon";

type Status = 'IDLE' | 'PRE-REQUISITE' | 'INPUT' | 'READY'

const PLACEHOLDERS = {
    certificateUrl: "",
    prerequisites: [],
    containingLocId: "",
    amount: "",
    requesterText: "",
    timestampText: "",
};

export default function StatementOfFactsButton(props: { item?: CollectionItem }) {
    const { api, accounts, getOfficer, axiosFactory } = useLogionChain();
    const { loc: locData, locState } = useLocContext();
    const { settings } = useLegalOfficerContext();
    const [ sofParams, setSofParams ] = useState<SofParams>(DEFAULT_SOF_PARAMS);
    const [ status, setStatus ] = useState<Status>('IDLE')
    const [ language, setLanguage ] = useState<Language | null>(null)
    const { control, handleSubmit, formState: { errors }, reset, setError } = useForm<FormValues>();
    type ContainingLoc = (LegalOfficerCase & { id: UUID })
    const [ containingLoc, setContainingLoc ] = useState<ContainingLoc | null | undefined>(null)
    const [ legalOfficer, setLegalOfficer ] = useState<LegalOfficer>();
    const [ submitError, setSubmitError ] = useState<string | undefined>(undefined);
    const [ deliveries, setDeliveries ] = useState<ItemDeliveriesResponse | null | undefined>();
    const [ collectionDeliveries, setCollectionDeliveries ] = useState<ItemDeliveriesResponse | null | undefined>();
    const [ tokensRecords, setTokensRecords ] = useState<TokensRecord[] | null | undefined>();
    const [ tokensRecordFileDeliveries, setTokensRecordFileDeliveries ] = useState<Record<string, ItemDeliveriesResponse>>();

    const submit = useCallback(async (formValues: FormValues) => {
        if (api && locData) {
            const containingLocId = UUID.fromAnyString(formValues.containingLocId);
            if (!containingLocId) {
                setError("containingLocId", { type: "value", message: "Invalid LOC ID" })
                return
            }
            if (containingLocId.toString() === locData.id.toString()) {
                setError("containingLocId", { type: "value", message: "Choose a different LOC to upload Statement of Facts" })
                return
            }
            const loc = await api.queries.getLegalOfficerCase(containingLocId);
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
                })
                try {
                    clearSofParams();
                    storeSofParams(sp);
                    setStatus('READY');
                } catch(error) {
                    let message = "" + error;
                    if (message.startsWith("QuotaExceededError")) {
                        message = `The overall screen capture file size quota has been exceeded.\nPlease try to reduce each file size to not exceed 10Mo.`
                    } else {
                        message = `Failed to store SOF info to Local Storage\n ${ message }`;
                    }
                    setSubmitError(message)
                }
            }
        }
    }, [ api, sofParams, setContainingLoc, setError, locData ])

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
            && accounts?.current?.accountId !== undefined
            && (!legalOfficer || accounts.current.accountId.address !== legalOfficer.address)) {
            const polkadotAddress = accounts.current.accountId.address;
            const legalOfficer = getOfficer(polkadotAddress);
            setLegalOfficer(legalOfficer);
        }
    }, [ getOfficer, accounts, legalOfficer ]);

    useEffect(() => {
        if (props.item && locData && deliveries === undefined) {
            setDeliveries(null);
            (async function() {
                const deliveries = await getAllDeliveries(axiosFactory!(locData.ownerAddress), {
                    locId: locData.id.toString(),
                    collectionItemId: props.item!.id
                });
                setDeliveries(deliveries);
            })();
        }
    }, [ axiosFactory, props.item, locData, deliveries ]);

    useEffect(() => {
        if(props.item && locData && collectionDeliveries === undefined) {
            setCollectionDeliveries(null);
            (async function() {
                const deliveries = await getAllCollectionDeliveries(axiosFactory!(locData.ownerAddress), {
                    locId: locData.id.toString(),
                });
                setCollectionDeliveries(deliveries);
            })();
        }
    }, [ axiosFactory, props.item, locData, collectionDeliveries ]);

    useEffect(() => {
        if (tokensRecords === undefined && locData && locState instanceof ClosedCollectionLoc) {
            setTokensRecords(null);
            (async function () {
                const records = await locState.getTokensRecords();
                setTokensRecords(records);
                const deliveries: Record<string, ItemDeliveriesResponse> = {};
                for (const record of records) {
                    deliveries[record.id.toHex()] = await getTokensRecordDeliveries(axiosFactory!(locData.ownerAddress), {
                        locId: locData.id.toString(),
                        recordId: record.id,
                    })
                }
                setTokensRecordFileDeliveries(deliveries);
            })();
        }
    }, [ tokensRecords, locState, axiosFactory, tokensRecordFileDeliveries, locData ]);

    useEffect(() => {
        if (language
            && locData
            && legalOfficer
            && accounts?.current?.token
            && (deliveries !== null && deliveries !== undefined)
            && (collectionDeliveries !== null && collectionDeliveries !== undefined)
            && sofParams.locId !== locData.id.toDecimalString()
            && (tokensRecords !== undefined && tokensRecords !== null)
            && tokensRecordFileDeliveries) {
            const requester = locData.requesterAddress ? locData.requesterAddress.address : locData.requesterLocId?.toDecimalString() || "";
            setSofParams({
                ...PLACEHOLDERS,
                locId: locData.id.toDecimalString(),
                requester,
                publicItems: locData.metadata.map(item => ({
                    description: item.name.validValue(),
                    content: item.value.validValue(),
                    timestamp: item.addedOn || "",
                })),
                privateItems: locData.files.map(item => ({
                    publicDescription: item.nature.validValue(),
                    privateDescription: item.name,
                    hash: item.hash.toHex(),
                    timestamp: item.addedOn || "",
                    deliveries: toSofDeliveries(item, collectionDeliveries),
                })),
                collectionItem: (props.item ? {
                    id: props.item.id.toHex(),
                    addedOn: props.item.addedOn,
                    description: props.item.description.validValue(),
                    restrictedDelivery: props.item.restrictedDelivery,
                    token: props.item.token ? {
                        type: props.item.token.type.validValue(),
                        id: props.item.token.id.validValue(),
                    } : undefined,
                    files: props.item.files.map(file => ({
                        hash: file.hash.toHex(),
                        name: file.name.validValue(),
                        contentType: file.contentType.validValue(),
                        size: file.size.toString(),
                        deliveries: toSofDeliveries(file, deliveries),
                    })),
                    logionClassification: props.item.logionClassification ? {
                        locId: props.item.logionClassification.tcLocId.toString(),
                        details: props.item.logionClassification.details,
                    } : undefined,
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
                polkadotAddress: legalOfficer.address,
                postalAddressLine1: legalOfficer.postalAddress.company || "",
                postalAddressLine2: legalOfficer.postalAddress.line1 || "",
                postalAddressLine3: legalOfficer.postalAddress.line2 || "",
                postalAddressLine4: `${legalOfficer.postalAddress.postalCode} ${legalOfficer.postalAddress.city}`,
                email: legalOfficer.userIdentity.email || "",
                firstName: legalOfficer.userIdentity.firstName || "",
                lastName: legalOfficer.userIdentity.lastName || "",
                company: legalOfficer.postalAddress.company || "",
                shortPostalAddress: `${legalOfficer.postalAddress.postalCode} ${legalOfficer.postalAddress.city}, ${legalOfficer.postalAddress.line1}, ${legalOfficer.postalAddress.line2}`,
                nodeAddress: legalOfficer.node || "",
                language: language || 'en',
                logoUrl: loFileUrl(legalOfficer, 'header-logo', accounts.current.token),
                oathLogoUrl: loFileUrl(legalOfficer, 'oath-logo', accounts.current.token),
                sealUrl: loFileUrl(legalOfficer, 'seal', accounts.current.token),
                oathText: settings!['oath'] || "-",
                tokensRecords: tokensRecords.map(record => ({
                    id: record.id.toHex(),
                    description: record.description.validValue(),
                    issuer: record.issuer,
                    addedOn: record.addedOn,
                    files: record.files.map(file => ({
                        hash: file.hash.toHex(),
                        name: file.name.validValue(),
                        contentType: file.contentType.validValue(),
                        size: file.size.toString(),
                        deliveries: toSofDeliveries(file, tokensRecordFileDeliveries[record.id.toHex()]),
                    })),
                }))
            });
        }
    }, [ sofParams, setSofParams, locData, language, props.item, deliveries, accounts, legalOfficer, settings, collectionDeliveries, tokensRecords, tokensRecordFileDeliveries ]);

    const cancelCallback = useCallback(() => {
        clearSofParams();
        setSofParams(DEFAULT_SOF_PARAMS);
        setStatus('IDLE');
        setLanguage(null);
    }, [ setStatus, setLanguage ])

    const previousCallback = useCallback(() => {
        setStatus('PRE-REQUISITE');
    }, [ setStatus ])

    const prerequisitesDoneCallback = useCallback((prerequisites: Prerequisite[]) => {
        setSofParams({
            ...sofParams,
            prerequisites,
        });
        setStatus('INPUT');
    }, [ sofParams ])

    if(settings === undefined || !locData) {
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
                    locId={ locData!.id }
                    nodeOwner={ locData.ownerAddress }
                />
            </Dialog>
        </>
    );
}

function toSofDeliveries(file: { hash: Hash }, deliveries: ItemDeliveriesResponse): SofFileDelivery[] {
    const hash = file.hash;
    const fileDeliveries = deliveries[hash.toHex()];
    if(!fileDeliveries) {
        return [];
    } else {
        return fileDeliveries.map(delivery => ({ hash: delivery.copyHash, owner: delivery.owner }));
    }
}
