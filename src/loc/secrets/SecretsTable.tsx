import Table, { EmptyTableMessage, Cell, ActionCell } from "../../common/Table";
import { Secret } from "@logion/client";
import Button from "react-bootstrap/Button";
import Icon from "../../common/Icon";
import ViewableSecret from "./ViewableSecret";

export interface Properties {
    secrets: Secret[];
    onRemoveSecret: (secret: Secret) => void;
}

export default function SecretsTable(props: Properties) {

    return (
        <>
            <Table
                data={ props.secrets }
                columns={ [
                    {
                        header: "Name",
                        width: "200px",
                        render: secret => <Cell content={ secret.name } />
                    },
                    {
                        header: "Value",
                        render: secret => <ViewableSecret value={ secret.value } />
                    },
                    {
                        header: "",
                        width: "70px",
                        render: secret =>
                            <ActionCell>
                                <Button
                                    variant="danger"
                                    onClick={ () => props.onRemoveSecret(secret) }
                                >
                                    <Icon icon={ { id: 'trash' } } />
                                </Button>
                            </ActionCell>
                    },
                ] }
                renderEmpty={ () => <EmptyTableMessage>No secret to display</EmptyTableMessage> }
            />
        </>
    )
}
