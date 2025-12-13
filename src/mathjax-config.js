window.MathJax = {
    tex: {
        tags: 'ams'
    },
    startup: {
        ready() {
        MathJax.startup.defaultReady();
        const {STATE} = MathJax._.core.MathItem;
        MathJax.tex2mml(String.raw`
            \newcommand{\tv}[1]{\pmb{\mathscr{#1}}}
            \renewcommand{\t}[1]{\mathscr{#1}}
            \renewcommand{\v}[1]{\mathbf{#1}}
            \newcommand{\uv}[1]{\hat{\mathbf{#1}}}
        `);
        }
    }
};