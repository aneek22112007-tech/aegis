# Household data model

AEGIS stores one senior household in SQLite.

- **User** is Margaret (role `senior`) or Priya (role `guardian`).
- **Guardian** links Priya to Margaret and keeps the contact the mandate named (`daughter`).
- **Mandate** is a versioned copy of Margaret's own words plus the compiled policy JSON. One row is active.
- **Payee** is trusted, blocked, or left unknown. Trust lives here, not in the PayPal vault. CVS Pharmacy and City Utilities start trusted.
- **Payment** is one Orders v2 authorization. The risk score, level, and decision are stored with the PayPal order, authorization, and capture ids.
- **AuditEvent** is the Lure Log. Every create, hold, capture, void, and guardian decision writes one.
- **Report** is the FTC-style draft attached to a payment AEGIS stopped.
- **WebhookEvent** remembers a PayPal event id so a replay does not apply twice.

Historical payments for the two trusted payees are dated in 2025, so they count as history and not as today's velocity.
