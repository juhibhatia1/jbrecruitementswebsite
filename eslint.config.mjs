import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "prefer-rest-params": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/set-state-in-render": "off",
      "@next/next/no-html-link-for-pages": "off",
      "prefer-const": "off",
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "lib/prisma-client/**",
    "scratch/**",
    "scripts/**",
  ]),
]);

export default eslintConfig;
