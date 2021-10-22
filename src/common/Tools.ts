
export const copyToClipBoard = async (data: string) => {
    await navigator.clipboard.writeText(data);
}

