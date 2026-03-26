const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'ResumeBuilder', 'ResumeBuilder.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = {
    'âš™ï¸': '⚙️',
    'âš¡': '⚡',
    'ðŸ” ': '🔍',
    'âš ï¸': '⚠️',
    'ðŸ”„': '🔄',
    'âœ•': '✕',
    'ðŸŽ¯': '🎯',
    'â Œ': '❌',
    'ðŸ’¡': '💡',
    'âœ…': '✅',
    'âž•': '➕',
    'âœ“': '✓',
    'â†’': '→',
    'ðŸ’¬': '💬',
    'â ³': '⏳',
    'âœ✨': '✨',
    'â€¢': '•',
    'âš ': '⚠️'
};

for (const [bad, good] of Object.entries(replacements)) {
    content = content.split(bad).join(good);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replacements completed.');
