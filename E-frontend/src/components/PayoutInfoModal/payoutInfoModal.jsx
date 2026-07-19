import React, { useState } from 'react'
import Button from '../Button/button';

const PayoutInfoModal = ({ handleEditFunc, selfData }) => {
    const [data, setData] = useState({
        phone: selfData?.phone || "",
        payoutEmail: selfData?.payoutEmail || "",
        payoutCardHolder: selfData?.payoutCardHolder || "",
        payoutCardNumber: "" // never pre-filled — full number is never sent back from the server
    });

    const onChangeHandle = (event, key) => {
        setData({ ...data, [key]: event.target.value })
    }

    const handleSave = () => {
        let newData = { ...selfData, ...data };
        handleEditFunc(newData);
    }

    return (
        <div className='mt-8 w-full h-88 overflow-auto'>
            <div className='w-full mb-4'>
                <label>Phone Number</label>
                <br />
                <input type='tel' value={data.phone} onChange={(e) => onChangeHandle(e, 'phone')} className='p-2 mt-1 w-full border rounded-md' placeholder='Enter Phone Number' />
            </div>

            <div className='w-full mb-4'>
                <label>Payout Email</label>
                <br />
                <input type='email' value={data.payoutEmail} onChange={(e) => onChangeHandle(e, 'payoutEmail')} className='p-2 mt-1 w-full border rounded-md' placeholder='Where to reach you about referral payouts' />
            </div>

            <div className='w-full mb-4'>
                <label>Cardholder Name</label>
                <br />
                <input type='text' value={data.payoutCardHolder} onChange={(e) => onChangeHandle(e, 'payoutCardHolder')} className='p-2 mt-1 w-full border rounded-md' placeholder='Name on card' />
            </div>

            <div className='w-full mb-2'>
                <label>Card Number</label>
                <br />
                <input
                    type='text'
                    inputMode='numeric'
                    value={data.payoutCardNumber}
                    onChange={(e) => onChangeHandle(e, 'payoutCardNumber')}
                    className='p-2 mt-1 w-full border rounded-md'
                    placeholder={selfData?.payoutCardLast4 ? `Card ending in ${selfData.payoutCardLast4}` : 'Enter card number'}
                />
            </div>
            <p className='text-xs text-gray-400 mb-6'>
                For your security, we only store the last 4 digits of your card. Full card details are never saved.
            </p>

            <Button onClick={handleSave}>Save</Button>
        </div>
    )
}

export default PayoutInfoModal