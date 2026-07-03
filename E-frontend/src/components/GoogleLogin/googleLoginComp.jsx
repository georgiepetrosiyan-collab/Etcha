//E/E-frontend/components/GoogleLogin/googleLogin.jsx
import React from 'react'
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GoogleLoginComp = (props) => {
    const navigate = useNavigate();
    
    const handleOnSucess = async (credResponse) => {
        const token = credResponse.credential;
        const res = await axios.post("http://localhost:4000/api/auth/google", { token }, { withCredentials: true });
        localStorage.setItem("isLogin", "true");
        localStorage.setItem("userInfo", JSON.stringify(res.data.user));
        props.changeLoginValue(true)
        navigate("/feeds")
    }

    return (
        <div>
            <GoogleLogin
                onSuccess={handleOnSucess}
                onError={() => {
                    console.log('Login Failed');
                }}
            />
        </div>
    )
}

export default GoogleLoginComp