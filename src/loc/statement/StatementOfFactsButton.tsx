import { useEffect, useState, useCallback } from "react";
import { Dropdown } from "react-bootstrap";
import { UUID } from "@logion/node-api/dist/UUID";
import { LegalOfficerCase } from "@logion/node-api/dist/Types";
import { getLegalOfficerCase } from "@logion/node-api/dist/LogionLoc";

import { useCommonContext } from "../../common/CommonContext";
import { useDirectoryContext } from "../../directory/DirectoryContext";
import { STATEMENT_OF_FACTS_PATH, locDetailsPath } from "../../legal-officer/LegalOfficerPaths";
import { fullCertificateUrl } from "../../PublicPaths";
import { useLocContext } from "../LocContext";
import { DEFAULT_PATH_MODEL, PathModel, toSearchString, FormValues, Language } from "./PathModel";

import './StatementOfFactsButton.css';
import Dialog from "../../common/Dialog";
import StatementOfFactsForm from "./StatementOfFactsForm";
import { useForm } from "react-hook-form";
import StatementOfFactsSummary from "./StatementOfFactsSummary";
import { useLogionChain } from "../../logion-chain";

type Status = 'IDLE' | 'INPUT' | 'READY'

export default function StatementOfFactsButton(props: { itemId?: string, itemDescription?: string }) {
    const { accounts } = useCommonContext();
    const { ready, getOfficer } = useDirectoryContext();
    const { loc, locId, locRequest } = useLocContext();
    const [ pathModel, setPathModel ] = useState<PathModel>(DEFAULT_PATH_MODEL);
    const [ itemId, setItemId ] = useState<string>();
    const [ itemDescription, setItemDescription ] = useState<string>();
    const [ status, setStatus ] = useState<Status>('IDLE')
    const [ language, setLanguage ] = useState<Language | null>(null)
    const { control, handleSubmit, formState: { errors }, reset, setError } = useForm<FormValues>();
    const { api } = useLogionChain();
    type ContainingLoc = (LegalOfficerCase & { id: UUID })
    const [ containingLoc, setContainingLoc ] = useState<ContainingLoc | null | undefined>(null)

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
                setPathModel({
                    ...pathModel,
                    ...formValues
                })
                setStatus('READY')
            }
        }
    }, [ api, pathModel, setPathModel, setContainingLoc, setError, locId ])

    const dropDownItem = (language: Language) => {
        return (
            <Dropdown.Item onClick={ () => {
                reset()
                setStatus('INPUT')
                setLanguage(language)
            } }>{ language.toUpperCase() }</Dropdown.Item>
        )
    }

    useEffect(() => {
        if (ready
            && accounts?.current?.address !== undefined
            && accounts.current.address !== pathModel.polkadotAddress) {
            const polkadotAddress = accounts.current.address;
            const legalOfficer = getOfficer(polkadotAddress);
            setPathModel({
                ...pathModel,
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
    }, [ ready, accounts, getOfficer, pathModel, setPathModel ]);

    useEffect(() => {
        if (locId.toDecimalString() !== pathModel.locId && containingLoc) {
            const requester = loc?.requesterAddress ? loc.requesterAddress : loc?.requesterLocId?.toDecimalString() || ""
            setPathModel({
                ...pathModel,
                locId: locId.toDecimalString(),
                requester,
                certificateUrl: fullCertificateUrl(containingLoc.id),
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
    }, [ loc, locId, locRequest, pathModel, setPathModel, itemId, containingLoc ]);

    useEffect(() => {
        if((props.itemId !== itemId || props.itemDescription !== itemDescription) && containingLoc) {
            setItemId(props.itemId);
            setItemDescription(props.itemDescription);
            setPathModel({
                ...pathModel,
                itemId: props.itemId || "",
                itemDescription: props.itemDescription || "",
                certificateUrl: fullCertificateUrl(containingLoc.id),
            });
        }
    }, [ props, itemId, itemDescription, setItemId, setItemDescription, pathModel, setPathModel, locId, containingLoc ]);

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
                    previewPath={ `${ STATEMENT_OF_FACTS_PATH }${ toSearchString({
                        ...pathModel,
                        language: language || 'en'
                    }) }` }
                    relatedLocPath={ containingLoc ? locDetailsPath(containingLoc!.id, containingLoc!.locType) : "" }
                    locId={ locId }
                    nodeOwner={ loc!.owner }
                />
            </Dialog>
        </>
    );
}
