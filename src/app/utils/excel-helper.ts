import { Student, Registration, ExamSession, BeltType } from '../../types';
import * as XLSX from 'xlsx';

export class ExcelExporter {

  public static exportStudentsToExcel(students: Student[]) {
    const headers = ['STT', 'Mã Võ Sinh', 'Họ Và Tên', 'Giới Tính', 'Ngày Sinh', 'Số Điện Thoại Phụ Huynh', 'Địa Chỉ', 'Cấp Đai Hiện Tại', 'Ngày Đăng Ký Hệ Thống'];
    const rows = students.map((student, index) => [
      index + 1,
      student.id,
      student.name,
      student.gender,
      student.birth,
      student.phone,
      student.address || '',
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
      ['BÁO CÁO TỔNG HỢP HỆ THỐNG KỲ THI NÂNG ĐAI - CLB VÕ THUẬT CỔ TRUYỀN NGUYỄN THANH VŨ'],
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

    XLSX.writeFile(workbook, 'Bao_Cao_Tong_Hop_CLB_Nguyen_Thanh_Vu.xlsx');
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

          const headers = aoa[0].map((h: any) => String(h || '').trim().toLowerCase());
          
          const getColIndex = (keywords: string[], defaultIdx: number): number => {
            const idx = headers.findIndex((h: string) => keywords.some(k => h.includes(k)));
            return idx !== -1 ? idx : defaultIdx;
          };

          const idIdx = getColIndex(['mã võ sinh', 'ma vo sinh', 'mã học viên', 'ma hoc vien'], 1);
          const nameIdx = getColIndex(['họ và tên', 'ho va ten', 'họ tên', 'ho ten', 'tên', 'ten'], 2);
          const genderIdx = getColIndex(['giới tính', 'gioi tinh'], 3);
          const birthIdx = getColIndex(['ngày sinh', 'ngay sinh'], 4);
          const phoneIdx = getColIndex(['số điện thoại', 'so dien thoai', 'sđt', 'sdt', 'phụ huynh', 'phu huynh'], 5);
          const addressIdx = getColIndex(['địa chỉ', 'dia chi'], -1);
          const beltIdx = getColIndex(['cấp đai', 'cap dai', 'đai hiện tại', 'dai hien tai', 'đai', 'dai'], 6);
          const regDateIdx = getColIndex(['đăng ký', 'dang ky', 'ngày vào', 'ngay vao'], 7);

          const imported: Partial<Student>[] = [];
          for (let i = 1; i < aoa.length; i++) {
            const row = aoa[i];
            if (!row || row.length === 0) continue;

            const name = nameIdx !== -1 && row[nameIdx] ? String(row[nameIdx]).trim() : '';
            if (!name || name === 'Họ Và Tên') continue; // Skip header replica

            const id = idIdx !== -1 && row[idIdx] ? String(row[idIdx]).trim() : `VS-NEW-${Math.floor(Math.random() * 900) + 100}`;
            const genderValue = genderIdx !== -1 && row[genderIdx] ? String(row[genderIdx]).trim() : '';
            const gender = (genderValue === 'Nữ' || genderValue === 'nữ' ? 'Nữ' : 'Nam') as 'Nam' | 'Nữ';
            
            let birth = '2012-01-01';
            if (birthIdx !== -1 && row[birthIdx]) {
              if (typeof row[birthIdx] === 'number') {
                birth = this.formatExcelDate(row[birthIdx]);
              } else {
                birth = String(row[birthIdx]).trim();
              }
            }

            const phone = phoneIdx !== -1 && row[phoneIdx] ? String(row[phoneIdx]).trim() : '0901234567';
            const address = addressIdx !== -1 && row[addressIdx] ? String(row[addressIdx]).trim() : '';

            let currentBelt: BeltType = 'Đen Xanh';
            const rawBelt = beltIdx !== -1 && row[beltIdx] ? String(row[beltIdx]).trim() : '';
            if (rawBelt) {
              const lowerRaw = rawBelt.toLowerCase();
              if (lowerRaw.includes('đen xanh')) currentBelt = 'Đen Xanh';
              else if (lowerRaw.includes('đen')) currentBelt = 'Đen';
              else if (lowerRaw.includes('xanh 1')) currentBelt = 'Xanh 1';
              else if (lowerRaw.includes('xanh 2')) currentBelt = 'Xanh 2';
              else if (lowerRaw.includes('xanh 3')) currentBelt = 'Xanh 3';
              else if (lowerRaw.includes('xanh')) currentBelt = 'Xanh';
              else if (lowerRaw.includes('đỏ 1')) currentBelt = 'Đỏ 1';
              else if (lowerRaw.includes('đỏ 2')) currentBelt = 'Đỏ 2';
              else if (lowerRaw.includes('đỏ 3')) currentBelt = 'Đỏ 3';
              else if (lowerRaw.includes('đỏ')) currentBelt = 'Đỏ';
              else if (lowerRaw.includes('vàng 1')) currentBelt = 'Vàng 1';
              else if (lowerRaw.includes('vàng 2')) currentBelt = 'Vàng 2';
              else if (lowerRaw.includes('vàng 3')) currentBelt = 'Vàng 3';
              else if (lowerRaw.includes('vàng 4')) currentBelt = 'Vàng 4';
              else if (lowerRaw.includes('vàng')) currentBelt = 'Vàng';
              else if (lowerRaw.includes('trắng')) currentBelt = 'Trắng';
            }

            let regDate = new Date().toISOString().split('T')[0];
            if (regDateIdx !== -1 && row[regDateIdx]) {
              if (typeof row[regDateIdx] === 'number') {
                regDate = this.formatExcelDate(row[regDateIdx]);
              } else {
                regDate = String(row[regDateIdx]).trim();
              }
            }

            imported.push({
              id,
              name,
              gender,
              birth,
              phone,
              address,
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

    const firstLine = lines[0].trim();
    const delimiter = firstLine.includes('\t') ? '\t' : ',';
    const headers = firstLine.split(delimiter).map(col => {
      let val = col.trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1).replace(/""/g, '"');
      }
      return val.toLowerCase();
    });

    const getColIndex = (keywords: string[], defaultIdx: number): number => {
      const idx = headers.findIndex((h: string) => keywords.some(k => h.includes(k)));
      return idx !== -1 ? idx : defaultIdx;
    };

    const idIdx = getColIndex(['mã võ sinh', 'ma vo sinh', 'mã học viên', 'ma hoc vien'], 1);
    const nameIdx = getColIndex(['họ và tên', 'ho va ten', 'họ tên', 'ho ten', 'tên', 'ten'], 2);
    const genderIdx = getColIndex(['giới tính', 'gioi tinh'], 3);
    const birthIdx = getColIndex(['ngày sinh', 'ngay sinh'], 4);
    const phoneIdx = getColIndex(['số điện thoại', 'so dien thoai', 'sđt', 'sdt', 'phụ huynh', 'phu huynh'], 5);
    const addressIdx = getColIndex(['địa chỉ', 'dia chi'], -1);
    const beltIdx = getColIndex(['cấp đai', 'cap dai', 'đai hiện tại', 'dai hien tai', 'đai', 'dai'], 6);
    const regDateIdx = getColIndex(['đăng ký', 'dang ky', 'ngày vào', 'ngay vao'], 7);

    const imported: Partial<Student>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(delimiter).map(col => {
        let val = col.trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1).replace(/""/g, '"');
        }
        return val;
      });

      if (columns.length >= 2) {
        const nameVal = nameIdx !== -1 && columns[nameIdx] ? columns[nameIdx] : '';
        if (nameVal === 'STT' || nameVal === 'Họ Và Tên') continue; // Skip header

        const id = idIdx !== -1 && columns[idIdx] ? columns[idIdx] : `VS-NEW-${Math.floor(Math.random() * 900) + 100}`;
        const name = nameVal || 'Chưa đặt tên';
        const genderValue = genderIdx !== -1 && columns[genderIdx] ? columns[genderIdx] : '';
        const gender = (genderValue === 'Nữ' || genderValue === 'nữ' ? 'Nữ' : 'Nam') as 'Nam' | 'Nữ';
        const birth = birthIdx !== -1 && columns[birthIdx] ? columns[birthIdx] : '2012-01-01';
        const phone = phoneIdx !== -1 && columns[phoneIdx] ? columns[phoneIdx] : '0901234567';
        const address = addressIdx !== -1 && columns[addressIdx] ? columns[addressIdx] : '';
        
        let currentBelt: BeltType = 'Đen Xanh';
        const rawBelt = beltIdx !== -1 && columns[beltIdx] ? columns[beltIdx] : '';
        if (rawBelt) {
          const lowerRaw = rawBelt.toLowerCase();
          if (lowerRaw.includes('đen xanh')) currentBelt = 'Đen Xanh';
          else if (lowerRaw.includes('đen')) currentBelt = 'Đen';
          else if (lowerRaw.includes('xanh 1')) currentBelt = 'Xanh 1';
          else if (lowerRaw.includes('xanh 2')) currentBelt = 'Xanh 2';
          else if (lowerRaw.includes('xanh 3')) currentBelt = 'Xanh 3';
          else if (lowerRaw.includes('xanh')) currentBelt = 'Xanh';
          else if (lowerRaw.includes('đỏ 1')) currentBelt = 'Đỏ 1';
          else if (lowerRaw.includes('đỏ 2')) currentBelt = 'Đỏ 2';
          else if (lowerRaw.includes('đỏ 3')) currentBelt = 'Đỏ 3';
          else if (lowerRaw.includes('đỏ')) currentBelt = 'Đỏ';
          else if (lowerRaw.includes('vàng 1')) currentBelt = 'Vàng 1';
          else if (lowerRaw.includes('vàng 2')) currentBelt = 'Vàng 2';
          else if (lowerRaw.includes('vàng 3')) currentBelt = 'Vàng 3';
          else if (lowerRaw.includes('vàng 4')) currentBelt = 'Vàng 4';
          else if (lowerRaw.includes('vàng')) currentBelt = 'Vàng';
          else if (lowerRaw.includes('trắng')) currentBelt = 'Trắng';
        }

        let regDate = regDateIdx !== -1 && columns[regDateIdx] ? columns[regDateIdx] : new Date().toISOString().split('T')[0];

        imported.push({
          id,
          name,
          gender,
          birth,
          phone,
          address,
          currentBelt,
          registrationDate: regDate
        });
      }
    }
    return imported;
  }

  public static downloadSampleExcel() {
    const headers = ['STT', 'Mã Võ Sinh', 'Họ Và Tên', 'Giới Tính', 'Ngày Sinh (YYYY-MM-DD)', 'Số Điện Thoại Phụ Huynh', 'Địa Chỉ', 'Cấp Đai Hiện Tại', 'Ngày Đăng Ký Hệ Thống (YYYY-MM-DD)'];
    const sampleRows = [
      [1, 'VS-2026-001', 'Nguyễn Quốc Bình', 'Nam', '2014-05-12', '0914115115', '123 Đường Ba Tháng Hai, Quận 10, TP.HCM', 'Trắng', '2026-06-05'],
      [2, 'VS-2026-002', 'Lê Quỳnh Chi', 'Nữ', '2015-08-20', '0988222333', '456 Lê Hồng Phong, Quận 5, TP.HCM', 'Vàng', '2026-06-05']
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

