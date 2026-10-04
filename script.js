const TEACHER_USERNAME = "tecn0ncet";

document.addEventListener("DOMContentLoaded", async function() {
    const currentUser = localStorage.getItem("currentUser");

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    document.getElementById("user-display").textContent = currentUser;

    const isTeacher = (currentUser.trim().toLowerCase() === TEACHER_USERNAME.trim().toLowerCase());

    if (isTeacher) {
        document.getElementById("role-badge").textContent = "(Məllim)";
        document.getElementById("teacher-panel").style.display = "block";
        
        await loadStudentsFromFirebase();
    } else {
        document.getElementById("role-badge").textContent = "(Tələbə)";
    }

    renderCourses(currentUser, isTeacher);
});

// FIREBASE-DƏN TƏLƏBƏLƏRİ BİRBAŞA ÇƏKƏN FUNKSİYA
async function loadStudentsFromFirebase() {
    const tbody = document.getElementById("student-list");
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Tələbələr Firebase-dən yüklənir...</td></tr>`;

    let portalData = JSON.parse(localStorage.getItem("portalData")) || {
        lessonActive: false,
        pdfUrl: "cpp.pdf",
        registeredStudents: [],
        grades: {}
    };

    try {
        const snapshot = await db.collection("users").get();
        let studentList = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            const username = data.username || doc.id; 

            if (username.trim().toLowerCase() !== TEACHER_USERNAME.toLowerCase()) {
                studentList.push(username);
            }
        });

        portalData.registeredStudents = studentList;
        
        studentList.forEach(student => {
            if (!portalData.grades[student]) {
                portalData.grades[student] = { lesson1: "-", lesson2: "-" };
            }
        });

        localStorage.setItem("portalData", JSON.stringify(portalData));
        
        // Cədvəli ekrana çıxarırıq
        renderTeacherPanel();

    } catch (error) {
        console.error("Firebase-dən məlumat çəkilərkən xəta baş verdi:", error);
        // Əgər Firebase-dən almaq alınmazsa, lokal yaddaşdakını göstəririk
        renderTeacherPanel();
    }
}

function renderTeacherPanel() {
    const data = JSON.parse(localStorage.getItem("portalData")) || { registeredStudents: [], grades: {} };
    const tbody = document.getElementById("student-list");
    tbody.innerHTML = "";

    const studentsOnly = data.registeredStudents.filter(
        st => st.trim().toLowerCase() !== TEACHER_USERNAME.trim().toLowerCase()
    );

    if (studentsOnly.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Firebase-də heç bir tələbə tapılmadı.</td></tr>`;
        return;
    }

    studentsOnly.forEach(student => {
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
                <p style="color: #86efac;">Hələ Məllim Tərəfindən Aktiv Edilməyib!</p>
            </div>
        `;
    }

    container.innerHTML = html;
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}
