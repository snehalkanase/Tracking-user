import React from 'react'
import "../style.css";

export default function error({image,title,subTitle}) {
  return (
    <>
    <div className='main'>
        <div>
            <img src={`/img/${image}`} alt="" className='svg' />
            <h3>{title}</h3>
            <h4>{subTitle}</h4>
        </div>
    </div>
    </>
  )
}
