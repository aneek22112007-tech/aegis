/** Questions families ask, answered in plain words. */
export const FAQ: { q: string; a: string }[] = [
  {
    q: 'Does AEGIS hold my money?',
    a: 'No. Payments run through PayPal. AEGIS only decides whether an authorization is captured or voided.',
  },
  {
    q: 'What happens if the guardian doesn’t answer?',
    a: 'A held payment stays authorized and uncaptured. Nothing is sent until someone approves it, and the authorization expires on its own if no one does.',
  },
  {
    q: 'Can Margaret still pay people she trusts?',
    a: 'Yes. Payees on her trusted list with normal amounts are captured straight away, without asking anyone.',
  },
  {
    q: 'Is this a live product?',
    a: 'AEGIS is an open-source project. The hosted sandbox runs fully in your browser with test data; the server version uses the PayPal sandbox.',
  },
  {
    q: 'How does Priya hear about a held payment?',
    a: 'Her dashboard receives held payments over a live event stream as they happen. She sees the amount, the payee, the score and the reasons, then taps Approve or Deny.',
  },
  {
    q: 'What does AEGIS look for?',
    a: 'New payees above the limit Priya set, unusually large amounts, several payments in a short time, payments during quiet hours, and wording scammers use, such as “urgent”, “gift card” or “bail”.',
  },
];
