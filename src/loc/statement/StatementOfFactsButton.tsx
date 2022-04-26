import React, { ReactChild, useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { useCommonContext } from "../../common/CommonContext";
import { useDirectoryContext } from "../../directory/DirectoryContext";
import { STATEMENT_OF_FACTS_PATH } from "../../legal-officer/LegalOfficerPaths";
import { UUID } from "../../logion-chain/UUID";
import { fullCertificateUrl, fullCollectionItemCertificate } from "../../PublicPaths";
import { useLocContext } from "../LocContext";
import { DEFAULT_PATH_MODEL, PathModel, toSearchString } from "./PathModel";

import './StatementOfFactsButton.css';

interface CustomItemProps {
    children: ReactChild;
    pathModel: PathModel;
    language: string;
}

const CustomItem = React.forwardRef<HTMLAnchorElement, CustomItemProps>((props, ref) => {

    let path = `${STATEMENT_OF_FACTS_PATH}${toSearchString({
        ...props.pathModel,
        language: props.language
    })}`;

    return (
        <a
        href={ path }
        target="_blank"
        rel="noreferrer"
        ref={ ref }
        className="StatementOfFactsButtonDropdownItem"
        >
        { props.children }
        </a>
    );
});

export default function StatementOfFactsButton(props: { itemId?: string }) {
    const { accounts } = useCommonContext();
    const { ready, getOfficer } = useDirectoryContext();
    const { loc, locId, locRequest } = useLocContext();

    const [ pathModel, setPathModel ] = useState<PathModel>(DEFAULT_PATH_MODEL);
    const [ itemId, setItemId ] = useState<string>();

    useEffect(() => {
        if(ready
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
    }, [ ready, accounts, getOfficer, pathModel ]);

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

    return (
        <Dropdown>
            <Dropdown.Toggle className="Button" id="StatementOfFacts-dropdown-toggle">Statement of facts</Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item as={ CustomItem } pathModel={ pathModel } language="en">EN</Dropdown.Item>
                <Dropdown.Item as={ CustomItem } pathModel={ pathModel } language="fr">FR</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}

function certificateUrl(locId: UUID, itemId?: string): string {
    if(itemId) {
        return fullCollectionItemCertificate(locId, itemId);
    } else {
        return fullCertificateUrl(locId);
    }
}
