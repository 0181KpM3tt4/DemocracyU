import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../components-style/Navbar.css';
import '../components-style/UserDB.css';
import '../components-style/AdminDashboard.css';
import DigitalClock from '../components/DigitalClock';

const AdminDashboard = () => {
  const { account, userData, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div>
      <div className="navbar">
        <div className="navbar-left">
          <div className="DemocracyU">
            <Link to="/" className="Title">DemocracyU</Link>
          </div>
        </div>
        <div className="navbar-right">
          {account ? (
            <>
              <div className="username">{account.name}</div>
              {userData && userData.photoUrl ? (
                <img src={userData.photoUrl} alt={`${account.name}'s profile`} className="profile-pic" />
              ) : (
                <div>No Profile Picture</div>
              )}
              <button onClick={logout} className="logout-button">Logout</button>
            </>
          ) : (
            <Link to="/login" className="login">Login</Link>
          )}
        </div>
      </div>
      <div className="clock">
        <DigitalClock />
      </div>
      <div className="function-buttons">
        <button className="function-button" onClick={() => handleNavigate('/manage-student')}>
          <img src="https://krishplayschool.com/images/icons/graduation.svg" alt="Student Management" />
          จัดการข้อมูลนักศึกษา
        </button>
        <button className="function-button" onClick={() => handleNavigate('/manage-candidate')}>
          <img src="https://cdn-icons-png.freepik.com/512/2393/2393401.png" alt="Candidate Management" />
          จัดการข้อมูลผู้ลงสมัคร
        </button>
        <button className="function-button">
          <img src="https://www.forest.go.th/checkpoint/wp-content/uploads/sites/30/2024/05/10897892.png" alt="Position Evaluation" />
          แบบประเมินผู้ดำรงตำแหน่ง
        </button>
        <button className="function-button">
          <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/2ce82bc26ade1c739d9d608ab8b11d9e964f32f41dc2f611f3636da9d9abc742?apiKey=1f6df3b559f94f9cadab107301ebb8cc" alt="Election Management" />
          จัดการการเลือกตั้ง
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
