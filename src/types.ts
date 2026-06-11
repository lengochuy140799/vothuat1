export type BeltType = 'Đen Xanh' | 'Xanh 1' | 'Xanh 2' | 'Xanh 3' | 'Đỏ' | 'Đỏ 1' | 'Đỏ 2' | 'Đỏ 3' | 'Vàng' | 'Vàng 1' | 'Vàng 2' | 'Vàng 3' | 'Vàng 4' | 'Trắng' | 'Xanh' | 'Đen';

export interface Student {
  id: string;
  name: string;
  gender: 'Nam' | 'Nữ';
  birth: string;
  phone: string;
  currentBelt: BeltType;
  registrationDate: string;
  createdAt: string;
  address?: string;
}

export interface ExamSession {
  id: string;
  name: string;
  date: string;
  location: string;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
}

export interface Registration {
  id: string;
  studentId: string;
  examSessionId?: string | null;
  month?: string;
  currentBelt: BeltType;
  targetBelt: BeltType;
  examFee: number;
  paymentStatus: 'PAID' | 'UNPAID';
  paymentDate?: string;
  notes?: string;
  createdAt: string;
}
