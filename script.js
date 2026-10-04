import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDzfpUCfUJd4VNR_UfrR3BhQ8ZCV5jZsP8",
  authDomain: "neworkaccountprojet.firebaseapp.com",
  projectId: "neworkaccountprojet",
  storageBucket: "neworkaccountprojet.firebasestorage.app",
  messagingSenderId: "962982050109",
  appId: "1:962982050109:web:6886bb8c095a6f28a16d54",
  measurementId: "G-RKRB3JEJ4G"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const TEACHER_USERNAME = "tecn0ncet";

document.addEventListener("DOMContentLoaded", function() {
    const currentUser = localStorage.getItem("currentUser");

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    document.getElementById("user-display").textContent = currentUser;

    const isTeacher = (currentUser.trim().toLowerCase() === TEACHER_USERNAME.trim().toLowerCase());

    let portalData = JSON.parse(localStorage.getItem("portalData")) || {
        lessonActive: false,
        pdfUrl: "pdfs/ders1.pdf",
        registeredStudents: [],
        grades: {}
    };

    // Tələbə daxil olubsa, onu siyahıya əlavə edirik
    if (!isTeacher) {
        if (!portalData.registeredStudents.includes(currentUser)) {
            portalData.registeredStudents.push(currentUser);
        }
        if (!portalData.grades[currentUser]) {
            portalData.grades[currentUser] = { lesson1: "-", lesson2: "-" };
        }
    }

    // Müəllim adını tələbələr siyahısından tamamilə kənarlaşdırırıq
    portalData.registeredStudents = portalData.registeredStudents.filter(
        st => st.trim().toLowerCase() !== TEACHER_USERNAME.trim().toLowerCase()
    );

    localStorage.setItem("portalData", JSON.stringify(portalData));

    if (isTeacher) {
        document.getElementById("role-badge").textContent = "(Məllim)";
        document.getElementById("teacher-panel").style.display = "block";
        renderTeacherPanel();
    } else {
        document.getElementById("role-badge").textContent = "(Tələbə)";
    }

    renderCourses(currentUser, isTeacher);

    // Çıxış düyməsi event listener-i
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
});

function renderTeacherPanel() {
    const data = JSON.parse(localStorage.getItem("portalData")) || { registeredStudents: [], grades: {} };
    const tbody = document.getElementById("student-list");
    tbody.innerHTML = "";

    const studentsOnly = data.registeredStudents.filter(
        st => st.trim().toLowerCase() !== TEACHER_USERNAME.toLowerCase()
    );

    if (studentsOnly.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Hələ heç bir tələbə daxil olmayıb.</td></tr>`;
        return;
    }

    studentsOnly.forEach(student => {
        const tr = document.createElement("tr");
        const studentGrades = data.grades[student] || { lesson1: "-", lesson2: "-" };

        // 1. Tələbə Adı (XSS müdafiəsi üçün textContent istifadə edirik)
        const tdStudent = document.createElement("td");
        const bStudent = document.createElement("b");
        bStudent.textContent = student; 
        tdStudent.appendChild(bStudent);

        // 2. Dərs Statusu Düyməsi
        const tdStatus = document.createElement("td");
        const btnToggle = document.createElement("button");
        btnToggle.className = `btn-toggle ${data.lessonActive ? 'btn-active' : 'btn-passive'}`;
        btnToggle.textContent = data.lessonActive ? 'Aktivdir' : 'Deaktivdir';
        btnToggle.addEventListener("click", toggleLesson);
        tdStatus.appendChild(btnToggle);

        // 3. 1-ci Dərs Qiyməti Xanası
        const tdG1 = document.createElement("td");
        const inputG1 = document.createElement("input");
        inputG1.type = "text";
        inputG1.className = "grade-input";
        inputG1.value = studentGrades.lesson1;
        inputG1.id = `g1-${student}`;
        tdG1.appendChild(inputG1);

        // 4. 2-ci Dərs Qiyməti Xanası
        const tdG2 = document.createElement("td");
        const inputG2 = document.createElement("input");
        inputG2.type = "text";
        inputG2.className = "grade-input";
        inputG2.value = studentGrades.lesson2;
        inputG2.id = `g2-${student}`;
        tdG2.appendChild(inputG2);

        // 5. Yadda Saqla Düyməsi
        const tdSave = document.createElement("td");
        const btnSave = document.createElement("button");
        btnSave.className = "btn-danger";
        btnSave.style.padding = "4px 10px";
        btnSave.textContent = "Yadda Saqla";
        btnSave.addEventListener("click", () => saveGrade(student));
        tdSave.appendChild(btnSave);

        // Bütün xanaları sətirə əlavə edirik
        tr.appendChild(tdStudent);
        tr.appendChild(tdStatus);
        tr.appendChild(tdG1);
        tr.appendChild(tdG2);
        tr.appendChild(tdSave);

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
                <p style="color: #86efac;">Hələ Məllim Tərəfindən Aktiv Edilməyib!</p>
            </div>
        `;
    }

    container.innerHTML = html;
}

function logout() {
    signOut(auth).then(() => {
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    }).catch(() => {
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    });
}
