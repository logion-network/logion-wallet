import { useLocContext } from "../LocContext";
import LocPane from "../LocPane";
import Frame from "../../common/Frame";
import { locDetailsPath as userLocDetailsPath } from "../../wallet-user/UserPaths";
import { UserLocContextProvider } from "../UserLocContext";
import { UUID } from "@logion/node-api";
import { useParams } from "react-router-dom";
import Button from "../../common/Button";
import Icon from "../../common/Icon";
import { useState, useCallback } from "react";
import AddSecretDialog from "./AddSecretDialog";
import { Secret, ClosedIdentityLoc } from "@logion/client";
import SecretsTable from "./SecretsTable";
import RemoveSecretDialog from "./RemoveSecretDialog";

function UserSecretsPane() {
    const { loc, locState, backPath, mutateLocState } = useLocContext();
    const [ showAddDialog, setShowAddDialog ] = useState(false);
    const [ secretToRemove, setSecretToRemove ] = useState<Secret>();

    const addSecret = useCallback(async (secret: Secret) => {
        await mutateLocState(async current => {
            if (current instanceof ClosedIdentityLoc) {
                return await current.addSecret(secret);
            } else {
                return current;
            }
        })
        setShowAddDialog(false);
    }, [ mutateLocState ])

    const removeSecret = useCallback(async (secret: Secret) => {
        await mutateLocState(async current => {
            if (current instanceof ClosedIdentityLoc) {
                return await current.removeSecret(secret.name);
            } else {
                return current;
            }
        })
        setSecretToRemove(undefined);
    }, [ mutateLocState ])

    return (
        <LocPane
            loc={ loc }
            backPath={ backPath }
            contributionMode="Requester"
        >
            <Frame
                title="Secrets"
            >
                <SecretsTable
                    secrets={ locState?.data().secrets || [] }
                    onRemoveSecret={ setSecretToRemove }
                />
                <Button onClick={ () => setShowAddDialog(true) }>
                    <Icon icon={ { id: "add" } } /> Add a secret
                </Button>
                <AddSecretDialog
                    show={ showAddDialog }
                    onAddSecret={ addSecret }
                    onCancel={ () => setShowAddDialog(false) }
                />
                <RemoveSecretDialog
                    secret={ secretToRemove }
                    onRemoveSecret={ removeSecret }
                    onCancel={ () => setSecretToRemove(undefined) }
                />
            </Frame>
        </LocPane>
    )
}

export default function SecretsPane() {
    const locId = new UUID(useParams<"locId">().locId);

    return (
        <UserLocContextProvider
            locId={ locId }
            backPath={ userLocDetailsPath(locId, "Identity") }
            detailsPath={ userLocDetailsPath }
        >
            <UserSecretsPane />
        </UserLocContextProvider>
    );
}
