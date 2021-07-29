import { useCommonContext } from './CommonContext';

import './Logo.css';

export interface Props {
    shadowColor: string,
}

export default function Logo(props: Props) {
    const { colorTheme } = useCommonContext();

    let fileName;
    if(colorTheme.type === 'dark') {
        fileName = 'logo.png';
    } else {
        fileName = 'logo_black.png';
    }

    return (
        <div
            className="Logo"
            style={{
                boxShadow: `-25px 5px 25px ${props.shadowColor}`,
            }}
        >
            <div className="image-and-slogan">
                <div className="image">
                    <img src={process.env.PUBLIC_URL + "/" + fileName} alt="logo" />
                </div>
                <div className="slogan">
                    <div className="text">
                        One blockchain<br/>
                        to trust them all
                    </div>
                </div>
            </div>
        </div>
    );
}
