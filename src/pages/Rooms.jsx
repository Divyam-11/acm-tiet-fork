import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import ScheduleTable from '../components/ScheduleTable';
import roomsData from '@/assets/rooms.json';
import '@/assets/home.css'; // Import home CSS for styling
import instagramLogo from '@/assets/logos/instagram.svg';
import githubLogo from '@/assets/logos/github.svg';

const Rooms = () => {
    const { roomName } = useParams();
    const navigate = useNavigate();

    // Prepare options for Select
    const options = Object.keys(roomsData).sort().map(room => ({
        value: room,
        label: room
    }));

    const handleChange = (selectedOption) => {
        if (selectedOption) {
            navigate(`/rooms/${selectedOption.value}`);
        }
    };

    // Find the currently selected option object
    const selectedOption = roomName ? { value: roomName, label: roomName } : null;

    // Get schedule data for the selected room
    const scheduleData = roomName ? roomsData[roomName] : null;

    return (
        <div className="home-container">
            <div className="navbar">
                <div className="cont1">
                    <img
                        src="https://acm-thapar.github.io/img/logo.png"
                        alt="Logo"
                        className="logo"
                        onClick={() => navigate('/')}
                        style={{ cursor: 'pointer' }}
                    />
                </div>
                <ul className="cont2">
                    <li>
                        <a href="https://www.instagram.com/acmthapar/" target="_blank" rel="noopener noreferrer">
                            <img src={instagramLogo} className="social" alt="Instagram Logo" />
                        </a>
                    </li>
                    <li>
                        <a href="https://github.com/ACM-Thapar" target="_blank" rel="noopener noreferrer">
                            <img src={githubLogo} className="social" alt="Github Logo" />
                        </a>
                    </li>
                </ul>
            </div>

            <div className="container" style={{ minHeight: '100vh', height: 'auto' }}>
                <div className="content">
                    <div className="tt-header">
                        Room Availability
                    </div>
                    <div className="tt-subtext">
                        Check Timetable by Room
                    </div>

                    <div className="form-container" style={{ width: 'auto', minWidth: '40rem', maxWidth: '90vw' }}>
                        <div className="text">
                            Select Room:
                        </div>
                        <div className="input-box-container" style={{ width: '100%' }}>
                            <Select
                                value={selectedOption}
                                onChange={handleChange}
                                options={options}
                                placeholder="Search Room..."
                                className="room-select"
                                classNamePrefix="react-select"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        minHeight: '40px',
                                        borderRadius: '5px'
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        color: 'black'
                                    })
                                }}
                            />
                        </div>
                    </div>

                    {roomName && scheduleData ? (
                        <div className="schedule-table-container" style={{ marginTop: '30px', width: '95%', overflowX: 'auto', background: 'rgba(255,255,255,0.9)', padding: '20px', borderRadius: '10px' }}>
                             <h3 style={{ textAlign: 'center', color: '#333', marginBottom: '15px' }}>Schedule for {roomName}</h3>
                             <ScheduleTable scheduleData={scheduleData} />
                        </div>
                    ) : (
                         <div style={{ marginTop: '50px', color: 'white', fontSize: '1.2em' }}>
                            Please select a room to view its schedule.
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Rooms;
