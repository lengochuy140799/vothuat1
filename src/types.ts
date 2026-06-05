export interface Student {
  id: string;
  name: string;
  gender: 'Nam' | 'Nữ';
  birth: string;
  phone: string;
  currentBelt: 'Trắng' | 'Vàng' | 'Xanh' | 'Đỏ' | 'Đen';
  registrationDate: string;
  createdAt: string;
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
  examSessionId: string;
  currentBelt: 'Trắng' | 'Vàng' | 'Xanh' | 'Đỏ' | 'Đen';
  targetBelt: 'Trắng' | 'Vàng' | 'Xanh' | 'Đỏ' | 'Đen';
  examFee: number;
  paymentStatus: 'PAID' | 'UNPAID';
  paymentDate?: string;
  notes?: string;
  createdAt: string;
}
