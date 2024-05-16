import Button from "../../common/Button";
import { useNavigate } from "react-router-dom";
import { secretsPath } from "../../wallet-user/UserPaths";
import { useLocContext } from "../LocContext";
import Icon from "../../common/Icon";
import "./SecretsButton.css";

export default function SecretsButton() {
    const { loc } = useLocContext();
    const navigate = useNavigate();
    if (loc === null) {
        return null;
    }

    return (
        <Button className="SecretsButton"
                onClick={ () => navigate(secretsPath(loc.id)) }>
            <Icon icon={ { id: "key" } } />
            Recoverable secrets
        </Button>
    )
}
