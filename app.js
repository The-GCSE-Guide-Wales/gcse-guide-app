let exams = JSON.parse(localStorage.getItem("exams")) || [];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

/* ---------- PAGE SWITCH ---------- */

function showPage(page) {
    document.getElementById("examsPage").classList.remove("active");
    document.getElementById("calendarPage").classList.remove("active");

    if (page === "exams") {
        document.getElementById("examsPage").classList.add("active");
    } else {
        document.getElementById("calendarPage").classList.add("active");
    }
}

/* ---------- MODAL ---------- */

function openModal() {
    document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("modal").classList.add("hidden");
}

/* ---------- SAVE EXAM ---------- */

function saveExam() {
    const subject = document.getElementById("subject").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const duration = document.getElementById("duration").value;
    const candidate = document.getElementById("candidate").value;
    const revision = document.getElementById("revision").value;

    if (!subject || !date || !time) {
        alert("Please fill in subject, date and time.");
        return;
    }

    exams.push({ subject, date, time, duration, candidate, revision });

    // Sort soonest first
    exams.sort((a, b) => {
        return new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`);
    });

    localStorage.setItem("exams", JSON.stringify(exams));

    renderExams();
    renderCalendar();
    closeModal();
}

/* ---------- DELETE ---------- */

function deleteExam(index) {
    exams.splice(index, 1);
    localStorage.setItem("exams", JSON.stringify(exams));
    renderExams();
    renderCalendar();
}

/* ---------- COUNTDOWN FUNCTION ---------- */

function getCountdown(dateTime) {
    const now = new Date();
    const diff = new Date(dateTime) - now;

    if (diff <= 0) return "Exam in progress or finished";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    return `${days}d ${hours}h ${minutes}m`;
}

/* ---------- RENDER EXAMS ---------- */

function renderExams() {
    const list = document.getElementById("examList");
    list.innerHTML = "";

    exams.forEach((exam, index) => {
        const card = document.createElement("div");
        card.className = "exam-card";
        card.innerHTML = `
            <h3>${exam.subject}</h3>
            <p>${exam.date} at ${exam.time}</p>
            <p class="countdown" id="countdown-${index}"></p>
            <button onclick="deleteExam(${index})">Delete</button>
        `;
        list.appendChild(card);
    });

    updateCountdowns();
}

/* ---------- LIVE COUNTDOWN ---------- */

function updateCountdowns() {
    exams.forEach((exam, index) => {
        const element = document.getElementById(`countdown-${index}`);
        if (element) {
            element.textContent = getCountdown(`${exam.date}T${exam.time}`);
        }
    });
}

// Update every 60 seconds
setInterval(updateCountdowns, 60000);

/* ---------- CALENDAR ---------- */

function renderCalendar() {
    const grid = document.getElementById("calendarGrid");
    const title = document.getElementById("monthTitle");
    grid.innerHTML = "";

    const monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    title.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    const firstDay = new Date(currentYear, currentMonth, 1);
    let startDay = firstDay.getDay();

    // Convert to Monday-first (UK)
    startDay = (startDay === 0) ? 6 : startDay - 1;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Empty slots before first day
    for (let i = 0; i < startDay; i++) {
        grid.innerHTML += "<div></div>";
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const dayDiv = document.createElement("div");
        dayDiv.className = "calendar-day";
        dayDiv.innerHTML = `<strong>${day}</strong>`;

        exams.forEach(exam => {
            if (exam.date === dateString) {
                dayDiv.innerHTML += `<div style="color:#D4AF37;font-size:12px;">${exam.subject}</div>`;
            }
        });

        grid.appendChild(dayDiv);
    }
}

/* ---------- MONTH NAV ---------- */

function changeMonth(direction) {
    currentMonth += direction;

    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }

    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }

    renderCalendar();
}

/* ---------- INIT ---------- */

renderExams();
renderCalendar();

/* ---------- SERVICE WORKER ---------- */

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
