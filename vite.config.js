/// <reference types="vitest" />
import { report } from 'process'
import { defineConfig } from 'vite'

export default defineConfig({
    test: {
        include: ["**/ts-vitest/src/mocks.spec.ts"],
        coverage: {
            report: {
                reporter: ["cobertura", "html"]
            },
            include: ["**/ts-vitest/src/mocks.ts"],
        }
    },
})