(function () {
    addIcons();

    function addIcons() {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", addIcons);
            return;
        }

        const svgNamespace = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNamespace, "svg");
        svg.setAttribute("xmlns", svgNamespace);
        document.body.appendChild(svg);

        const icons = [
            { id: "icon-1", stroke: "var(--color-ts-module)", text: "M", rx: 6 },
            { id: "icon-2", stroke: "var(--color-ts-module)", text: "M", rx: 6 },
            { id: "icon-4", stroke: "var(--color-ts-namespace)", text: "N", rx: 6 },
            { id: "icon-8", stroke: "var(--color-ts-enum)", text: "E", rx: 6 },
            { id: "icon-16", stroke: "var(--color-ts-property)", text: "P", rx: 12 },
            { id: "icon-32", stroke: "var(--color-ts-variable)", text: "V", rx: 6 },
            { id: "icon-64", stroke: "var(--color-ts-function)", text: "F", rx: 6 },
            { id: "icon-128", stroke: "var(--color-ts-class)", text: "C", rx: 6 },
            { id: "icon-256", stroke: "var(--color-ts-interface)", text: "I", rx: 6 },
            { id: "icon-512", stroke: "var(--color-ts-constructor)", text: "C", rx: 12 },
            { id: "icon-1024", stroke: "var(--color-ts-property)", text: "P", rx: 12 },
            { id: "icon-2048", stroke: "var(--color-ts-method)", text: "M", rx: 12 },
            { id: "icon-65536", stroke: "var(--color-ts-type-alias)", text: "T", rx: 6 },
            { id: "icon-4194304", stroke: "var(--color-ts-reference)", text: "R", rx: 12 },
        ];

        icons.forEach((icon) => {
            const g = document.createElementNS(svgNamespace, "g");
            g.setAttribute("id", icon.id);
            g.setAttribute("class", "tsd-no-select");

            const rect = document.createElementNS(svgNamespace, "rect");
            rect.setAttribute("fill", "var(--color-icon-background)");
            rect.setAttribute("stroke", icon.stroke);
            rect.setAttribute("stroke-width", "1.5");
            rect.setAttribute("x", "1");
            rect.setAttribute("y", "1");
            rect.setAttribute("width", "22");
            rect.setAttribute("height", "22");
            rect.setAttribute("rx", icon.rx);

            const text = document.createElementNS(svgNamespace, "text");
            text.setAttribute("fill", "var(--color-icon-text)");
            text.setAttribute("x", "50%");
            text.setAttribute("y", "50%");
            text.setAttribute("dominant-baseline", "central");
            text.setAttribute("text-anchor", "middle");
            text.textContent = icon.text;

            g.appendChild(rect);
            g.appendChild(text);
            svg.appendChild(g);
        });
    }
})();
