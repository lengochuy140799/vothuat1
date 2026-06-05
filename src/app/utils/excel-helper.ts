import { Student, Registration, ExamSession } from '../../types';
import * as XLSX from 'xlsx';

export class ExcelExporter {

  public static exportStudentsToExcel(students: Student[]) {
    const headers = ['STT', 'Mã Võ Sinh', 'Họ Và Tên', 'Giới Tính', 'Ngày Sinh', 'Số Điện Thoại Phụ Huynh', 'Cấp Đai Hiện Tại', 'Ngày Đăng Ký Hệ Thống'];
    const rows = students.map((student, index) => [
      index + 1,
      student.id,
      student.name,
      student.gender,
      student.birth,
      student.phone,
      student.currentBelt,
      student.registrationDate
    ]);

    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Auto-fit column widths
    const colWidths = headers.map((_, i) => ({
      wch: Math.max(...worksheetData.map(row => row[i] ? row[i].toString().length + 3 : 10))
    }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Học Viên');

    XLSX.writeFile(workbook, 'Danh_Sach_Vo_Sinh_Vo_Duong.xlsx');
  }

  public static exportExamRegistrationsToExcel(
    registrations: Registration[],
    students: Student[],
    sessionName: string
  ) {
    const headers = ['STT', 'Mã Võ Sinh', 'Họ Và Tên', 'Giới Tính', 'Cấp Đai Hiện Tại', 'Đai Đăng Ký Thi', 'Lệ Phí Thi (VNĐ)', 'Trạng Thái Đóng Lệ Phí', 'Ghi Chú'];
    
    const rows = registrations.map((reg, index) => {
      const student = students.find(s => s.id === reg.studentId);
      return [
        index + 1,
        reg.studentId,
        student ? student.name : 'Võ sinh đã xóa',
        student ? student.gender : '-',
        reg.currentBelt,
        reg.targetBelt,
        reg.examFee,
        reg.paymentStatus === 'PAID' ? 'Đã đóng phí' : 'Chưa đóng phí',
        reg.notes || ''
      ];
    });

    const metaInfo = [
      ['Kỳ thi thăng cấp đai:', sessionName],
      ['Tổng số thí sinh:', registrations.length],
      []
    ];

    const worksheetData = [...metaInfo, headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    const colWidths = headers.map((_, i) => ({
      wch: Math.max(...worksheetData.map(row => row[i] ? row[i].toString().length + 3 : 10))
    }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    const sheetTitle = sessionName.substring(0, 31).replace(/[\\\/\?\*\[\]]/g, '');
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetTitle || 'Danh Sách Dự Thi');

    const formattedFileName = `Danh_Sach_Du_Thi_${sessionName.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(workbook, formattedFileName);
  }

  public static exportComprehensiveReport(
    sessions: ExamSession[],
    registrations: Registration[],
    students: Student[]
  ) {
    const workbook = XLSX.utils.book_new();

    // 1. Overview sheet
    const overviewHeaders = ['STT', 'Mã Kỳ Thi', 'Tên Kỳ Thi', 'Ngày Thi', 'Địa Điểm', 'Trạng Thái', 'Số Thí Sinh', 'Doanh Thu Quỹ Thi (VNĐ)'];
    const overviewRows = sessions.map((session, index) => {
      const sessionRegs = registrations.filter(r => r.examSessionId === session.id);
      const totalFee = sessionRegs.reduce((sum, r) => sum + (r.paymentStatus === 'PAID' ? r.examFee : 0), 0);
      return [
        index + 1,
        session.id,
        session.name,
        session.date,
        session.location,
        session.status === 'OPEN' ? 'Đang mở' : 'Đã khóa',
        sessionRegs.length,
        totalFee
      ];
    });

    const overviewSheetData = [
      ['BÁO CÁO TỔNG HỢP HỆ THỐNG KỲ THI NÂNG ĐAI MABU DOJO'],
      [`Thời gian xuất báo cáo: ${new Date().toLocaleString('vi-VN')}`],
      [],
      overviewHeaders,
      ...overviewRows
    ];
    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewSheetData);
    overviewSheet['!cols'] = overviewHeaders.map((_, i) => ({ wch: 18 }));
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Tổng_Quan');

    // 2. Add detailed sheet for each exam session
    sessions.forEach(session => {
      const sessionRegs = registrations.filter(r => r.examSessionId === session.id);
      
      const sessionHeaders = ['STT', 'Mã Võ Sinh', 'Họ Và Tên', 'Giới Tính', 'Cấp Đai Hiện Tại', 'Đai Dự Thi', 'Lệ Phí Thi (VNĐ)', 'Trạng Thái', 'Ghi Chú'];
      const sessionRows = sessionRegs.map((reg, index) => {
        const student = students.find(s => s.id === reg.studentId);
        return [
          index + 1,
          reg.studentId,
          student ? student.name : 'Võ sinh đã xóa',
          student ? student.gender : '-',
          reg.currentBelt,
          reg.targetBelt,
          reg.examFee,
          reg.paymentStatus === 'PAID' ? 'Đã đóng phí' : 'Chưa đóng phí',
          reg.notes || ''
        ];
      });

      const sessionMeta = [
        ['Tên kỳ thi:', session.name],
        ['Mã kỳ thi:', session.id],
        ['Địa điểm:', session.location],
        ['Ngày thi:', session.date],
        ['Trạng thái:', session.status === 'OPEN' ? 'Đang mở' : 'Đã khép lại'],
        ['Tổng số thí sinh:', sessionRegs.length],
        []
      ];

      const sheetData = [...sessionMeta, sessionHeaders, ...sessionRows];
      const sheet = XLSX.utils.aoa_to_sheet(sheetData);
      sheet['!cols'] = sessionHeaders.map((_, i) => ({ wch: 15 }));
      
      const safeSheetName = session.name.substring(0, 30).replace(/[\\\/\?\*\[\]]/g, '');
      XLSX.utils.book_append_sheet(workbook, sheet, safeSheetName || `Ki_Thi_${session.id}`);
    });

    XLSX.writeFile(workbook, 'Bao_Cao_Tong_Hop_Mabu_System.xlsx');
  }

  public static async parseStudentsExcelFile(file: File): Promise<Partial<Student>[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          const aoa: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          if (aoa.length < 2) {
            resolve([]);
            return;
          }

          const imported: Partial<Student>[] = [];
          for (let i = 1; i < aoa.length; i++) {
            const row = aoa[i];
            if (!row || row.length === 0) continue;

            const name = row[2] || row[0] || '';
            if (!name || String(name).trim() === 'Họ Và Tên') continue; // Skip header replica

            const id = row[1] ? String(row[1]).trim() : `VS-NEW-${Math.floor(Math.random() * 900) + 100}`;
            const gender = (row[3] === 'Nữ' || row[3] === 'nữ' ? 'Nữ' : 'Nam') as 'Nam' | 'Nữ';
            
            let birth = '2012-01-01';
            if (row[4]) {
              if (typeof row[4] === 'number') {
                birth = this.formatExcelDate(row[4]);
              } else {
                birth = String(row[4]).trim();
              }
            }

            const phone = row[5] ? String(row[5]).trim() : '0901234567';
            
            let currentBelt: 'Trắng' | 'Vàng' | 'Xanh' | 'Đỏ' | 'Đen' = 'Trắng';
            const rawBelt = row[6] ? String(row[6]).trim() : '';
            if (rawBelt.includes('Vàng')) currentBelt = 'Vàng';
            else if (rawBelt.includes('Xanh')) currentBelt = 'Xanh';
            else if (rawBelt.includes('Đỏ')) currentBelt = 'Đỏ';
            else if (rawBelt.includes('Đen')) currentBelt = 'Đen';

            let regDate = new Date().toISOString().split('T')[0];
            if (row[7]) {
              if (typeof row[7] === 'number') {
                regDate = this.formatExcelDate(row[7]);
              } else {
                regDate = String(row[7]).trim();
              }
            }

            imported.push({
              id,
              name,
              gender,
              birth,
              phone,
              currentBelt,
              registrationDate: regDate
            });
          }
          resolve(imported);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }

  public static parseStudentsClipboardText(text: string): Partial<Student>[] {
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return [];

    const imported: Partial<Student>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const delimiter = line.includes('\t') ? '\t' : ',';
      
      const columns = line.split(delimiter).map(col => {
        let val = col.trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1).replace(/""/g, '"');
        }
        return val;
      });

      if (columns.length >= 2) {
        if (columns[0] === 'STT' || columns[2] === 'Họ Và Tên') continue; // Skip header

        const id = columns[1] || `VS-NEW-${Math.floor(Math.random() * 900) + 100}`;
        const name = columns[2] || columns[0] || 'Chưa đặt tên';
        const gender = (columns[3] === 'Nữ' || columns[3] === 'nữ' ? 'Nữ' : 'Nam') as 'Nam' | 'Nữ';
        const birth = columns[4] || '2012-01-01';
        const phone = columns[5] || '0901234567';
        
        let currentBelt: 'Trắng' | 'Vàng' | 'Xanh' | 'Đỏ' | 'Đen' = 'Trắng';
        const rawBelt = columns[6] || '';
        if (rawBelt.includes('Vàng')) currentBelt = 'Vàng';
        else if (rawBelt.includes('Xanh')) currentBelt = 'Xanh';
        else if (rawBelt.includes('Đỏ')) currentBelt = 'Đỏ';
        else if (rawBelt.includes('Đen')) currentBelt = 'Đen';

        let regDate = columns[7] || new Date().toISOString().split('T')[0];

        imported.push({
          id,
          name,
          gender,
          birth,
          phone,
          currentBelt,
          registrationDate: regDate
        });
      }
    }
    return imported;
  }

  public static downloadSampleExcel() {
    const headers = ['STT', 'Mã Võ Sinh', 'Họ Và Tên', 'Giới Tính', 'Ngày Sinh (YYYY-MM-DD)', 'Số Điện Thoại Phụ Huynh', 'Cấp Đai Hiện Tại', 'Ngày Đăng Ký Hệ Thống (YYYY-MM-DD)'];
    const sampleRows = [
      [1, 'VS-2026-001', 'Nguyễn Quốc Bình', 'Nam', '2014-05-12', '0914115115', 'Trắng', '2026-06-05'],
      [2, 'VS-2026-002', 'Lê Quỳnh Chi', 'Nữ', '2015-08-20', '0988222333', 'Vàng', '2026-06-05']
    ];

    const worksheetData = [headers, ...sampleRows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    const colWidths = headers.map((_, i) => ({
      wch: Math.max(...worksheetData.map(row => row[i] ? row[i].toString().length + 3 : 10))
    }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mẫu_Nhập_Học_Viên');

    XLSX.writeFile(workbook, 'Mau_Nhap_Ho_So_Vo_Sinh.xlsx');
  }

  private static formatExcelDate(serial: number): string {
    const utc_days  = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;                                        
    const date_info = new Date(utc_value * 1000);
    const year = date_info.getFullYear();
    const month = String(date_info.getMonth() + 1).padStart(2, '0');
    const day = String(date_info.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

