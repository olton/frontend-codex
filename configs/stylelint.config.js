/** @type {import('stylelint').Config} */
export default {
    extends: [
        "stylelint-config-standard",
        "stylelint-config-recommended",
        "stylelint-config-prettier"
    ],
    plugins: [
        "stylelint-order"
    ],
    rules: {
        // 🧠 Іменування класів: lowercase-with-hyphens, БЕМ
        "selector-class-pattern": [
            "^[a-z0-9]+(-[a-z0-9]+)*(__[a-z0-9]+)?(--[a-z0-9]+)?$",
            {
                message: "Класи мають бути в lowercase-with-hyphens або відповідати БЕМ-нотації"
            }
        ],

        // 🎯 Специфікація та селектори
        "selector-max-specificity": "0,3,0",
        "selector-max-id": 0,
        "selector-max-universal": 0,

        // 🎨 Стилі та форматування: порядок властивостей
        "order/properties-order": [
            [
                // Layout
                "display", "position", "top", "right", "bottom", "left", "z-index",
                // Box model
                "width", "height", "margin", "padding", "border",
                // Typography
                "font-family", "font-size", "line-height", "text-align", "color",
                // Visual
                "background", "box-shadow", "opacity",
                // Interaction
                "transition", "animation", "cursor"
            ],
            {
                unspecified: "bottomAlphabetical"
            }
        ],

        // 📐 Адаптивність: перевага em/rem/%/vw/vh
        "unit-disallowed-list": ["px"],

        // 🌐 Темізація: використання CSS-перемінних
        "property-no-unknown": [true, {
            ignoreProperties: ["/^--.*/"]
        }],

        // ♿ Accessibility: outline, :focus-visible
        "selector-pseudo-class-no-unknown": [true, {
            ignorePseudoClasses: ["focus-visible"]
        }],

        // ✅ Коментарі: пояснюють "чому"
        "comment-whitespace-inside": "always",

        // 🧪 Перевірка: базові правила
        "no-empty-source": true,
        "color-no-invalid-hex": true,
        "declaration-block-no-duplicate-properties": true,
        "block-no-empty": true
    }
};