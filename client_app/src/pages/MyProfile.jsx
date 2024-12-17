import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import MyProfile from '../features/user/MyProfile'
import Login from '../features/user/Login'

function ExternalPage() {


    return (
        <div className="">
            <MyProfile />
        </div>
    )
}

export default ExternalPage