import Button from "./Button";
import Icon from "./Icon";

export default function VaultOutRequest() {
    return (
        <Button className="request-vault-out"><Icon icon={ { id: 'vault-out' } } /> Request a vault-out transfer</Button>
    )
}
