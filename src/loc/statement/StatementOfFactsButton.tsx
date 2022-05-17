import { useEffect, useState, useCallback } from "react";
import { Dropdown } from "react-bootstrap";
import { UUID } from "@logion/node-api/dist/UUID";
import { LegalOfficerCase } from "@logion/node-api/dist/Types";
import { getLegalOfficerCase } from "@logion/node-api/dist/LogionLoc";

import { locDetailsPath, statementOfFactsPath } from "../../legal-officer/LegalOfficerPaths";
import { fullCertificateUrl } from "../../PublicPaths";
import { useLocContext } from "../LocContext";
import { DEFAULT_SOF_PARAMS, SofParams, FormValues, Language } from "./SofParams";

import './StatementOfFactsButton.css';
import Dialog from "../../common/Dialog";
import StatementOfFactsForm from "./StatementOfFactsForm";
import { useForm } from "react-hook-form";
import StatementOfFactsSummary from "./StatementOfFactsSummary";
import { useLogionChain } from "../../logion-chain";
import { storeSofParams } from "../../common/Storage";

type Status = 'IDLE' | 'INPUT' | 'READY'

export default function StatementOfFactsButton(props: { itemId?: string, itemDescription?: string }) {
    const { api, accounts, getOfficer } = useLogionChain();
    const { loc, locId, locRequest } = useLocContext();
    const [ sofParams, setSofParams ] = useState<SofParams>(DEFAULT_SOF_PARAMS);
    const [ itemId, setItemId ] = useState<string>();
    const [ itemDescription, setItemDescription ] = useState<string>();
    const [ status, setStatus ] = useState<Status>('IDLE')
    const [ language, setLanguage ] = useState<Language | null>(null)
    const { control, handleSubmit, formState: { errors }, reset, setError } = useForm<FormValues>();
    type ContainingLoc = (LegalOfficerCase & { id: UUID })
    const [ containingLoc, setContainingLoc ] = useState<ContainingLoc | null | undefined>(null)
    const [ imageSrc, setImageSrc ] = useState<string>("");
    const [ sofId, setSofId ] = useState<UUID | undefined>(undefined);

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
                const id = new UUID();
                const pm:SofParams = ({
                    ...sofParams,
                    ...formValues,
                    certificateUrl: fullCertificateUrl(containingLocId),
                    imageSrc,
                    language: language || 'en'
                })
                storeSofParams(id, pm);
                setSofId(id);
                setStatus('READY');
            }
        }
    }, [ api, sofParams, setContainingLoc, setError, locId, imageSrc, language ])

    const dropDownItem = (language: Language) => {
        return (
            <Dropdown.Item onClick={ () => {
                reset()
                setStatus('INPUT')
                setLanguage(language)
                setImageSrc("")
            } }>{ language.toUpperCase() }</Dropdown.Item>
        )
    }

    useEffect(() => {
        if (getOfficer !== undefined
            && accounts?.current?.address !== undefined
            && accounts.current.address !== sofParams.polkadotAddress) {
            const polkadotAddress = accounts.current.address;
            const legalOfficer = getOfficer(polkadotAddress);
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
            const requester = loc?.requesterAddress ? loc.requesterAddress : loc?.requesterLocId?.toDecimalString() || ""
            setSofParams({
                ...sofParams,
                locId: locId.toDecimalString(),
                requester,
                publicItems: locRequest!.metadata.map(item => ({
                    description: item.name,
                    content: item.value,
                })),
                privateItems: locRequest!.files.map(item => ({
                    publicDescription: item.nature,
                    privateDescription: item.name,
                    hash: item.hash,
                })),
            });
        }
    }, [ loc, locId, locRequest, sofParams, setSofParams, itemId ]);

    useEffect(() => {
        if((props.itemId !== itemId || props.itemDescription !== itemDescription)) {
            setItemId(props.itemId);
            setItemDescription(props.itemDescription);
            setSofParams({
                ...sofParams,
                itemId: props.itemId || "",
                itemDescription: props.itemDescription || "",
            });
        }
    }, [ props, itemId, itemDescription, setItemId, setItemDescription, sofParams, setSofParams, locId ]);

    const fileSelectedCallback = useCallback((file: File) => {
        const reader = new FileReader();
        reader.addEventListener('loadend', () => {
            const base64ImageUrl = reader.result;
            if (base64ImageUrl) {
                setImageSrc(base64ImageUrl as string)
            }
        })
        reader.readAsDataURL(file)
    }, [ setImageSrc ])

    const cancelCallback = useCallback(() => {
        setStatus('IDLE')
        setLanguage(null)
    }, [ setStatus, setLanguage ])

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
                        id: "submit",
                        buttonText: 'Submit',
                        buttonVariant: 'primary',
                        type: 'submit',
                    }
                ] }
                onSubmit={ handleSubmit(submit) }
            >
                <StatementOfFactsForm
                    type={ loc!.locType }
                    control={ control }
                    errors={ errors }
                    language={ language || 'en' }
                    onFileSelected={ fileSelectedCallback }
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
                    previewPath={ statementOfFactsPath(sofId) }
                    relatedLocPath={ containingLoc ? locDetailsPath(containingLoc!.id, containingLoc!.locType) : "" }
                    locId={ locId }
                    nodeOwner={ loc!.owner }
                />
            </Dialog>
        </>
    );
}
