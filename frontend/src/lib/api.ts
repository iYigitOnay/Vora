import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// İstek Interceptor'ı: Her isteğe token ekle
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('vora_access_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Yanıt Interceptor'ı: 401 hatasını yakala ve token yenile
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Eğer hata 401 ise ve daha önce bu istek için yenileme denenmediyse
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('vora_refresh_token') : null;
      const userId = typeof window !== 'undefined' ? localStorage.getItem('vora_user_id') : null;

      if (refreshToken && userId) {
        try {
          // Refresh token ile yeni access token al
          const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
            userId,
            refresh_token: refreshToken,
          });

          if (res.status === 201 || res.status === 200) {
            const { access_token, refresh_token } = res.data;
            
            // Yeni tokenları kaydet
            localStorage.setItem('vora_access_token', access_token);
            localStorage.setItem('vora_refresh_token', refresh_token);

            // Orijinal isteği yeni token ile güncelle ve tekrar dene
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh token da geçersizse her şeyi temizle ve logout yap
          if (typeof window !== 'undefined') {
            localStorage.removeItem('vora_access_token');
            localStorage.removeItem('vora_refresh_token');
            localStorage.removeItem('vora_user_id');
            window.location.href = '/auth';
          }
          return Promise.reject(refreshError);
        }
      } else {
        // Tokenlar yoksa login'e at
        if (typeof window !== 'undefined') {
          window.location.href = '/auth';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
