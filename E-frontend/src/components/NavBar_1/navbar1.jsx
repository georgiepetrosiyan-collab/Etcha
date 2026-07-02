import React from 'react';
import {Link} from "react-router-dom"

const Navbar1 = () => {
  return (
    <nav className="w-full md:px-full px-5 flex justify-between py-4 box-border absolute top-0 left-0 z-50 pointer-events-none">
      
      {/* LEFT SIDE: Logo */}
      <Link to = {"/"} className="flex items-center pointer-events-auto">
        <a href="/" className="flex gap-0 items-center cursor-pointer ">
          <img 
            src="/logo_theone.svg" 
            alt="ETCHA Logo" 
            className="w-full h-auto" 
          />
        </a>
      </Link>

      {/* RIGHT SIDE: Your exact code block, wrapped in pointer-events-auto */}
      <div className="pointer-events-auto">
        <div className="flex box-border md:gap-4 gap-2 justify-center items-center">
          <Link to={"signUp"} className="md:px-4 md:py-2 px-3 py-1 box-border text-black rounded-3xl text-xl hover:bg-gray-200 cursor-pointer">
            Join now
          </Link>

            <Link to="/login" className="px-4 py-2 box-border border border-[#00827D] text-[#00827D] rounded-3xl text-xl hover:bg-[#00827D]/10 cursor-pointer transition-colors duration-200">
            Sign in
          </Link>

        </div>
      </div>

    </nav>
  );
};

export default Navbar1;