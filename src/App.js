import React, { useState } from "react";
import "./App.css";

// Helper to generate slots dynamically
const generateSlots = (duration, bookedAppointments, selectedDate) => {
  const slots = [];
  let start = new Date(`${selectedDate}T09:30:00`);
  let end = new Date(`${selectedDate}T20:00:00`);

  while (start < end) {
    const slotEnd = new Date(start.getTime() + duration * 60000);
    const slotStr = `${start.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })} - ${slotEnd.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}`;

    const isBooked = bookedAppointments.some(
      (appt) => appt.date === selectedDate && appt.time === slotStr
    );

    slots.push({ time: slotStr, booked: isBooked });
    start = slotEnd;
  }
  return slots;
};

function App() {
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("patient");

  // Patient booking states
  const [appointmentType, setAppointmentType] = useState(30);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [formData, setFormData] = useState({ name: "", contact: "" });

  // Admin login states
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  // Popup state
  const [popup, setPopup] = useState({ show: false, message: "" });

  // Patient handlers
  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    const slots = generateSlots(appointmentType, bookedAppointments, date);
    setAvailableSlots(slots);
    setSelectedSlot("");
  };

  const handleTypeChange = (e) => {
    const duration = Number(e.target.value);
    setAppointmentType(duration);
    if (selectedDate) {
      const slots = generateSlots(duration, bookedAppointments, selectedDate);
      setAvailableSlots(slots);
      setSelectedSlot("");
    }
  };

  const handleBooking = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot || !formData.name || !formData.contact) {
      alert("Please fill all fields!");
      return;
    }

    const newBooking = {
      name: formData.name,
      contact: formData.contact,
      date: selectedDate,
      time: selectedSlot,
    };

    setBookedAppointments([...bookedAppointments, newBooking]);

    // Show popup
    setPopup({
      show: true,
      message: `✅ Appointment booked for ${formData.name} on ${selectedDate} at ${selectedSlot}`,
    });
    setTimeout(() => setPopup({ show: false, message: "" }), 3000); // hide after 3 sec

    setFormData({ name: "", contact: "" });
    setSelectedSlot("");

    const slots = generateSlots(appointmentType, [...bookedAppointments, newBooking], selectedDate);
    setAvailableSlots(slots);
  };

  // Admin handlers
  const handleAdminLogin = () => {
    if (adminPassword === "admin123") {
      setIsAdmin(true);
      setAdminPassword("");
    } else {
      alert("Incorrect password!");
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1> Dentist Appointment</h1>
        <p>Book your appointment </p>
      </header>

      {/* Navbar */}
      <div className="navbar">
        <button
          className={activeTab === "patient" ? "active-tab" : ""}
          onClick={() => setActiveTab("patient")}
        >
          Patient Booking
        </button>
        <button
          className={activeTab === "admin" ? "active-tab" : ""}
          onClick={() => setActiveTab("admin")}
        >
          Admin Panel
        </button>
      </div>

      {/* Patient Booking */}
      {activeTab === "patient" && (
        <div className="patient-section">
          <div className="card">
            <h2>Book Your Appointment</h2>

            <label className="label">Appointment Type:</label>
            <select value={appointmentType} onChange={handleTypeChange}>
              <option value={30}>Regular Check-up (30 min)</option>
              <option value={60}>Specific Treatment (60 min)</option>
              <option value={120}>Operation (120 min)</option>
            </select>

            <label className="label">Select Date:</label>
            <input type="date" value={selectedDate} onChange={handleDateChange} />

            {selectedDate && (
              <div className="slots-section">
                <h3>Available Slots</h3>
                {availableSlots.length === 0 ? (
                  <p>No slots available for this date.</p>
                ) : (
                  <div className="slots-grid">
                    {availableSlots.map((slot, idx) => (
                      <button
                        key={idx}
                        className={`slot-btn ${slot.booked ? "booked" : ""} ${
                          selectedSlot === slot.time ? "selected" : ""
                        }`}
                        onClick={() => !slot.booked && setSelectedSlot(slot.time)}
                        disabled={slot.booked}
                      >
                        {slot.time} {slot.booked && "(Booked)"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedSlot && (
              <form className="appointment-form" onSubmit={handleBooking}>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Contact Number or Email"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                />
                <button type="submit">Confirm Booking</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {activeTab === "admin" && (
        <div className="admin-section-wrapper">
          {!isAdmin ? (
            <div className="admin-login card">
              <h2>Admin Login</h2>
              <input
                type="password"
                placeholder="Enter Admin Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
              <button onClick={handleAdminLogin}>Login</button>
            </div>
          ) : (
            <div className="admin-panel card">
              <div className="admin-header">
                <h2>All Patient Appointments</h2>
                <button className="logout-btn" onClick={handleAdminLogout}>
                  Logout
                </button>
              </div>

              {bookedAppointments.length === 0 ? (
                <p>No appointments booked yet.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Contact</th>
                      <th>Date</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookedAppointments.map((appt, idx) => (
                      <tr key={idx}>
                        <td>{appt.name}</td>
                        <td>{appt.contact}</td>
                        <td>{appt.date}</td>
                        <td>{appt.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {/* Popup Message */}
      {popup.show && <div className="popup">{popup.message}</div>}
    </div>
  );
}

export default App;
