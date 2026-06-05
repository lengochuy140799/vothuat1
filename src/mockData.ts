import { Student, ExamSession, Registration } from './types';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'VS-2026-001',
    name: 'Nguyễn Văn Hải',
    gender: 'Nam',
    birth: '2010-04-12',
    phone: '0912345678',
    currentBelt: 'Trắng',
    registrationDate: '2026-01-10',
    createdAt: new Date('2026-01-10T08:00:00Z').toISOString()
  },
  {
    id: 'VS-2026-002',
    name: 'Lê Minh Tuấn',
    gender: 'Nam',
    birth: '2012-08-25',
    phone: '0987654321',
    currentBelt: 'Vàng',
    registrationDate: '2026-01-15',
    createdAt: new Date('2026-01-15T09:30:00Z').toISOString()
  },
  {
    id: 'VS-2026-003',
    name: 'Trần Thị Hồng',
    gender: 'Nữ',
    birth: '2011-02-05',
    phone: '0905556667',
    currentBelt: 'Xanh',
    registrationDate: '2026-01-18',
    createdAt: new Date('2026-01-18T10:15:00Z').toISOString()
  },
  {
    id: 'VS-2026-004',
    name: 'Phạm Quốc Bảo',
    gender: 'Nam',
    birth: '2009-11-30',
    phone: '0934112233',
    currentBelt: 'Đỏ',
    registrationDate: '2026-01-20',
    createdAt: new Date('2026-01-20T14:20:00Z').toISOString()
  },
  {
    id: 'VS-2026-005',
    name: 'Hoàng Gia Huy',
    gender: 'Nam',
    birth: '2013-05-14',
    phone: '0977224466',
    currentBelt: 'Trắng',
    registrationDate: '2026-01-22',
    createdAt: new Date('2026-01-22T16:40:00Z').toISOString()
  },
  {
    id: 'VS-2026-006',
    name: 'Vũ Phương Linh',
    gender: 'Nữ',
    birth: '2011-09-08',
    phone: '0911889900',
    currentBelt: 'Trắng',
    registrationDate: '2026-01-25',
    createdAt: new Date('2026-01-25T11:10:00Z').toISOString()
  },
  {
    id: 'VS-2026-007',
    name: 'Đặng Tiến Dũng',
    gender: 'Nam',
    birth: '2008-01-15',
    phone: '0944005511',
    currentBelt: 'Vàng',
    registrationDate: '2026-01-28',
    createdAt: new Date('2026-01-28T09:00:00Z').toISOString()
  },
  {
    id: 'VS-2026-008',
    name: 'Bùi Minh Tâm',
    gender: 'Nam',
    birth: '2014-06-19',
    phone: '0966334455',
    currentBelt: 'Xanh',
    registrationDate: '2026-02-02',
    createdAt: new Date('2026-02-02T15:30:00Z').toISOString()
  },
  {
    id: 'VS-2026-009',
    name: 'Phan Thanh Trúc',
    gender: 'Nữ',
    birth: '2012-10-10',
    phone: '0988112244',
    currentBelt: 'Đỏ',
    registrationDate: '2026-02-05',
    createdAt: new Date('2026-02-05T10:00:00Z').toISOString()
  },
  {
    id: 'VS-2026-010',
    name: 'Nguyễn Hữu Đạt',
    gender: 'Nam',
    birth: '2010-12-01',
    phone: '0909556644',
    currentBelt: 'Đen',
    registrationDate: '2026-02-12',
    createdAt: new Date('2026-02-12T14:45:00Z').toISOString()
  }
];

export const INITIAL_EXAMS: ExamSession[] = [
  {
    id: 'EX-2026-Q1',
    name: 'Kỳ thi thăng cấp đai Quý I/2026',
    date: '2026-03-15',
    location: 'Nhà thi đấu trung tâm CLB',
    status: 'CLOSED',
    createdAt: new Date('2026-02-15T08:00:00Z').toISOString()
  },
  {
    id: 'EX-2026-Q2',
    name: 'Kỳ thi thăng cấp đai Quý II/2026',
    date: '2026-06-20',
    location: 'Võ đường tổ hợp cơ sở 1',
    status: 'OPEN',
    createdAt: new Date('2026-05-10T08:00:00Z').toISOString()
  },
  {
    id: 'EX-2026-YNT',
    name: 'Kỳ thi tuyển chọn Vận động viên năng khiếu trẻ',
    date: '2026-08-10',
    location: 'Sân vận động Trung tâm Võ thuật',
    status: 'OPEN',
    createdAt: new Date('2026-05-25T08:00:00Z').toISOString()
  }
];

