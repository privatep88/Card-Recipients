export interface ActiveCardRow {
  id: number;
  cardType: string;
  cardNumber: string;
  cardCode: string;
  attachment: File | null;
  notes: string;
}

export interface RecipientRow {
  id: number;
  recipientName: string;
  department: string;
  receiptDate: string;
  cardType: string;
  cardNumber: string;
  cardCode: string;
  duration: string;
  attachment: File | null;
  notes: string;
}