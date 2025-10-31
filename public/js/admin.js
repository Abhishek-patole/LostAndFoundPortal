// Check authentication
const token = localStorage.getItem("adminToken");
const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");

if (!token || adminUser.role !== 'admin') {
  window.location.href = "/admin-login.html";
}

// Display welcome message
document.getElementById("welcomeMsg").textContent = `Welcome back, ${adminUser.fullname}!`;

// API helper
async function apiRequest(url, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    window.location.href = "/admin-login.html";
    return;
  }

  return response.json();
}

// Navigation
document.getElementById("navEvents").addEventListener("click", (e) => {
  e.preventDefault();
  showSection("events");
});

document.getElementById("navParticipants").addEventListener("click", (e) => {
  e.preventDefault();
  showSection("participants");
});

document.getElementById("logoutBtn").addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  window.location.href = "/admin-login.html";
});

function showSection(section) {
  const eventsSection = document.getElementById("eventsSection");
  const participantsSection = document.getElementById("participantsSection");
  const navEvents = document.getElementById("navEvents");
  const navParticipants = document.getElementById("navParticipants");

  if (section === "events") {
    eventsSection.style.display = "block";
    participantsSection.style.display = "none";
    navEvents.classList.add("active");
    navParticipants.classList.remove("active");
    loadEvents();
  } else {
    eventsSection.style.display = "none";
    participantsSection.style.display = "block";
    navEvents.classList.remove("active");
    navParticipants.classList.add("active");
    loadAllParticipants();
  }
}

