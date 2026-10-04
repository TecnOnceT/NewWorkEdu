const TEACHER_USERNAME = "tecn0ncet";

document.addEventListener("DOMContentLoaded", function() {
    const currentUser = localStorage.getItem("currentUser");

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    document.getElementById("user-display").textContent = currentUser;

    let portalData = JSON.parse(localStorage.getItem("portalData")) || {
        lessonActive: false,
        pdfUrl: "ders1.pdf",
        registeredStudents: [],
        grades: {}
    };

    const isTeacher = (currentUser.toLowerCase() === TEACHER_USERNAME.toLowerCase());

    if (!isTeacher) {
        if (!portalData.registeredStudents.includes(currentUser)) {
            portalData.registeredStudents.push(currentUser);
        }
        if (!portalData.grades[currentUser]) {
            portalData.grades[currentUser] = { lesson1: "-", lesson2: "-" };
        }
        localStorage.setItem("portalData", JSON.stringify(portalData));
    }

    if (isTeacher) {
        document.getElementById("role-badge").textContent = "(Məllim)";
        document.getElementById("teacher-panel").style.display = "block";
        renderTeacherPanel();
    } else {
        document.getElementById("role-badge").textContent = "(Tələbə)";
    }

    renderCourses(currentUser, isTeacher);
});

function renderTeacherPanel() {
    const data = JSON.parse(localStorage.getItem("portalData")) || { registeredStudents: [], grades: {} };
    const tbody = document.getElementById("student-list");
    tbody.innerHTML = "";

    if (data.registeredStudents.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Hələ heç bir tələbə daxil olmayıb.</td></tr>`;
        return;
    }

    data.registeredStudents.forEach(student => {
        const tr = document.createElement("tr");
        const studentGrades = data.grades[student] || { lesson1: "-", lesson2: "-" };

        tr.innerHTML = `
            <td><b>${student}</b></td>
            <td>
                <button class="btn-toggle ${data.lessonActive ? 'btn-active' : 'btn-passive'}" onclick="toggleLesson()">
                    ${data.lessonActive ? 'Aktivdir' : 'Deaktivdir'}
                </button>
            </td>
            <td><input type="text" class="grade-input" value="${studentGrades.lesson1}" id="g1-${student}"></td>
            <td><input type="text" class="grade-input" value="${studentGrades.lesson2}" id="g2-${student}"></td>
            <td><button class="btn-danger" style="padding: 4px 10px;" onclick="saveGrade('${student}')">Yadda Saqla</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function toggleLesson() {
    let data = JSON.parse(localStorage.getItem("portalData"));
    data.lessonActive = !data.lessonActive;
    localStorage.setItem("portalData", JSON.stringify(data));
    location.reload();
}

function saveGrade(student) {
    let data = JSON.parse(localStorage.getItem("portalData"));
    const g1 = document.getElementById(`g1-${student}`).value;
    const g2 = document.getElementById(`g2-${student}`).value;

    if (!data.grades[student]) data.grades[student] = {};
    data.grades[student].lesson1 = g1;
    data.grades[student].lesson2 = g2;

    localStorage.setItem("portalData", JSON.stringify(data));
    alert(`${student} üçün qiymətlər yadda saxlanıldı!`);
    location.reload();
}

function renderCourses(username, isTeacher) {
    const data = JSON.parse(localStorage.getItem("portalData")) || {};
    const container = document.getElementById("courses-container");
    const myGrades = (data.grades && data.grades[username]) ? data.grades[username] : { lesson1: "-", lesson2: "-" };

    let html = "";

    if (data.lessonActive || isTeacher) {
        html = `
            <div class="course-card">
                <h3>HTML 1-ci Dərs</h3>
                <p>Dərs materialını aşağıdakı düymədən yükləyə bilərsiniz.</p>
                ${!isTeacher ? `<p style="margin-top:10px;"><b>Qiymətiniz:</b> ${myGrades.lesson1}</p>` : ''}
                <a href="${data.pdfUrl || '#'}" download class="btn-download">PDF Yüklə</a>
            </div>
            <div class="course-card">
                <h3>HTML 2-ci Dərs</h3>
                <p>Dərs materialı hazırlıq mərhələsindədir.</p>
                ${!isTeacher ? `<p style="margin-top:10px;"><b>Qiymətiniz:</b> ${myGrades.lesson2}</p>` : ''}
            </div>
        `;
    } else {
        html = `
            <div class="course-card">
                <h3>HTML Dərsləri</h3>
                <p style="color: #fca5a5;">Hələ Məllim Tərəfindən Aktiv Edilməyib!</p>
            </div>
        `;
    }

    container.innerHTML = html;
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}
