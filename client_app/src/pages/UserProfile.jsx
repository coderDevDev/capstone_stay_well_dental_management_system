import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import UserProfile from '../features/user/UserProfile'
import Login from '../features/user/Login'

function ExternalPage() {


    return (
        <div className="">
            <UserProfile />
        </div>
    )
}

export default ExternalPage