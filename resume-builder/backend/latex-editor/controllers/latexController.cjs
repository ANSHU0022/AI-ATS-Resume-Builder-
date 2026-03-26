const { compileLatex } = require('../services/latexCompilerService.cjs');

exports.compile = async (req, res) => {
    try {
        const { latexCode } = req.body;

        if (!latexCode || typeof latexCode !== 'string') {
            return res.status(400).json({
                success: false,
                errors: [{ message: 'No LaTeX code provided in request body.' }]
            });
        }

        // Call the compiler service
        const result = await compileLatex(latexCode);

        if (result.success) {
            return res.status(200).json({
                success: true,
                pdf: result.pdfBase64
            });
        } else {
            return res.status(500).json({
                success: false,
                errors: result.errors && result.errors.length > 0 ? result.errors : [{ message: 'Compilation failed with unknown errors.' }]
            });
        }

    } catch (error) {
        console.error('Error in latexController:', error);
        res.status(500).json({
            success: false,
            errors: [{ message: 'Internal server error during LaTeX compilation.' }]
        });
    }
};
