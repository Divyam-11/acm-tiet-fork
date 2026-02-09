import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import ScheduleTable from '../components/ScheduleTable';
import roomsData from '@/assets/rooms.json';

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
        <div className="schedule-container">
            <div className="header-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: '20px' }}>
                <h2 style={{ color: 'white', marginBottom: '10px' }}>Check Room Availability</h2>
                <div style={{ width: '300px' }}>
                    <Select
                        value={selectedOption}
                        onChange={handleChange}
                        options={options}
                        placeholder="Select Room..."
                        className="room-select"
                        classNamePrefix="react-select"
                    />
                </div>
            </div>

            {roomName && scheduleData ? (
                <div className="schedule-table-container">
                    <h3 style={{ textAlign: 'center', color: '#ccc', marginTop: '10px' }}>Schedule for {roomName}</h3>
                    <ScheduleTable scheduleData={scheduleData} />
                </div>
            ) : (
                <div style={{ textAlign: 'center', color: '#888', marginTop: '50px' }}>
                    Select a room to view its schedule.
                </div>
            )}
        </div>
    );
};

export default Rooms;
