//E/E-frontend/pages/LandingPage/landingPage.jsx 

import React from 'react'
import { Link } from 'react-router-dom'
import GoogleLoginComp from '../../components/GoogleLogin/googleLoginComp'
// FIXED: Removed backend controller import here

const LandingPage = (props) => {
  return (
    <div className="w-[70%] mx-auto mt-12 flex flex-col box-border">
      <div className="mb-6 text-left">
        <h1 className="text-4xl font-medium text-black mb-2 tracking-tight">
          Welcome
        </h1>
        <p className="text-gray-600 text-base">
          Sign in or create an account
        </p>
      </div>

      <div className="w-full flex flex-col gap-3">
        <div className="w-full max-w-95 mx-auto flex flex-col gap-3">
          <div className="w-full">
            <GoogleLoginComp changeLoginValue={props.changeLoginValue}/>
          </div>

          <div className="w-full bg-white rounded-full text-black cursor-pointer py-[10px] px-4 border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm flex justify-center items-center">
            <Link to="/login" className="font-semibold text-sm text-gray-700">
              Continue with Email
            </Link>
          </div>
        </div>

        <p className="mx-auto text-center mb-4 text-base w-full mt-4 text-gray-600">
          New to Etcha?{' '}
          <Link to="/signUp" className="text-blue-800 font-semibold cursor-pointer hover:underline">
            Join now
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LandingPage