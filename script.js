// Müəllim istifadəçi adı
const TEACHER_USERNAME = "tecn0ncet";

document.addEventListener("DOMContentLoaded", function() {
    const currentUser = localStorage.getItem("currentUser");

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    document.getElementById("user-display").textContent = currentUser;

    // Daxil olan istifadəçinin Müəllim olub-olmadığını təmiz yoxlayırıq
    const isTeacher = (currentUser.trim().toLowerCase() === TEACHER_USERNAME.trim().toLowerCase());

    // Portal məlumatlarını lokal yaddaşdan oxuyuruq
    let portalData = JSON.parse(localStorage.getItem("portalData")) || {
        lessonActive: false,
        pdfUrl: "pdfs/ders1.pdf",
        registeredStudents: [],
        grades: {}
    };

    // Firebase ilə daxil olan İSTİFADƏÇİ TƏLƏBƏDİRSƏ, onu siyahıya və qiymət cədvəlinə əlavə edirik
    if (!isTeacher) {
        if (!portalData.registeredStudents.includes(currentUser)) {
            portalData.registeredStudents.push(currentUser);
        }
        if (!portalData.grades[currentUser]) {
            portalData.grades[currentUser] = { lesson1: "-", lesson2: "-" };
        }
    }

    // Təhlükəsizlik üçün: Müəllim istifadəçi adını tələbələr siyahısından tamamilə təmizləyirik
    portalData.registeredStudents = portalData.registeredStudents.filter(
        st => st.trim().toLowerCase() !== TEACHER_USERNAME.trim().toLowerCase()
    );

    localStorage.setItem("portalData", JSON.stringify(portalData));

    // Rol təyini və panel görüntüsü
    if (isTeacher) {
        document.getElementById("role-badge").textContent = "(Məllim)";
        document.getElementById("teacher-panel").style.display = "block";
        renderTeacherPanel();
    } else {
        document.getElementById("role-badge").textContent = "(Tələbə)";
    }

    renderCourses(currentUser, isTeacher);
});

// Müəllim Panelində Tələbələrin Siyahılanması
function renderTeacherPanel() {
    const data = JSON.parse(localStorage.getItem("portalData")) || { registeredStudents: [], grades: {} };
    const tbody = document.getElementById("student-list");
    tbody.innerHTML = "";

    // Müəllim adının siyahıda olmamasını təmin edirik
    const studentsOnly = data.registeredStudents.filter(
        st => st.trim().toLowerCase() !== TEACHER_USERNAME.trim().toLowerCase()
    );

    if (studentsOnly.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Hələ heç bir tələbə daxil olmayıb.</td></tr>`;
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

// Dərsin Aktiv/Passiv olunması
function toggleLesson() {
    let data = JSON.parse(localStorage.getItem("portalData"));
    data.lessonActive = !data.lessonActive;
    localStorage.setItem("portalData", JSON.stringify(data));
    location.reload();
}

// Qiymətlərin Yadda Saqlanması
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

// Dərsləri Ekranlaşdırmaq
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
