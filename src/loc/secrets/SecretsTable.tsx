import Table, { EmptyTableMessage, Cell, ActionCell } from "../../common/Table";
import { Secret } from "@logion/client";
import Button from "react-bootstrap/Button";

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
                        render: secret => <Cell content={ secret.name } />
                    },
                    {
                        header: "Value",
                        render: secret => <Cell content={ secret.value } />
                    },
                    {
                        header: "",
                        render: secret =>
                            <ActionCell>
                                <Button onClick={ () => props.onRemoveSecret(secret) }>X</Button>
                            </ActionCell>
                    },
                ] }
                renderEmpty={ () => <EmptyTableMessage>No secret to display</EmptyTableMessage> }
            />
        </>
    )
}
