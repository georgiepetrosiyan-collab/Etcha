import axios from 'axios';

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('isLogin');
      localStorage.removeItem('userInfo');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
      return; // swallow it — don't let it bubble to your .catch()/alert() code
    }
    return Promise.reject(err);
  }
);