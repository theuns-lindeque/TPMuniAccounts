# Lessons Learned

- [x] **MUI & Tailwind 4 Coexistence**: Using MUI App Router support (`@mui/material-nextjs`) is essential for SSR. Always wrap layouts with `AppRouterCacheProvider`.
- [x] **MUI Component Imports**: Be meticulous with imports (e.g., `Typography`, `Grid` vs `Grid2`). If a component is used in a floating element or deeply nested layout, verify it's imported correctly.
- [x] **React Style Prop**: CSS property names in the `style={{}}` object MUST be camelCase (e.g., `flexShrink: 0` instead of `shrink: 0`). This is a common source of TypeScript build errors.
- [x] **Neon Database Connection**: When using `@neondatabase/serverless` (neon-http), `fetch` errors can occur if the connection string is slightly off. Keep the `-pooler` prefix if required by the environment and ensure `sslmode=require` is present.
- [x] **Payload CMS Auth**: The `getMe` fallback with manual `jwt.verify` is sensitive to the `PAYLOAD_SECRET`. Ensure the secret is consistent between environments and matches the one in `payload.config.ts`.
- [x] **Theme Definitions**: Always scan for duplicate keys in large theme objects (e.g., color palettes). TypeScript and Vercel build processes are strict about this.
