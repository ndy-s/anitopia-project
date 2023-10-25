export const generateUniqueID = (latestUserToken: string | null) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
        
    let generatedCode;
    if (latestUserToken) {
        const length = Math.max(latestUserToken.length, 4);

        if (latestUserToken === '9'.repeat(length)) {
            generatedCode = 'A' + 'A'.repeat(length);
        } else {
            const code = latestUserToken;
            const codeArray = code.split('');

            for (let i = codeArray.length - 1; i >= 0; i--) {
                const charIndex = characters.indexOf(codeArray[i]);
                if (charIndex < charactersLength - 1) {
                    codeArray[i] = characters.charAt(charIndex + 1);
                    break;
                } else {
                    codeArray[i] = 'A';
                }
            }

            generatedCode = codeArray.join('');
        }
    } else {
        generatedCode = 'AAAA';
    }
    return generatedCode
};