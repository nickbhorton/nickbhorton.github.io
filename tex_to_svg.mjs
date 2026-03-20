import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { SVG } from 'mathjax-full/js/output/svg.js';
import { jsdomAdaptor } from 'mathjax-full/js/adaptors/jsdomAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { JSDOM } from 'jsdom';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';
import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { join, extname } from 'path'
import * as cheerio from 'cheerio'

const adaptor = jsdomAdaptor(JSDOM);
RegisterHTMLHandler(adaptor);

const tex_macros = {
    v: ["\\pmb{#1}", 1],
    ca: ["\\class{color_a}{#1}", 1],
    cb: ["\\class{color_b}{#1}", 1],
    cc: ["\\class{color_c}{#1}", 1],
    cd: ["\\class{color_d}{#1}", 1],
}

const tex = new TeX({ packages: AllPackages, macros: tex_macros });
const svg = new SVG({ fontCache: 'local' });
const html = mathjax.document('', { InputJax: tex, OutputJax: svg });

export function tex_to_svg(formula, display = true) {
    const node = html.convert(formula, {
        display: display,
    });
    
    return adaptor.innerHTML(node);
}

const source_directory = "./src"
const dist_directory = "./dist"

export function convert_html_equations() {
    const tex_equation_strings = []
    try {
        const files = readdirSync(source_directory);
        const html_files = files.filter(file => extname(file) == ".html");

        html_files.forEach(file => {
            const source_path = join(source_directory, file);
            const dist_path = join(dist_directory, file);

            // load html file
            const content = readFileSync(source_path, 'utf-8');
            const $ = cheerio.load(content);

            // replace tex with svg
            $('code.tex').each((index, element) => {
                const tex_equation_string = $(element).html().trim().split('\n').map(line => line.trim()).join('').replace(/&amp;/g, "&")
                tex_equation_strings.push(tex_equation_string);
                const svg = tex_to_svg(tex_equation_string)
                const svg_cheerio = cheerio.load(svg)

                // add classes from code element to svg
                const class_names = $(element).attr("class")
                svg_cheerio("svg").addClass(class_names)

                // scale svg
                const scale = 2.0
                const width = parseFloat(svg_cheerio("svg").attr('width'))
                const height = parseFloat(svg_cheerio("svg").attr('height'))
                svg_cheerio("svg").attr('width', (width * scale).toString() + "ex")
                svg_cheerio("svg").attr('height', (height * scale).toString() + "ex")
                
                // replace code tag with svg
                $(element).replaceWith(svg_cheerio.html())
            });

            // write distribution html
            writeFileSync(dist_path, $.html(), 'utf-8')
        })
    }
    catch (err) {
        console.error(err)
    }
    return tex_equation_strings
}

console.log(convert_html_equations())