import Button from "../../common/Button";
import { useNavigate } from "react-router-dom";
import { secretsPath } from "../../wallet-user/UserPaths";
import { useLocContext } from "../LocContext";

export default function SecretsButton() {
    const { loc } = useLocContext();
    const navigate = useNavigate();
    if (loc === null) {
        return null;
    }

    return (
        <Button onClick={ () => { navigate(secretsPath(loc.id))} }>
            Recoverable secrets
        </Button>
    )
}
