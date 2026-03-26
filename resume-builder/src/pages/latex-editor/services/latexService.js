import axios from 'axios';

/**
 * Sends LaTeX source code to the backend for compilation.
 * @param {string} latexCode - The raw LaTeX code
 * @returns {Promise<{success: boolean, pdf: string|null, errors: Array}>}
 */
export const compileLatexCode = async (latexCode) => {
    try {
        const response = await axios.post('/api/latex/compile', { latexCode }, {
            headers: {
                'Content-Type': 'application/json'
            },
            // Give the backend time as pdflatex can take a few seconds
            timeout: 35000
        });

        return {
            success: true,
            pdf: response.data.pdf,
            errors: []
        };
    } catch (error) {
        if (error.response) {
            return {
                success: false,
                pdf: null,
                errors: error.response.data.errors || [{ message: 'Compilation failed with server error.' }]
            };
        } else if (error.request) {
            return {
                success: false,
                pdf: null,
                errors: [{ message: 'No response from compilation server. Compilation might have timed out or server is down.' }]
            };
        } else {
            return {
                success: false,
                pdf: null,
                errors: [{ message: 'Error setting up the compilation request: ' + error.message }]
            };
        }
    }
};
