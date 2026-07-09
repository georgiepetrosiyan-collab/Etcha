//E/E-frontend/pages/SignUp/signUp.jsx 


import React, { useState } from 'react' // Added missing useState
import { Link, useNavigate } from 'react-router-dom' // Added missing useNavigate
import GoogleLoginComp from "../../components/GoogleLogin/googleLoginComp";
import { ToastContainer, toast } from 'react-toastify'
import axios from 'axios'

const SignUp = (props) => {
    const navigate = useNavigate()
    const [registerField, setRegisterField] = useState({ email: "", password: "", f_name: "" });
    
    const handleInputField = (event, key) => {
        setRegisterField({ ...registerField, [key]: event.target.value })
    }

    const handleRegister = async () => {
        if (registerField.email.trim().length === 0 || registerField.password.trim().length === 0 || registerField.f_name.trim().length === 0) {
            return toast.error("Please Fill All Details.")
        }

        await axios.post('http://localhost:4000/api/auth/register', registerField).then(res => {
          toast.success("You have registerd successfully");
          setRegisterField({ ...registerField, email: "", password: "", f_name: "" })
          navigate("/login")
        }).catch(err => {
            console.log(err)
            toast.error(err?.response?.data?.error)
        })
    }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="text-4xl mb-5 mt-24 text-center">Make the most of your professional life</div>
      
      <div className="w-[85%] md:w-[28%] shadow-xl rounded-sm box p-10 flex flex-col gap-5 bg-white">
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="text-left w-full block text-sm font-medium">Email</label>
            <input value={registerField.email} onChange={(e) => handleInputField(e, 'email')} type="text" id="email" className="w-full text-base border-2 rounded-lg px-5 py-1" placeholder="Email"/>
          </div>

          <div>
            <label htmlFor="password" className="text-left w-full block text-sm font-medium">Password</label>
            <input value={registerField.password} onChange={(e) => handleInputField(e, 'password')} type="password" id="password" className="w-full text-base border-2 rounded-lg px-5 py-1" placeholder="Password"/>
          </div>

          <div>
            <label htmlFor="f_name" className="text-left w-full block text-sm font-medium">Full name</label>
            <input value={registerField.f_name} onChange={(e) => handleInputField(e, 'f_name')} type="text" id="f_name" className="w-full text-base border-2 rounded-lg px-5 py-1" placeholder="Full name"/>
          </div>

          <div onClick={handleRegister} className="w-full bg-blue-600 hover:bg-blue-800 text-white py-3 px-4 rounded-xl text-center text-xl cursor-pointer mt-2 transition-colors">
            Register
          </div>
        </div>

        <div className="flex items-center gap-2">
            <div className="border-b border-gray-400 w-[45%] "/> <div>or</div><div className="border-b border-gray-400 w-[45%] my-6"/>
        </div>

        <div><GoogleLoginComp changeLoginValue={props.changeLoginValue}/></div>
      </div> 

      <div className="mt-4 mb-10">Already on Etcha? <Link to="/login" className="text-blue-800 hover:underline">Sign In</Link></div>
      <ToastContainer />
    </div>
  )
}

export default SignUp