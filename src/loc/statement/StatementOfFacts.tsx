import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SofParams } from './SofParams';
import StatementOfFactsTemplateEN from './StatementOfFactsTemplateEN';
import StatementOfFactsTemplateFR from './StatementOfFactsTemplateFR';
import { loadSofParams } from "../../common/Storage";

export default function StatementOfFacts() {
    const location = useLocation();

    const [ sofParams, setSofParams ] = useState<SofParams>();

    useEffect(() => {
        const pathModel = loadSofParams();
        document.title = `logion - ${ pathModel.locId }`;
        setSofParams(pathModel);
    }, [ location ]);

    if(sofParams === undefined) {
        return null;
    }

    if(sofParams.language === 'fr') {
        return <StatementOfFactsTemplateFR pathModel={ sofParams } />;
    } else {
        return <StatementOfFactsTemplateEN pathModel={ sofParams } />;
    }
}
