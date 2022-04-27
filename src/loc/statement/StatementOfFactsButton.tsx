import React, { useEffect, useState, useCallback } from "react";
import { Dropdown } from "react-bootstrap";
import { useCommonContext } from "../../common/CommonContext";
import { useDirectoryContext } from "../../directory/DirectoryContext";
import { STATEMENT_OF_FACTS_PATH, locDetailsPath } from "../../legal-officer/LegalOfficerPaths";
import { UUID } from "../../logion-chain/UUID";
import { fullCertificateUrl, fullCollectionItemCertificate } from "../../PublicPaths";
import { useLocContext } from "../LocContext";
import { DEFAULT_PATH_MODEL, PathModel, toSearchString, FormValues, Language } from "./PathModel";

import './StatementOfFactsButton.css';
import Dialog from "../../common/Dialog";
import StatementOfFactsForm from "./StatementOfFactsForm";
import { useForm } from "react-hook-form";
import StatementOfFactsSummary from "./StatementOfFactsSummary";
import { useNavigate } from "react-router-dom";
import { getLegalOfficerCase } from "../../logion-chain/LogionLoc";
import { LegalOfficerCase } from "../../logion-chain/Types";
import { useLogionChain } from "../../logion-chain";

type Status = 'IDLE' | 'INPUT' | 'READY'

export default function StatementOfFactsButton(props: { itemId?: string }) {
    const { accounts } = useCommonContext();
    const { ready, getOfficer } = useDirectoryContext();
    const { loc, locId, locRequest } = useLocContext();
    const [ pathModel, setPathModel ] = useState<PathModel>(DEFAULT_PATH_MODEL);
    const [ itemId, setItemId ] = useState<string>();
    const [ status, setStatus ] = useState<Status>('IDLE')
    const [ language, setLanguage ] = useState<Language | null>(null)
    const { control, handleSubmit, reset } = useForm<FormValues>();
    const { api } = useLogionChain();
    type ContainingLoc = (LegalOfficerCase & { id: UUID })
    const [ containingLoc, setContainingLoc ] = useState<ContainingLoc | null | undefined>(null)
    const submit = useCallback(async (formValues: FormValues) => {
        if (api) {
            const containingLocId = UUID.fromAnyString(formValues.containingLocId);
            if (containingLocId) {
                const loc = await getLegalOfficerCase({ locId: containingLocId, api })
                if (loc) {
                    setContainingLoc({
                        id: containingLocId,
                        ...loc
                    })
                    setPathModel({
                        ...pathModel,
                        ...formValues
                    })
                    setStatus('READY')
                } else {
                    setContainingLoc(undefined)
                    // TODO raise error to form
                }
            }
        }
    }, [ api, pathModel, setPathModel, setContainingLoc ])
    const navigate = useNavigate();

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
        if(loc?.requesterAddress !== pathModel.requesterAddress
                || locId.toDecimalString() !== pathModel.locId) {
            setPathModel({
                ...pathModel,
                locId: locId.toDecimalString(),
                requesterAddress: loc?.requesterAddress || "",
                certificateUrl: certificateUrl(locId, itemId),
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
    }, [ loc, locId, locRequest, pathModel, setPathModel, itemId ]);

    useEffect(() => {
        if(props.itemId !== itemId) {
            setItemId(props.itemId);
            setPathModel({
                ...pathModel,
                certificateUrl: certificateUrl(locId, props.itemId),
            });
        }
    }, [ props.itemId, itemId, setItemId, pathModel, setPathModel, locId ]);

    const cancelCallback = useCallback(() => {
        setStatus('IDLE')
        setLanguage(null)
    }, [ setStatus, setLanguage ])

    return (
        <>
            <Dropdown>
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
                <StatementOfFactsForm type={ loc!.locType } control={ control } />
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
                    },
                    {
                        id: "submit",
                        callback: () => navigate(locDetailsPath(containingLoc!.id, containingLoc!.locType)),
                        buttonText: 'Go to related LOC',
                        buttonVariant: 'primary',
                    }
                ] }
            >
                <StatementOfFactsSummary previewPath={ `${ STATEMENT_OF_FACTS_PATH }${ toSearchString({
                    ...pathModel,
                    language: language || 'en'
                }) }` } />
            </Dialog>
        </>
    );
}

function certificateUrl(locId: UUID, itemId?: string): string {
    if(itemId) {
        return fullCollectionItemCertificate(locId, itemId);
    } else {
        return fullCertificateUrl(locId);
    }
}