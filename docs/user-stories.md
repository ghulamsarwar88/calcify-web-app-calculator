# User Stories with Acceptance Criteria

Every story identifies the job it serves, states its current implementation status, and uses observable acceptance criteria. Implemented stories reflect behavior that exists in the current Calcify build; future capabilities are explicitly marked Not implemented.

| Story | Serves | Status | Capability |
| --- | --- | --- | --- |
| S1 | J1 | Implemented | Basic arithmetic |
| S2 | J1 | Implemented | Continue calculations and keyboard input |
| S3 | J2 | Implemented | Unit conversion |
| S4 | J2 | Implemented | Currency conversion using fixed reference rates |
| S5 | J3 | Implemented | Recent calculations |
| S6 | J4 | Implemented | Scientific calculations |
| S7 | J5 | Implemented | Editable expressions |
| S8 | J6 | Not implemented | Mortgage / House Loan Calculator |
| S9 | J6 | Not implemented | Car Finance Calculator |

## S1 — Basic arithmetic

Serves: J1   |   Status: Implemented

### User story

As an Everyday User, I want to perform common arithmetic calculations, so that I can get a reliable numerical answer quickly.

### Acceptance Criteria

1. Given Basic mode is open, when I enter 25 + 17 and calculate, then the result is 42.
2. Given an expression contains multiple arithmetic operators, when I calculate 2 + 3 × 4, then normal mathematical precedence is applied and the result is 14.
3. Given I enter 10 ÷ 0, when I calculate, then a clear division-by-zero message is shown and the application does not crash or display a stale result.
4. Given I enter conflicting operators such as 5 + × 2, when the second operator is entered, then the latest operator replaces the previous one and the expression can evaluate as 5 × 2 = 10.
5. Given I manually enter a number beyond the supported input length, when the limit is reached, then additional digits are prevented without breaking the display.
6. Given a valid result is extremely large or small, when it cannot be displayed normally, then it is represented using readable scientific notation.

## S2 — Continue calculations and keyboard input

Serves: J1   |   Status: Implemented

### User story

As an Everyday User, I want to continue from an existing result and use familiar keyboard controls, so that I can complete calculations efficiently.

### Acceptance Criteria

1. Given I calculate 5 + 5 = 10, when I continue with × 3, then the result is 30.
2. Given a result is currently displayed, when I switch between Basic and Scientific modes, then the current value remains available rather than being unnecessarily cleared.
3. Given I am using a desktop keyboard, when I use supported number keys, arithmetic operators, Enter, Backspace, or other supported shortcuts, then they perform the corresponding calculator actions.
4. Given an error has been displayed, when I begin a valid new calculation, then I can continue using the calculator without needing to reload the application.

## S3 — Unit conversion

Serves: J2   |   Status: Implemented

### User story

As an Everyday User, I want to convert values between common units, so that I can understand measurements in a form familiar to me.

### Acceptance Criteria

1. Given I select a category, From unit and To unit and provide a value, when the conversion is evaluated, then the corresponding converted value is displayed.
2. Given I convert 1 mile to kilometres, then the result is 1.609344 km.
3. Given I convert -40 °C to °F, then the result is exactly -40 °F.
4. Given I select Power, then Watts and Kilowatts are available as power units.
5. Given I select Pressure, then Atmosphere and mmHg are available.
6. Given I convert 1 GB to MB, then Calcify applies its documented decimal convention and returns 1000 MB.
7. Given From and To units are selected, when I use Swap, then their direction is reversed correctly.

## S4 — Currency conversion using fixed reference rates

Serves: J2   |   Status: Implemented

### User story

As an Everyday User, I want to convert between supported currencies using clearly identified reference rates, so that I can understand an approximate equivalent amount.

### Acceptance Criteria

1. Given I convert 1 USD to EUR using the built-in reference dataset, then the result matches the fixed rate and the main result uses the appropriate currency symbol, such as €0.92.
2. Given the Currency Converter is open, then the interface clearly communicates that its rates are static reference values rather than live market rates.
3. Given I swap two currencies, when I convert in the opposite direction, then the result remains mathematically consistent with the same fixed dataset.
4. Given one currency is selected as From, when I choose the To currency, then the same currency cannot be selected for both sides.
5. Given I enter 0, when I convert, then the result is 0 rather than an error, NaN, or Infinity.
6. Given I enter a negative currency amount, when the value is validated, then a clear validation message is displayed rather than treating it as a normal conversion.

## S5 — Recent calculations

Serves: J3   |   Status: Implemented

