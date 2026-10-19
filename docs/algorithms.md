# Deterministic algorithms

## Money and months

Amounts are signed integer USD cents. CSV decimal strings are split into whole/fraction digits, padded to two decimal places and assembled as integers; exponent notation, zero, excess precision and values above $1 million are rejected. No floating-point currency values are stored. BigInt computes a percentage reduction with round-half-up cent rounding: `(spending * (100 - reduction) + 50) / 100`. A 20% reduction of 64,810 cents yields 51,848 cents. Totals must remain safe integers. Floating-point conversion is restricted to presentation, chart coordinates, percentages and detection ratios.

Income sums positive amounts; expenses negate negative amounts; savings is their difference. A category is a label, while amount sign determines cash direction. Positive refunds may retain their original expense category; assigning Income to a negative amount is permitted but keeps it an expense (and should be corrected by the user). The spending chart includes every category containing negative amounts. Calendar accounting, seed dates, bill due dates and report months use UTC. The selected month is explicit in the interface.

## Comparison and explanations

The agent's `compare_months` compares the current month through today's UTC day against the same days of the previous month. Historic requested months compare their whole month with the previous month. It returns recorded spending, purchase counts, average purchase size and largest current purchases with transaction IDs. Differences are descriptive; they do not assert unobserved causes. Dashboard cumulative curves compare recorded calendar days; future days of the current month are omitted. The golden proposal uses all **recorded** current-month category spending and explicitly notes that future purchases can change the baseline.

## CSV validation

Parse RFC-style quoted CSV using Papa Parse. Headers must be `date,merchant,amount,category` in order. Dates must round-trip as valid ISO calendar dates, merchants must be nonempty, <=120 characters and control-character-free, categories must be from the allowlist, and amounts must satisfy integer conversion limits. Enforce 512 KB and 2,000 rows. Validate the entire batch before committing any rows. Duplicate identity is SHA-256 of `[date, trimmed lower-case merchant, signed cents]`, checked both against existing rows and earlier rows in the same batch. Import reruns validation inside the atomic mutation so another concurrent import cannot bypass deduplication. Spreadsheet-export merchant fields beginning with formula characters (including after whitespace) receive a leading apostrophe and CSV quoting.

## Recurring payments

Group negative transactions by trimmed, case-insensitive merchant. Require at least three observations, every consecutive gap within 25–35 days, and every amount within 15% of the upper median. Return merchant, median amount, expected next date, rule description and all supporting transaction IDs. Advance a month at a time and clamp missing month-end days. These are inferred monthly payments, not contractual schedules or certain future charges. Weekly/annual patterns and merchants with multiple billing products are not modeled.

## Unusual purchases

For each expense, collect earlier expenses with the same category (same-day purchases are excluded from the baseline). Require at least five peers. Compute the upper median and flag the expense only if it exceeds `max(3 × median, $100)`. Return amount, median, threshold, reason and transaction ID; show at most twelve largest flags. No machine-learning risk score is used. These flags describe unusual recorded spending, not fraud or illegality.

## Budgets and reminders

Budgets are unique by category/month, with a positive cent limit and alert threshold from 1–100%. Usage sums that month's negative amounts in the category. Rounded usage percentage drives near-limit/over-limit labels. Recommendations describe the actual remaining or excess amount. Reminders are explicit records, not background delivery; due and upcoming statuses are derived at render time. A same-merchant/same-date reminder is not duplicated on approval.

## Approval binding

A proposal produces a random 256-bit token. Store only its SHA-256 hash, user ID, canonical sorted-key payload hash, status and five-minute expiry. Approve or reject must match all bindings and pending status; compare token hashes with `timingSafeEqual`. A successful decision consumes the token. Reject writes only proposal status and audit/timeline records. A failed decision discards the ledger copy and records a separate denial event. Atomic version checks prevent two concurrent approvals from applying twice.
