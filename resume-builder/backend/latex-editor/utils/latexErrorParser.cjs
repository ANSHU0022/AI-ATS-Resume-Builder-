/**
 * Parses raw LaTeX log output to extract meaningful error messages.
 * 
 * @param {string} logText - The full log text from pdflatex.
 * @returns {Array} List of error objects { line: number|null, message: string }
 */
function parseLatexLog(logText) {
    if (!logText) return [{ line: null, message: "Compilation failed with no output." }];

    const errors = [];
    const lines = logText.split('\n');

    let currentError = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Standard LaTeX error format: "! Error message."
        if (line.startsWith('! ')) {
            // Save previous if exists
            if (currentError) {
                errors.push(currentError);
            }

            currentError = {
                message: line.substring(2).trim(), // Remove "! "
                line: null,
            };

            // Try to read the next few lines to find "l.XYZ" (line number)
            for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                const lookahead = lines[j];
                if (lookahead.match(/^l\.\d+/)) {
                    const match = lookahead.match(/^l\.(\d+)/);
                    if (match && match[1]) {
                        currentError.line = parseInt(match[1], 10);

                        // Add the context snippet if available
                        const context = lookahead.substring(match[0].length).trim();
                        if (context) {
                            currentError.message += ` (Context: ...${context})`;
                        }
                    }
                    break; // Found line number, stop looking ahead
                }
            }
        }
        // Handle LaTeX Warning
        else if (line.toLowerCase().includes('latex warning:')) {
            if (currentError) {
                errors.push(currentError);
                currentError = null;
            }
            // We might not want to treat warnings as full errors, but we can capture them
            // For now we just ignore warnings unless specifically needed.
        }
        // Handle specific file not found error
        else if (line.startsWith('! LaTeX Error: File')) {
            if (currentError) errors.push(currentError);
            currentError = {
                message: line.substring(2).trim(),
                line: null
            };
        }
    }

    // Push the last one
    if (currentError) {
        errors.push(currentError);
    }

    // If we couldn't parse anything specific, return a generic error
    if (errors.length === 0) {
        // Look for Emergency stop
        if (logText.includes("Emergency stop")) {
            return [{ line: null, message: "Compilation halted due to a fatal error. Please check syntax." }];
        }
        return [{ line: null, message: "Unknown LaTeX error occurred. Check syntax and packages." }];
    }

    return errors;
}

module.exports = {
    parseLatexLog
};
