import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import OrderPayment from '../features/user/OrderPayment'
import Login from '../features/user/Login'

function ExternalPage() {


    return (
        <div className="">
            <OrderPayment />
        </div>
    )
}

export default ExternalPage