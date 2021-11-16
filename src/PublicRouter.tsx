import { Routes, Route } from "react-router-dom";
import Certificate from "./certificate/Certificate";
import { CERTIFICATE_RELATIVE_PATH } from "./PublicPaths";

export default function PublicRouter() {
    return (
        <Routes>
            <Route path={ CERTIFICATE_RELATIVE_PATH } element={ <Certificate /> } />
        </Routes>
    )
}