export const INITIAL_REGISTRATIONS: Registration[] = [
  // Exam Q1 registrations (all completed and paid)
  {
    id: 'REG-001',
    studentId: 'VS-2026-001',
    examSessionId: 'EX-2026-Q1',
    currentBelt: 'Trắng',
    targetBelt: 'Vàng',
    examFee: 200000,
    paymentStatus: 'PAID',
    paymentDate: '2026-03-01',
    notes: 'Hoàn tất trực tiếp tại võ đường',
    createdAt: new Date('2026-02-28T09:00:00Z').toISOString()
  },
  {
    id: 'REG-002',
    studentId: 'VS-2026-002',
    examSessionId: 'EX-2026-Q1',
    currentBelt: 'Vàng',
    targetBelt: 'Xanh',
    examFee: 300000,
    paymentStatus: 'PAID',
    paymentDate: '2026-03-02',
    notes: 'Chuyển khoản qua ngân hàng',
    createdAt: new Date('2026-03-01T10:15:00Z').toISOString()
  },
  {
    id: 'REG-003',
    studentId: 'VS-2026-003',
    examSessionId: 'EX-2026-Q1',
    currentBelt: 'Xanh',
    targetBelt: 'Đỏ',
    examFee: 400000,
    paymentStatus: 'PAID',
    paymentDate: '2026-03-05',
    notes: 'Chuyển khoản',
    createdAt: new Date('2026-03-02T11:30:00Z').toISOString()
  },

  // Exam Q2 registrations
  {
    id: 'REG-004',
    studentId: 'VS-2026-001', // now yellow, registering for green
    examSessionId: 'EX-2026-Q2',
    currentBelt: 'Vàng',
    targetBelt: 'Xanh',
    examFee: 300000,
    paymentStatus: 'UNPAID',
    notes: 'Hẹn nộp tuần sau',
    createdAt: new Date('2026-05-15T09:00:00Z').toISOString()
  },
  {
    id: 'REG-005',
    studentId: 'VS-2026-002', // now green, registering for red
    examSessionId: 'EX-2026-Q2',
    currentBelt: 'Xanh',
    targetBelt: 'Đỏ',
    examFee: 400000,
    paymentStatus: 'PAID',
    paymentDate: '2026-05-18',
    notes: 'Đã nhận online',
    createdAt: new Date('2026-05-16T14:30:00Z').toISOString()
  },
  {
    id: 'REG-003-Q2',
    studentId: 'VS-2026-003', // now red, registering for black
    examSessionId: 'EX-2026-Q2',
    currentBelt: 'Đỏ',
    targetBelt: 'Đen',
    examFee: 500000,
    paymentStatus: 'PAID',
    paymentDate: '2026-05-20',
    notes: 'Đóng trực tiếp',
    createdAt: new Date('2026-05-15T15:20:00Z').toISOString()
  },
  {
    id: 'REG-006',
    studentId: 'VS-2026-004',
    examSessionId: 'EX-2026-Q2',
    currentBelt: 'Đỏ',
    targetBelt: 'Đen',
    examFee: 500000,
    paymentStatus: 'UNPAID',
    notes: 'Nộp muộn',
    createdAt: new Date('2026-05-20T10:45:00Z').toISOString()
  },
  {
    id: 'REG-007',
    studentId: 'VS-2026-005',
    examSessionId: 'EX-2026-Q2',
    currentBelt: 'Trắng',
    targetBelt: 'Vàng',
    examFee: 200000,
    paymentStatus: 'PAID',
    paymentDate: '2026-05-22',
    notes: 'Đóng tiền mặt',
    createdAt: new Date('2026-05-21T11:00:00Z').toISOString()
  }
];

// Belt Fee helper based on target belt level
export function getExamFeeForBelt(targetBelt: 'Trắng' | 'Vàng' | 'Xanh' | 'Đỏ' | 'Đen'): number {
  switch (targetBelt) {
    case 'Vàng': return 200000;
    case 'Xanh': return 300000;
    case 'Đỏ': return 400000;
    case 'Đen': return 500000;
    default: return 200000;
  }
}

// Next belt tier helper
export function getNextBelt(currentBelt: 'Trắng' | 'Vàng' | 'Xanh' | 'Đỏ' | 'Đen'): 'Trắng' | 'Vàng' | 'Xanh' | 'Đỏ' | 'Đen' {
  switch (currentBelt) {
    case 'Trắng': return 'Vàng';
    case 'Vàng': return 'Xanh';
    case 'Xanh': return 'Đỏ';
    case 'Đỏ': return 'Đen';
    case 'Đen': return 'Đen'; // Already max
  }
}
