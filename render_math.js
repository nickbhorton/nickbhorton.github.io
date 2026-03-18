const fs = require('fs');
const path = require('path');
const { mathjax } = require('mathjax-full/js/mathjax.js');
const { TeX } = require('mathjax-full/js/input/tex.js');
const { SVG } = require('mathjax-full/js/output/svg.js');
const { liteAdaptor } = require('mathjax-full/js/adaptors/liteAdaptor.js');
const { RegisterHTMLHandler } = require('mathjax-full/js/handlers/html.js');
const { AllPackages } = require('mathjax-full/js/input/tex/AllPackages.js');

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const tex = new TeX({ packages: AllPackages });
const svg = new SVG({ fontCache: 'local' });
const html = mathjax.document('', { InputJax: tex, OutputJax: svg });

// Helper to replace LaTeX with SVG
function replaceMath(content) {
    // Regex for block math $$...$$
    return content.replace(/\$\$(.+?)\$\$/gs, (match, formula) => {
        const node = html.convert(formula, { display: true });
        return adaptor.innerHTML(node);
    }).replace(/\$(.+?)\$/g, (match, formula) => {
        // Regex for inline math $...$
        const node = html.convert(formula, { display: false });
        return adaptor.innerHTML(node);
    });
}

// Simple build logic
const source_directory = './src';
const dist_directory = './dist';

if (!fs.existsSync(dist_directory)) fs.mkdirSync(dist_directory);

fs.readdirSync(source_directory).forEach(file => {
    if (file.endsWith('.html')) {
        const content = fs.readFileSync(path.join(source_directory, file), 'utf8');
        const rendered = replaceMath(content);
        fs.writeFileSync(path.join(dist_directory, file), rendered);
        console.log(`Processed: ${file}`);
    }
});

fs.writeFileSync(path.join(dist_directory, "styles.css"), adaptor.textContent(svg.styleSheet(html)))
console.log("Wrote styles.css")

