import pluginVue from 'eslint-plugin-vue';
import prettier from "eslint-config-prettier";
import eslint from "@eslint/js";

export default [
  eslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  prettier,
];
