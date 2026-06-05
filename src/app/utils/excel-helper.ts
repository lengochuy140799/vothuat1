import { Student, Registration, ExamSession } from '../../types';

export class ExcelExporter {
  private static escapeCsvCell(value: any): string {
    const str = String(value ?? '').replace(/"/g, '""');
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return `"${str}"`;
    }
    return str;
  }

  private static downloadBlob(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public static exportStudentsToCsv(students: Student[]) {
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

    const csvContent = '\uFEFF' + [
      headers.map(this.escapeCsvCell).join(','),
      ...rows.map(row => row.map(this.escapeCsvCell).join(','))
    ].join('\n');

    this.downloadBlob(csvContent, 'Danh_Sach_Vo_Sinh_Vo_Duong.csv', 'text/csv;charset=utf-8;');
  }

  public static exportExamRegistrationsToCsv(
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

    const csvContent = '\uFEFF' + [
      `Kỳ thi thăng cấp đai:,${this.escapeCsvCell(sessionName)}`,
      `Tổng số thí sinh:,${registrations.length}`,
      '',
      headers.map(this.escapeCsvCell).join(','),
      ...rows.map(row => row.map(this.escapeCsvCell).join(','))
    ].join('\n');

    const formattedFileName = `Danh_Sach_Du_Thi_${sessionName.replace(/\s+/g, '_')}.csv`;
    this.downloadBlob(csvContent, formattedFileName, 'text/csv;charset=utf-8;');
  }

  public static exportComprehensiveReport(
    sessions: ExamSession[],
    registrations: Registration[],
    students: Student[]
  ) {
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; }
          table { border-collapse: collapse; margin-bottom: 30px; width: 100%; }
          th { background-color: #1e293b; color: white; font-weight: bold; padding: 10px; border: 1px solid #cbd5e1; }
          td { padding: 8px 10px; border: 1px solid #e2e8f0; }
          .title { font-size: 18px; font-weight: bold; color: #0f172a; margin: 15px 0 5px 0; }
          .meta { font-size: 12px; color: #64748b; margin-bottom: 15px; }
          .badge-paid { background-color: #d1fae5; color: #065f46; font-weight: bold; text-align: center; }
          .badge-unpaid { background-color: #ffe4e6; color: #991b1b; font-weight: bold; text-align: center; }
          .number { text-align: right; mso-number-format: "#,##0"; }
        </style>
      </head>
      <body>
        <h2>BÁO CÁO TỔNG HỢP KỲ THI NÂNG ĐAI MABU SYSTEM</h2>
        <p class="meta">Thời gian xuất báo cáo: ${new Date().toLocaleString('vi-VN')}</p>
    `;

    sessions.forEach(session => {
      const sessionRegs = registrations.filter(r => r.examSessionId === session.id);
      
      html += `
        <div class="title">${session.name} (${session.id})</div>
        <div class="meta">Địa điểm: ${session.location} | Ngày thi: ${session.date} | Trạng thái: ${session.status === 'OPEN' ? 'Đang mở' : 'Đã khép lại'}</div>
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã Võ Sinh</th>
              <th>Họ và Tên</th>
              <th>Giới Tính</th>
              <th>Cấp Đai Hiện Tại</th>
              <th>Đai Dự Thi</th>
              <th>Lệ Phí Thi</th>
              <th>Trạng Thái</th>
              <th>Ghi Chú</th>
            </tr>
          </thead>
          <tbody>
      `;

      if (sessionRegs.length === 0) {
        html += `<tr><td colspan="9" style="text-align: center; color: #94a3b8;">Chưa có võ sinh đăng ký dự thi.</td></tr>`;
      } else {
        sessionRegs.forEach((reg, index) => {
          const student = students.find(s => s.id === reg.studentId);
          const name = student?.name || 'Võ sinh đã xóa';
          const gender = student?.gender || '-';
          
          html += `
            <tr>
              <td style="text-align: center;">${index + 1}</td>
              <td style="font-weight: bold; color: #4338ca;">${reg.studentId}</td>
              <td>${name}</td>
              <td style="text-align: center;">${gender}</td>
              <td style="text-align: center;">Đai ${reg.currentBelt}</td>
              <td style="text-align: center; font-weight: bold;">Đai ${reg.targetBelt}</td>
              <td class="number">${reg.examFee}</td>
              <td class="${reg.paymentStatus === 'PAID' ? 'badge-paid' : 'badge-unpaid'}">
                ${reg.paymentStatus === 'PAID' ? 'Đã đóng phí' : 'Chưa đóng phí'}
              </td>
              <td>${reg.notes || ''}</td>
            </tr>
          `;
        });
      }

      html += `
          </tbody>
        </table>
      `;
    });

    html += `
      </body>
      </html>
    `;

    this.downloadBlob(html, 'Bao_Cao_Tong_Hop_Mabu_System.xls', 'application/vnd.ms-excel');
  }

  public static parseStudentsCsv(csvText: string): Partial<Student>[] {
    const lines = csvText.split(/\r?\n/);
    if (lines.length < 2) return [];

    const imported: Partial<Student>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(',').map(col => {
        let val = col.trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1).replace(/""/g, '"');
        }
        return val;
      });

      if (columns.length >= 2) {
        const id = columns[1] || `VS-NEW-${Math.floor(Math.random() * 900) + 100}`;
        const name = columns[2] || columns[0] || 'Chưa đặt tên';
        const gender = (columns[3] === 'Nữ' ? 'Nữ' : 'Nam') as 'Nam' | 'Nữ';
        const birth = columns[4] || '2012-01-01';
        const phone = columns[5] || '0901234567';
        
        let currentBelt: 'Trắng' | 'Vàng' | 'Xanh' | 'Đỏ' | 'Đen' = 'Trắng';
        const rawBelt = columns[6] || '';
        if (rawBelt.includes('Vàng')) currentBelt = 'Vàng';
        else if (rawBelt.includes('Xanh')) currentBelt = 'Xanh';
        else if (rawBelt.includes('Đỏ')) currentBelt = 'Đỏ';
        else if (rawBelt.includes('Đen')) currentBelt = 'Đen';

        imported.push({
          id,
          name,
          gender,
          birth,
          phone,
          currentBelt,
          registrationDate: new Date().toISOString().split('T')[0]
        });
      }
    }
    return imported;
  }
}
