import Button from "./Button";

export interface Props {
    label: string
    email: string
}

export default function MailtoButton(props: Props) {
    return (
        <Button onClick={ () => window.location.href = `mailto:${ props.email }` }>
            { props.label }
        </Button>
    )
}
