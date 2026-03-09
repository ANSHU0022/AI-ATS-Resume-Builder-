/**
 * Helper to handle PDF blob conversion.
 * 
 * @param {string} base64String - The base64 encoded PDF string.
 * @returns {string} A Blob URL representing the PDF.
 */
export const createPdfBlobUrl = (base64String) => {
    if (!base64String) return null;

    try {
        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        return URL.createObjectURL(blob);
    } catch (err) {
        console.error("Failed to parse PDF base64:", err);
        return null;
    }
};
