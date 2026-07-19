//E/E-frontend/components/Card/card.jsx

import React from 'react'

const Card = (props) => {
    return (
        <div className={`${props.shrink ? "": "w-full h-full "}flex flex-col border border-gray-300 bg-white rounded-md ${props.padding ? "p-5" : "p-0"} ${props.className ? props.className : ""}`}>
            {props.children}
        </div>
    )
}

export default Card