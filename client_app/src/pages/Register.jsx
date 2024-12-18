import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Register from '../features/user/Register';

function ExternalPage({ isFromUpdateProfile, patientId }) {
  return (
    <div className="">
      <Register isFromUpdateProfile={isFromUpdateProfile}
        patientId={patientId}
      />
    </div>
  );
}

export default ExternalPage;
