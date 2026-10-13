# Calcify

Calcify is a responsive, browser-only app for everyday arithmetic, scientific calculations, unit conversions, and reference currency conversions. It requires no accounts, backend, database, API keys, or paid services. The project package is `calcify`, version `0.1.0`.

## Audience and product rationale

- **Everyday Users:** quick answers for shopping, budgeting, travel, cooking, and work.
- **Students / Technical Users:** scientific expressions, angle modes, and efficient correction of existing calculations.

A calculator was chosen to address common tasks with clear, testable outcomes. Combining them reduces switching between tools; editable expressions and recent results reduce repeated work.

## Implemented features

- **Basic calculator:** arithmetic, percentages, decimals, sign toggle, clear, and backspace. Supports normal precedence and replacement of consecutive arithmetic operators.
- **Scientific mode:** square root, square, powers, sin, cos, tan, log, ln, pi, parentheses, and DEG/RAD controls within the same calculator.
- **Expression editing:** edit values at the caret, including after calculating; Enter or `=` recalculates. Continue results with an operator, or start fresh with a number.
- **Keyboard and keypad:** numeric/arithmetic input, Enter/`=`, Escape to clear, Backspace, and caret movement.
- **Unit converter:** Length, Area, Mass, Volume, Temperature, Speed, Time, Energy, Force, Power, Pressure, Fuel Efficiency, and Data Size. Includes From/To selection, swapping, and category-specific reference conversions. Power includes W, kW, MW, GW, and mechanical horsepower; kWh belongs to Energy. Pressure includes standard atm and conventional mmHg.
- **Currency converter:** USD, EUR, GBP, PKR, INR, JPY, CAD, AUD, and AED using a fixed demonstration dataset. Includes symbols in the main result, currency codes in supporting text, distinct From/To selections, swapping, and reference rates.
- **Recent calculations:** the six latest successful calculations in the current session, with empty state and clear action.
- **Validation and presentation:** clear errors for division by zero, invalid mathematical domains, and numerical overflow; readable scientific notation for large or small results.

## Not implemented / planned

- **Mortgage / House Loan Calculator (S8):** payment, repayment, and interest estimates are not implemented.
- **Car Finance Calculator (S9):** financed amount, monthly payment, and financing-cost estimates are not implemented.

The Loan / EMI navigation entry is locked, disabled, and labelled **Coming soon**. Seven stories are implemented; these two remain planned.

## Technology stack

Versions below distinguish the declared ranges in `package.json` from the resolved versions in `pnpm-lock.yaml`.

| Package | Declared version | Locked version |
| --- | --- | --- |
| `react` | `^19.2.0` | `19.3.0` |
| `react-dom` | `^19.2.0` | `19.3.0` |
| `typescript` | `~5.9.3` | `5.9.3` |
| `vite` | `^7.1.9` | `7.3.7` |
| `@vitejs/plugin-react` | `^5.0.4` | `5.2.0` |

The UI uses React, plain CSS, system-font fallbacks, and local SVG branding. Calculation/conversion logic lives in `src/lib/`. Tests use Node.js's built-in runner with TypeScript stripping, without a separate test framework.

## Prerequisites and installation

Use **Node.js 22.13+** (**24.x recommended**), with npm on your PATH. This satisfies pnpm `11.25.0` and the project's build/test requirements. Use a modern browser; Chrome was used for final manual compatibility review.

1. Extract or clone the submission and open a terminal in the project root, where `package.json` is located.
2. Verify Node.js and npm, then install the package-manager version used for the submission:

   ```sh
   node --version
   npm --version
   npm install --global pnpm@11.25.0
   pnpm --version
   ```

3. Install the dependencies from the supplied lockfile:

   ```sh
   pnpm install --frozen-lockfile
   ```

Internet access is needed to download dependencies. No environment file, API key, database, or service setup is needed. `pnpm-workspace.yaml` permits esbuild's required installation script.

## Run, test, and build

Run each command from the project root.

| Task | Exact command | Result |
| --- | --- | --- |
| Start locally | `pnpm run dev` | Vite development server at `http://127.0.0.1:5173/` by default |
| Run automated tests | `pnpm run test` | Runs `node --experimental-strip-types --test tests/logic.test.ts` |
| Production build | `pnpm run build` | Runs `tsc -b && vite build`; emits static files into `dist/` |
| Preview the build | `pnpm run preview` | Serves the built `dist/` locally, normally at `http://127.0.0.1:4173/` |

If a default port is occupied, use the URL printed by Vite. Stop a local server with Ctrl+C. Run the build before previewing it. To deploy, publish the entire `dist/` directory to a static web host; Node.js is a development/build prerequisite, not a runtime requirement for the deployed app.

The **16 automated tests** cover calculations, editing, limits, formatting, conversions, references, and validation. Final regression recorded **16 passed, 0 failed, 0 skipped**; TypeScript validation and production build passed. These logic tests complement manual functional testing and do not exhaustively verify browser behavior or numerical precision.

## AI tooling and manual changes

- **AI coding tool:** OpenAI Codex desktop app.
- **Recorded model:** GPT-6.1 Sol (Medium).
- **Workflow:** iterative implementation and refinements through Codex, guided by G.Sarwar's requirements, visual review, and manual testing.
- **Code changed by hand:** none outside Codex, as confirmed by G.Sarwar. Requirements, review, and manual functional testing were human contributions.

## Assumptions and known limitations

- **Currency rates are fixed reference/demo values, not live market data.** There is no exchange-rate API or automatic rate refresh. Results are illustrative equivalents, not bank quotations or financial advice. Main currency amounts are formatted to two decimal places, except JPY to zero; supporting text retains more digits.
- **Data Size uses decimal units consistently:** 1 KB = 1000 bytes, 1 MB = 1000 KB, 1 GB = 1000 MB, and 1 TB = 1000 GB. Binary KiB/MiB/GiB units are not offered.
- **History is session-only:** it is held in React memory and is lost on page reload or when the app is closed. There are no user accounts, persistent storage, or cross-device synchronization.
- **Numerical precision is bounded:** calculations use JavaScript floating-point numbers, not arbitrary-precision arithmetic. Manually entered calculator operands are limited to 16 significant digits; expressions to 180 characters; converter inputs to 40 characters. Standard result formatting uses up to 12 significant digits, while subsequent calculations retain the underlying numeric result.
- **Mathematical rules:** `%` divides a value by 100; for example, `200 × 15% = 30`, while `50 + 10% = 50.1`. Scientific calculations use real numbers; invalid domains and unsupported ranges produce messages. Temperature cannot be below absolute zero, fuel efficiency must be positive, and currency amounts cannot be negative.
- Calcify is intended for general-purpose and reference use, not as a substitute for specialist financial, engineering, scientific, or regulated professional software. Loan calculators remain unimplemented.

## Responsible use

Users must follow school, examination, workplace, and other applicable rules governing calculators or external tools. Do not use Calcify during examinations, assessments, or restricted activities where these tools are prohibited.

## Product documentation

- [App Roles](docs/app-roles.md): finalized roles R1 and R2.
- [Jobs To Be Done](docs/jobs-to-be-done.md): jobs J1–J6 and role relationships.
- [User Stories and Acceptance Criteria](docs/user-stories.md): stories S1–S9, implementation status, and all approved acceptance criteria.

These documents mirror the approved Calcify Master Product Requirements Document v1.0.

Designed & developed by **G.Sarwar**.
