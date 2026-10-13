# App Roles

Calcify has two primary user roles. The distinction is based on genuinely different needs rather than on individual screens or features.

## R1 — Everyday User

An Everyday User is a person who needs quick calculations or conversions during normal daily activities such as budgeting, shopping, travel, cooking, work, or general decision-making. Can perform basic arithmetic, convert common units, convert supported currencies using clearly identified fixed reference rates, and review recent calculations from the current session. Must never be shown a silent incorrect result, a crash, or information that misleadingly presents fixed currency rates as live market data.

## R2 — Student / Technical User

A Student / Technical User is a student, learner, engineer, analyst, or other technically oriented person who needs more advanced mathematical calculations for study, problem-solving, or technical work. Can use scientific functions, switch between degree and radian modes, work with parentheses and powers, and edit an existing expression before recalculating. Must never receive an unsupported mathematical result without a clear error message.

## Role design decision

Separate roles were not created for “calculator user,” “currency user,” “unit converter user,” or “loan user” because those labels describe features rather than meaningfully different people. Loan capabilities remain future stories under the Everyday User role.
