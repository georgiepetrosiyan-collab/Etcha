//E/E-frontend/pages/Login/login.jsx 

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom' // Added missing imports
import GoogleLoginComp from "../../components/GoogleLogin/GoogleLoginComp";
import { ToastContainer, toast } from 'react-toastify'
import axios from 'axios'

const Login = (props) => {
  const navigate = useNavigate();
  const [loginField, setLoginField] = useState({ email: "", password: "" })

  const onChangeInput = (event, key) => {
    setLoginField({ ...loginField, [key]: event.target.value })
  }

  const handleLogin = async () => {
    if (loginField.email.trim().length === 0 || loginField.password.trim().length === 0) {
      return toast.error("Please fill all credentials")
    }
    
    // Fixed: Chained promises correctly and fixed "useIndo" to "userInfo"
    await axios.post("http://localhost:4000/api/auth/login", loginField, { withCredentials: true })
      .then((res) => {
        props.changeLoginValue(true);
        localStorage.setItem("isLogin", "true");
        localStorage.setItem("userInfo", JSON.stringify(res.data.user)); 
        navigate("/feeds")
      })
      .catch(err => {
        console.log(err)
        toast.error(err?.response?.data?.error)
      })
  }

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-[85%] md:w-[28%] shadow-xl rounded-sm box p-10 flex flex-col gap-5 bg-white">
        <div className="text-3xl font-medium">Sign In</div>

        <div className="my-5">
          <GoogleLoginComp changeLoginValue={props.changeLoginValue} />
        </div>

        <div className="flex items-center gap-2">
          <div className="border-b border-gray-400 w-[45%]" />
          <div>or</div>
          <div className="border-b border-gray-400 w-[45%]" />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="text-left w-full block text-sm font-medium mb-1">Email</label>
            <input type="text" value={loginField.email} onChange={(e) => { onChangeInput(e, "email") }} id="email" className="w-full text-base border-2 rounded-lg px-5 py-1" placeholder="Email" />
          </div>

          <div>
            <label htmlFor="password" className="text-left w-full block text-sm font-medium mb-1">Password</label>
            <input type="password" value={loginField.password} onChange={(e) => { onChangeInput(e, "password") }} id="password" className="w-full text-base border-2 rounded-lg px-5 py-1" placeholder="Password" />
          </div>

          <div onClick={handleLogin} className="w-full hover:bg-blue-900 bg-blue-800 text-white py-3 px-4 rounded-xl text-center text-xl cursor-pointer my-2">
            Login
          </div>
        </div>
      </div> 

      <div className="mt-4 mb-10">New to Etcha? <Link to="/signUp" className="text-blue-800 hover:underline">Join Now</Link></div>
      <ToastContainer />
    </div>
  )
}

export default Login