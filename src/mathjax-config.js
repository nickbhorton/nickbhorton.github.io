window.MathJax = {
    tex: {
        tags: 'ams'
    },
    startup: {
        ready() {
        MathJax.startup.defaultReady();
        const {STATE} = MathJax._.core.MathItem;
        MathJax.tex2mml(String.raw`
            \renewcommand{\v}[1]{\vec{#1}}
            \newcommand{\uv}[1]{\hat{#1}}
        `);
        }
    }
};