// Load Events
async function loadEvents() {
  try {
    const data = await apiRequest('/api/admin/events');
    const tbody = document.getElementById("eventsTableBody");

    if (!data.events || data.events.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No events found. Click "+ Add New Event" to create one.</td></tr>';
      return;
    }

    tbody.innerHTML = data.events.map(event => `
      <tr>
        <td><strong>${event.name}</strong></td>
        <td>${event.date}</td>
        <td>${event.location}</td>
        <td><span class="badge" style="background: #17a2b8; color: white;">${event.category}</span></td>
        <td>
          <span style="color: ${event.isActive ? '#28a745' : '#dc3545'}; font-weight: 600;">
            ${event.isActive ? '✓ Active' : '✗ Inactive'}
          </span>
        </td>
        <td>
          <button onclick="viewParticipants('${event._id}', '${event.name.replace(/'/g, "\\'")}')" 
                  style="padding: 0.4rem 0.8rem; font-size: 0.85rem; background: #17a2b8;">
            👥 View
          </button>
        </td>
        <td>
          <button onclick="editEvent('${event._id}')" 
                  style="padding: 0.4rem 0.8rem; font-size: 0.85rem; background: #ffc107; color: #333; margin-right: 0.25rem;">
            ✏️ Edit
          </button>
          <button onclick="deleteEvent('${event._id}')" 
                  style="padding: 0.4rem 0.8rem; font-size: 0.85rem; background: #dc3545;">
            🗑️ Delete
          </button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error("Error loading events:", error);
    alert("Failed to load events");
  }
}

// Load All Participants
async function loadAllParticipants() {
  try {
    const data = await apiRequest('/api/admin/registrations');
    const tbody = document.getElementById("participantsTableBody");
    document.getElementById("totalParticipants").textContent = data.count || 0;

    if (!data.registrations || data.registrations.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No registrations found</td></tr>';
      return;
    }

    tbody.innerHTML = data.registrations.map(reg => `
      <tr>
        <td>${reg.name}</td>
        <td>${reg.email}</td>
        <td>${reg.mobile}</td>
        <td>${reg.eventId ? reg.eventId.name : 'N/A'}</td>
        <td>${new Date(reg.registrationDate).toLocaleString()}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error("Error loading participants:", error);
    alert("Failed to load participants");
  }
}

// View Participants for specific event
async function viewParticipants(eventId, eventName) {
  try {
    const data = await apiRequest(`/api/admin/events/${eventId}/participants`);
    const modal = document.getElementById("participantsModal");
    const tbody = document.getElementById("participantsModalBody");
    
    document.getElementById("participantsModalTitle").textContent = `Participants: ${eventName}`;
    document.getElementById("participantCount").textContent = data.count || 0;

    if (!data.participants || data.participants.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No participants registered yet</td></tr>';
    } else {
      tbody.innerHTML = data.participants.map(p => `
        <tr>
          <td>${p.name}</td>
          <td>${p.email}</td>
          <td>${p.mobile}</td>
          <td>${new Date(p.registrationDate).toLocaleString()}</td>
        </tr>
      `).join('');
    }

    modal.style.display = "flex";
  } catch (error) {
    console.error("Error loading participants:", error);
    alert("Failed to load participants");
  }
}

// Add Event Button
document.getElementById("addEventBtn").addEventListener("click", () => {
  document.getElementById("modalTitle").textContent = "Add New Event";
  document.getElementById("eventForm").reset();
  document.getElementById("eventId").value = "";
  document.getElementById("activeStatusGroup").style.display = "none";
  document.getElementById("eventModal").style.display = "flex";
});

// Edit Event
async function editEvent(eventId) {
  try {
    const data = await apiRequest('/api/admin/events');
    const event = data.events.find(e => e._id === eventId);

    if (!event) {
      alert("Event not found");
      return;
    }

    document.getElementById("modalTitle").textContent = "Edit Event";
    document.getElementById("eventId").value = event._id;
    document.getElementById("eventName").value = event.name;
    document.getElementById("eventDate").value = event.date;
    document.getElementById("eventLocation").value = event.location;
    document.getElementById("eventCategory").value = event.category;
    document.getElementById("eventDetails").value = event.details;
    document.getElementById("eventActive").checked = event.isActive;
    document.getElementById("activeStatusGroup").style.display = "block";
    document.getElementById("eventModal").style.display = "flex";
  } catch (error) {
    console.error("Error loading event:", error);
    alert("Failed to load event details");
  }
}

// Delete Event
async function deleteEvent(eventId) {
  if (!confirm("Are you sure you want to delete this event?\n\nAll participant registrations for this event will also be deleted. This action cannot be undone.")) {
    return;
  }

  try {
    await apiRequest(`/api/admin/events/${eventId}`, 'DELETE');
    alert("Event deleted successfully!");
    loadEvents();
  } catch (error) {
    console.error("Error deleting event:", error);
    alert("Failed to delete event");
  }
}

// Event Form Submit (Create or Update)
document.getElementById("eventForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const eventId = document.getElementById("eventId").value;
  const eventData = {
    name: document.getElementById("eventName").value.trim(),
    date: document.getElementById("eventDate").value.trim(),
    location: document.getElementById("eventLocation").value.trim(),
    category: document.getElementById("eventCategory").value,
    details: document.getElementById("eventDetails").value.trim(),
    isActive: document.getElementById("eventActive").checked
  };

  if (!eventData.name || !eventData.date || !eventData.location || !eventData.category || !eventData.details) {
    alert("Please fill in all required fields");
    return;
  }

  try {
    if (eventId) {
      // Update existing event
      await apiRequest(`/api/admin/events/${eventId}`, 'PUT', eventData);
      alert("Event updated successfully!");
    } else {
      // Create new event
      await apiRequest('/api/admin/events', 'POST', eventData);
      alert("Event created successfully!");
    }

    document.getElementById("eventModal").style.display = "none";
    loadEvents();
  } catch (error) {
    console.error("Error saving event:", error);
    alert("Failed to save event");
  }
});

// Modal Close Buttons
document.querySelectorAll(".modal-close").forEach(btn => {
  btn.addEventListener("click", () => {
    document.getElementById("eventModal").style.display = "none";
  });
});

document.querySelectorAll(".participants-modal-close").forEach(btn => {
  btn.addEventListener("click", () => {
    document.getElementById("participantsModal").style.display = "none";
  });
});

// Close modal on outside click
window.addEventListener("click", (e) => {
  const eventModal = document.getElementById("eventModal");
  const participantsModal = document.getElementById("participantsModal");
  
  if (e.target === eventModal) {
    eventModal.style.display = "none";
  }
  if (e.target === participantsModal) {
    participantsModal.style.display = "none";
  }
});

// Initial load
loadEvents();