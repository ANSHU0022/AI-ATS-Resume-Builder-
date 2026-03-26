const FormData = require('form-data');
const axios = require('axios');
const { parseLatexLog } = require('../utils/latexErrorParser.cjs');

/**
 * Compiles a LaTeX string into a PDF and returns the base64 encoded PDF.
 * Uses the free texlive.net API.
 * @param {string} latexCode - The raw LaTeX source code.
 * @returns {Promise<{success: boolean, pdfBase64: string, errors: Array}>}
 */
async function compileLatex(latexCode) {
    try {
        const formData = new FormData();

        // Append the LaTeX code
        formData.append('filecontents[]', latexCode);
        formData.append('filename[]', 'document.tex');
        formData.append('engine', 'pdflatex');
        formData.append('return', 'pdf');

        // Make the API request to texlive.net
        // Response type must be arraybuffer to correctly handle the binary PDF data
        const response = await axios.post('https://texlive.net/cgi-bin/latexcgi', formData, {
            headers: {
                ...formData.getHeaders(),
            },
            responseType: 'arraybuffer',
            timeout: 30000, // 30 seconds max
            validateStatus: status => true // handle all statuses manually
        });

        const contentType = response.headers['content-type'] || '';

        // The API returns application/pdf on success
        if (response.status === 200 && contentType.includes('application/pdf')) {
            // Compilation succeeded, response data is the PDF binary buffer
            const pdfBase64 = Buffer.from(response.data).toString('base64');
            return { success: true, pdfBase64, errors: [] };
        } else {
            // Compilation failed. Attempt to read error logs from the response content.
            let errorMessage = 'Unknown compilation error from API';
            try {
                // Determine if the returned buffer is text (log)
                errorMessage = Buffer.from(response.data).toString('utf8');

                // Try parsing the LaTeX log
                const parsedErrors = parseLatexLog(errorMessage);
                if (parsedErrors && parsedErrors.length > 0) {
                    return { success: false, errors: parsedErrors };
                }
            } catch (parseErr) {
                console.error("Failed to parse API error response:", parseErr);
            }

            return { success: false, errors: [{ message: `Compilation failed (Status ${response.status}):\n${errorMessage.substring(0, 500)}` }] };
        }
    } catch (error) {
        console.error('Fatal error in compileLatex service:', error);

        let errorMsg = error.message;
        if (error.code === 'ECONNABORTED') {
            errorMsg = 'Compilation timed out (took longer than 30 seconds).';
        }
        return { success: false, errors: [{ message: 'Server error communicating with compiler API: ' + errorMsg }] };
    }
}

module.exports = {
    compileLatex
};
