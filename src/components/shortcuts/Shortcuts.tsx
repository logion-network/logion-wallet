import "./Shortcuts.css";

export interface Props {
    description: React.ReactNode;
    children: React.ReactNode;
}

export default function Shortcuts(props: Props) {
    return (
        <div
            className="Shortcuts"
        >
            <div className="shortcuts-description">
                { props.description }
            </div>
            <div className="shortcuts-buttons-area">
                <div className="shortcuts-buttons-container">
                    { props.children }
                </div>
            </div>
        </div>
    );
}
