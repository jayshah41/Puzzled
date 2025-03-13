import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useAuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const isLoggedIn = !!token;
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [navigate]);
};

export default useAuthRedirect;