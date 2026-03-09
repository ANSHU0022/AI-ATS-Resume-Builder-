const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const { parseLatexLog } = require('../utils/latexErrorParser.cjs');

const TEMP_DIR_BASE = path.join(__dirname, '..', '..', '..', 'temp_latex');

/**
 * Compiles a LaTeX string into a PDF and returns the base64 encoded PDF.
 * @param {string} latexCode - The raw LaTeX source code.
 * @returns {Promise<{success: boolean, pdfBase64: string, errors: Array}>}
 */
async function compileLatex(latexCode) {
    const jobId = uuidv4();
    const jobDir = path.join(TEMP_DIR_BASE, jobId);
    const texFilePath = path.join(jobDir, 'resume.tex');
    const pdfFilePath = path.join(jobDir, 'resume.pdf');
    const logFilePath = path.join(jobDir, 'resume.log');

    try {
        // 1. Create isolated temp directory
        await fs.ensureDir(jobDir);

        // 2. Write the LaTeX code to resume.tex
        await fs.writeFile(texFilePath, latexCode, 'utf8');

        // 3. Execute pdflatex
        // -interaction=nonstopmode prevents pdflatex from halting and waiting for user input on error
        // -halt-on-error stops compilation immediately on the first error
        return await new Promise((resolve) => {
            const pdflatex = spawn('pdflatex', [
                '-interaction=nonstopmode',
                '-halt-on-error',
                'resume.tex'
            ], {
                cwd: jobDir, // Run command inside the temp directory
                timeout: 30000 // 30 seconds max
            });

            let stdoutData = '';
            let stderrData = '';

            pdflatex.stdout.on('data', (data) => {
                stdoutData += data.toString();
            });

            pdflatex.stderr.on('data', (data) => {
                stderrData += data.toString();
            });

            pdflatex.on('close', async (code, signal) => {
                if (code === 0) {
                    // Compilation succeeded
                    try {
                        const pdfBuffer = await fs.readFile(pdfFilePath);
                        const pdfBase64 = pdfBuffer.toString('base64');
                        resolve({ success: true, pdfBase64, errors: [] });
                    } catch (readErr) {
                        console.error('Failed to read resulting PDF:', readErr);
                        resolve({ success: false, errors: [{ message: 'Failed to read compiled PDF file.' }] });
                    }
                } else if (signal === 'SIGTERM') {
                    // Compilation timed out
                    resolve({
                        success: false,
                        errors: [{ message: 'Compilation timed out (took longer than 30 seconds). This may happen if the compiler is stuck waiting for required LaTeX packages to be installed.' }]
                    });
                } else {
                    // Compilation failed. Read the log file to parse errors.
                    try {
                        const logContent = await fs.readFile(logFilePath, 'utf8');
                        const parsedErrors = parseLatexLog(logContent);
                        resolve({ success: false, errors: parsedErrors });
                    } catch (logErr) {
                        console.error('Failed to read log file:', logErr);
                        // Fallback to stderr or stdout if log file is missing
                        const fallbackOutput = stderrData || stdoutData || 'Unknown pdflatex error';
                        resolve({ success: false, errors: [{ message: 'Compilation failed: ' + fallbackOutput.substring(0, 200) }] });
                    }
                }

                // 4. Cleanup temp directory in the background (fire and forget)
                fs.remove(jobDir).catch(err => console.error(`Failed to clean up temp dir ${jobDir}:`, err));
            });

            pdflatex.on('error', (err) => {
                resolve({
                    success: false, errors: [{ message: `Failed to start pdflatex process. Ensure TeX Live is installed on the server. Error: ${err.message}` }]
                });
                fs.remove(jobDir).catch(e => console.error(e));
            });
        });

    } catch (error) {
        console.error('Fatal error in compileLatex service:', error);
        // Attempt cleanup if something threw before the spawn finished
        fs.remove(jobDir).catch(() => { });
        return { success: false, errors: [{ message: 'Server error during compilation: ' + error.message }] };
    }
}

module.exports = {
    compileLatex
};
