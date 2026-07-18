---
trigger: glob
pattern: "**/pricing/**/*.ts, **/config/**/*.ts, app/api/**/*.ts"
---

# Money and Billing Rules

- **Currency:** You must exclusively use Nigerian Naira (NGN).
- **No Decimals:** You must store all monetary values as whole integers. Do not use floats, decimals, or "kobo" representations.
- **Value Bounds:** You must enforce a minimum price of 1 and a maximum price of 999,999,999 for all listings.
- **Display Formatting:** You must format currency on the frontend using commas and the ₦ symbol (e.g., `₦4,500,000`).
- **No Transactions:** You must not write any code that initiates online payments, connects to payment gateways (like Paystack or Flutterwave), or handles credit card data.
