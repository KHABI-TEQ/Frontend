const handleLogin = async (credentials) => {
  try {
    const response = await api.post('/admin/login', credentials);
    const { token } = response.data;
    localStorage.setItem('adminToken', token);
    // Redirect to admin dashboard
  } catch (error) {
    console.error('Login failed:', error);
  }
};
