import React, { useEffect, useState } from 'react';
import ProfileCard from '../../components/ProfileCard/profileCard';
import Advertisement from '../../components/Advertisement/advertisement';
import Card from '../../components/Card/card';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Job = () => {
    const [ownData, setOwnData] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('userInfo');
        setOwnData(userData ? JSON.parse(userData) : null);
    }, []);

    return (
        <div className="px-5 xl:px-50 py-9 flex gap-5 w-full mt-5 bg-gray-100 min-h-screen">
            {/* left side */}
            <div className="w-[21%] sm:block sm:w-[23%] hidden py-5">
                <div className="h-fit">
                    <ProfileCard data={ownData} />
                </div>
            </div>

            {/* middle side */}
            <div className="w-full py-5 sm:w-[50%]">
                <Card padding={0}>
                    <div className="w-full">
                        
                    </div>
                </Card>
            </div>

            {/* right side */}
            <div className="w-[26%] py-5 hidden md:block">
                <div className="my-5 sticky top-19">
                    <Advertisement />
                </div>
            </div>
        </div>
    );
};

export default Job;