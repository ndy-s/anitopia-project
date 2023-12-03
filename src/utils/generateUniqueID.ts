export const generateUniqueID = (latestUserToken: string | null) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;

    if (latestUserToken) {
        const length = Math.max(latestUserToken.length, 4);

        if (latestUserToken === '9'.repeat(length)) {
            return 'A' + 'A'.repeat(length);
        }

        const codeArray = Array.from(latestUserToken);

        for (let i = codeArray.length - 1; i >= 0; i--) {
            const charIndex = characters.indexOf(codeArray[i]);

            if (charIndex < charactersLength - 1) {
                codeArray[i] = characters.charAt(charIndex + 1);
                break;
            } else {
                codeArray[i] = 'A';
            }
        }

        return codeArray.join('');
    }

    return 'AAAA';
};
