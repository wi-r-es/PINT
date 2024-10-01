import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Calendar.css';
import axios from 'axios';
import ShowEventCalendar from '../ShowEventCalendar/ShowEventCalendar';
import { useNavigate } from 'react-router-dom';

import api from '../../api';

const Calendar = ({ token, user }) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const currentYear = new Date().getFullYear();
  const [eventDates, setEventDates] = useState([]);
  const [onlyDates, setOnlyDates] = useState([]);
  const [eventsInDate, setEventsInDate] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchEventDates = async () => {
      if (token) {
        try {
          // const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/dynamic/all-content`, {
          //   headers: {
          //     Authorization: `Bearer ${token}`,
          //   },
          // });
          const response = await api.get('/dynamic/all-content');
          if (user.office_id !== 0) {
          setEventDates(response.data.events.filter(event => event.office_id === user.office_id && event.validated === true));
          }else{
            setEventDates(response.data.events.filter(event => event.validated === true));
          }
        } catch (error) {
          console.error("Error fetching event dates:", error);
        }
      }
    };

    fetchEventDates();
  }, [token]);

  const seeInDate = async (date) => {
    const selectedDate = date.toISOString().split('T')[0];
    console.log(selectedDate);
    try {
      // const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/dynamic/get-event-by-date/${selectedDate}`,{
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // });
      const res = await api.get(`/dynamic/get-event-by-date/${selectedDate}`);
      setEventsInDate(res.data.data.map(event => event.event_id));
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching events on date:", error);
    }
  };

  useEffect(() => {
    const filterDates = () => {
      const dates = eventDates.map((event) => {
        return new Date(event.event_date).toISOString().split('T')[0];
      });
      setOnlyDates(dates);
    };

    filterDates();
  }, [eventDates]);

  // Convert string dates back to Date objects for highlighting
  const highlightDates = onlyDates.map(date => new Date(date));

  return (
    <div className="calendar-container">
      <DatePicker
        selected={selectedDate}
        onChange={date => {
          setSelectedDate(date);
          seeInDate(date);
        }}
        inline
        highlightDates={highlightDates}
        renderCustomHeader={({
          date,
          changeYear,
          changeMonth,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled
        }) => (
          <div className="custom-header">
            <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
              {"<"}
            </button>
            <select
              value={date.getFullYear()}
              onChange={({ target: { value } }) => changeYear(Number(value))}
            >
              {Array.from({ length: 100 }, (_, i) => currentYear - 50 + i).map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={date.getMonth()}
              onChange={({ target: { value } }) => changeMonth(Number(value))}
            >
              {Array.from({ length: 12 }, (_, i) => i).map(month => (
                <option key={month} value={month}>
                  {new Date(0, month).toLocaleString('default', { month: 'short' })}
                </option>
              ))}
            </select>
            <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
              {">"}
            </button>
          </div>
        )}
      />
      {showModal && (
        <ShowEventCalendar
          show={showModal}
          handleClose={() => setShowModal(false)}
          eventIdList={eventsInDate}
          token={token}
        />
      )}
    </div>
  );
};

export default Calendar;
