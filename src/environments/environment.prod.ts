export const environment = {
  production: true,
  // Thay thế URL dưới đây bằng URL Backend của bạn trên Railway
  // Bạn cũng có thể thiết lập window.API_URL trên Vercel để ghi đè động
  apiUrl: (typeof window !== 'undefined' && (window as any).API_URL)
    ? (window as any).API_URL
    : 'https://vothuat-backend.up.railway.app/api'
};
