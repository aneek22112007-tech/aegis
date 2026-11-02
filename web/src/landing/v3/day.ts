/** Margaret's day, told as the events AEGIS records. Times are local to Margaret. */
export type DayTone = 'ok' | 'warn' | 'stop' | 'info';

export interface DayEvent {
  id: string;
  time: string;
  title: string;
  detail: string;
  tone: DayTone;
  /** Short line shown on the phone preview for this step. */
  notice: string;
}

export const MARGARETS_DAY: DayEvent[] = [
  {
    id: 'pharmacy',
    time: '9:12 AM',
    title: 'Pays the pharmacy',
    detail: 'CVS Pharmacy is on her trusted list and $48 is a normal amount, so it goes straight through.',
    tone: 'ok',
    notice: 'Paid CVS Pharmacy $48.00',
  },
  {
    id: 'call',
    time: '2:40 PM',
    title: 'A call from “Officer James”',
    detail: 'A caller says her bank account is under investigation and she must move money today to keep it safe.',
    tone: 'warn',
    notice: 'Incoming call · Unknown number',
  },
  {
    id: 'attempt',
    time: '2:47 PM',
    title: 'Tries to send $1,900',
    detail: 'The $1,900 goes to a new payee with urgent wording in the note. AEGIS authorizes the payment but does not capture it.',
    tone: 'stop',
    notice: 'Waiting for Priya to check this payment',
  },
  {
    id: 'priya',
    time: '2:48 PM',
    title: 'Priya is asked',
    detail: 'Her daughter gets the payment, the score and the reasons on her phone within seconds.',
    tone: 'info',
    notice: 'Priya has been asked',
  },
  {
    id: 'void',
    time: '2:53 PM',
    title: 'The payment is voided',
    detail: 'Priya calls her mother, recognises the scam and taps Deny. The authorization is voided and no money leaves.',
    tone: 'ok',
    notice: 'Payment stopped. Your money is safe.',
  },
];
