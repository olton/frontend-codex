export default {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-scss'
  ],
  plugins: ['stylelint-prettier'],
  rules: {
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': true,
    'annotation-no-unknown': null,
    'prettier/prettier': true,
    'selector-class-pattern': null,
    'custom-property-pattern': null,
    'scss/at-mixin-pattern': null,
    'scss/dollar-variable-pattern': null,
    'no-descending-specificity': null,
    // Відключаємо попередження для властивостей, які обробляються autoprefixer
    'property-no-vendor-prefix': null,
    'value-no-vendor-prefix': null,
    'at-rule-no-vendor-prefix': null,
    'selector-no-vendor-prefix': null,
  },
};
