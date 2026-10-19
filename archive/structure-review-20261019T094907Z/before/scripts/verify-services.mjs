import assert from "node:assert/strict";
const base = process.env.E2E_BASE_URL || "http://127.0.0.1:3001";
const login = await fetch(`${base}/api/auth/demo`, {
  method: "POST",
  headers: { Origin: base, "Content-Type": "application/json" },
  body: "{}",
});
assert.equal(login.status, 200);
const cookie = login.headers.get("set-cookie").split(";")[0];
const data = await (
  await fetch(`${base}/api/data`, { headers: { Cookie: cookie } })
).json();
const response = await fetch(`${base}/api/analytics`, {
  headers: { Cookie: cookie },
});
assert.equal(response.status, 200);
const python = await response.json();
assert.equal(python.income, data.summary.income);
assert.equal(python.expenses, data.summary.expenses);
assert.equal(python.savings, data.summary.savings);
assert.equal(python.count, data.summary.count);
const unauthorized = await fetch("http://127.0.0.1:8000/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ month: python.month, transactions: [] }),
});
assert.equal(unauthorized.status, 401);
console.log(
  JSON.stringify({
    event: "production_python_integration_passed",
    month: python.month,
    income: python.income,
    expenses: python.expenses,
    savings: python.savings,
    count: python.count,
    unauthorizedServiceStatus: unauthorized.status,
  }),
);