### User story

As an Everyday User, I want to see my recent calculations from the current session, so that I can refer back to work I have just completed.

### Acceptance Criteria

1. Given I complete calculations during the current session, when I view Recent calculations, then recent entries are displayed.
2. Given no calculations have yet been completed, when I view the recent-calculations area, then an appropriate empty state is shown rather than an error.
3. Given Calcify does not require an account or backend, then the interface must not imply that calculation history is permanently stored or synchronized to a user account.

## S6 — Scientific calculations

Serves: J4   |   Status: Implemented

### User story

As a Student / Technical User, I want to evaluate scientific expressions and choose the appropriate angle mode, so that I can solve mathematical and technical problems accurately.

### Acceptance Criteria

1. Given Scientific mode is active and DEG is selected, when I evaluate sin(90), then the result is 1.
2. Given RAD is selected, when I evaluate sin(π/2), then the result is 1.
3. Given DEG is selected, when I evaluate tan(90), then Calcify shows an appropriate undefined-result message rather than a misleading numeric result.
4. Given I evaluate √(-9), then a clear domain error is displayed and the expression uses the mathematical √ notation.
5. Given I evaluate log(0), then a clear logarithm-domain validation message is shown.
6. Given I calculate (2 + 3) × (4 - 1), then parentheses are respected and the result is 15.
7. Given I calculate a result outside the supported numerical range, then Calcify displays a clear supported-range error rather than Infinity or an incorrect value.

## S7 — Editable expressions

Serves: J5   |   Status: Implemented

### User story

As a Student / Technical User, I want to edit part of an existing expression, so that I can correct or refine a calculation without entering the entire expression again.

### Acceptance Criteria

1. Given I calculate 76 × 94 = 7144, when I change only 76 to 77 and recalculate, then the visible expression remains 77 × 94 and the result is 7238.
2. Given an expression contains parentheses, when I click inside the expression or use the left/right arrow keys, then I can position the caret and edit a value in the middle.
3. Given I change (2 + 3) × (4 - 1) to (2 + 3) × (5 - 1), when I recalculate, then the result is 20.
4. Given I edit one operand after a result has been produced, then Calcify must not silently alter another operand in the expression.

## S8 — Mortgage / House Loan Calculator

Serves: J6   |   Status: Not implemented

### User story

As an Everyday User, I want to estimate the monthly payment and overall cost of a home loan or mortgage, so that I can judge whether the borrowing commitment may fit my budget.

### Current-release acceptance criteria

1. Given I view the Calcify navigation, then the loan-related area is clearly marked Coming Soon and must not appear to be a functioning mortgage calculator.
2. Given the mortgage calculator has not yet been implemented, when I access the future loan area, then no misleading payment estimate or partially functioning calculator is presented.

### Criteria required before this story can be marked Implemented

1. Given I enter a loan amount, annual interest rate and loan term, when all values are valid, then Calcify should calculate the estimated monthly mortgage payment.
2. Given a mortgage calculation is completed, then the user should be shown the principal amount, estimated monthly payment, total repayment amount and estimated total interest.
3. Given I enter an invalid value such as a negative loan amount, negative interest rate, zero term or missing required field, then a clear validation message should be shown and no misleading result should be calculated.
4. Given I change one of the financing inputs, when the calculation is updated, then the repayment estimate should update consistently.

## S9 — Car Finance Calculator

Serves: J6   |   Status: Not implemented

### User story

As an Everyday User, I want to estimate the monthly payment and total cost of financing a vehicle, so that I can understand whether the financing arrangement may fit my budget.

### Current-release acceptance criteria

1. Given I view the current Calcify application, then a functioning car-finance calculator is not presented as an available feature.
2. Given car finance is a planned capability, then the product documentation must clearly mark it as Not implemented rather than suggesting that it is already available.

### Criteria required before this story can be marked Implemented

1. Given I enter the vehicle price, down payment, annual interest rate and finance term, when the values are valid, then Calcify should calculate the estimated financed amount and monthly payment.
2. Given a car-finance calculation is completed, then the user should be shown at minimum the amount financed, estimated monthly payment, total repayment and estimated financing cost.
3. Given the down payment exceeds the vehicle price, when I attempt to calculate, then a clear validation message should be shown and no invalid result should be produced.
4. Given I enter a negative vehicle price, negative interest rate, zero finance term or another invalid required value, then the app should reject the input with a clear message.
5. Given I change the vehicle price, down payment, interest rate or term, when the calculation is refreshed, then the financing estimate should update accordingly.
