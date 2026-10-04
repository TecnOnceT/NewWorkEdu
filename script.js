import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    onSnapshot, 
    collection, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const db = getFirestore(app);

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
    } else {
        document.getElementById("role-badge").textContent = "(Tələbə)";
        // Tələbə daxil olan kimi onu Firebase Firestore-a qeyd edirik
        await registerStudentToFirebase(currentUser);
    }

    // Ümumi tənzimləmələri (dərs aktivliyi və s.) dinləyirik
    listenSystemSettings(currentUser, isTeacher);

    // Müəllimdirsə tələbə siyahısını canlı izləyirik
    if (isTeacher) {
        listenStudentsRealtime();
    }

    // Çıxış düyməsi
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
});

// 1. Tələbə giriş etdikdə Firestore-da 'students' kolleksiyasına yazılır
async function registerStudentToFirebase(username) {
    const studentRef = doc(db, "students", username);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
        await setDoc(studentRef, {
            username: username,
            grades: { lesson1: "-", lesson2: "-" },
            createdAt: new Date()
        });
    }
}

// 2. Sistem Ayarlarını (Dərs statusu və PDF linki) Firebase-dən dinləmək
function listenSystemSettings(username, isTeacher) {
    const settingsRef = doc(db, "settings", "portal");

    onSnapshot(settingsRef, (docSnap) => {
        let settings = { lessonActive: false, pdfUrl: "cpp.pdf" };

        if (docSnap.exists()) {
            settings = docSnap.data();
        } else {
            // İlk dəfə lazımdırsa susmaya görə yaradırıq
            setDoc(settingsRef, settings);
        }

        // Tələbənin qiymətini çəkmək üçün
        if (!isTeacher) {
            getDoc(doc(db, "students", username)).then(studentSnap => {
                let userGrades = { lesson1: "-", lesson2: "-" };
                if (studentSnap.exists()) {
                    userGrades = studentSnap.data().grades || userGrades;
                }
                renderCourses(username, isTeacher, settings, userGrades);
            });
        } else {
            renderCourses(username, isTeacher, settings, {});
        }
    });
}

// 3. Müəllim Paneli: Tələbələri Canlı Rejimdə (Realtime) Göstərmək
function listenStudentsRealtime() {
    const studentsCol = collection(db, "students");

    onSnapshot(studentsCol, (snapshot) => {
        const tbody = document.getElementById("student-list");
        tbody.innerHTML = "";

        const students = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (data.username.trim().toLowerCase() !== TEACHER_USERNAME.toLowerCase()) {
                students.push(data);
            }
        });

        if (students.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Hələ heç bir tələbə sistemə daxil olmayıb.</td></tr>`;
            return;
        }

        // Dərs aktivliyi statusunu öyrənmək üçün
        getDoc(doc(db, "settings", "portal")).then(settingsSnap => {
            const lessonActive = settingsSnap.exists() ? settingsSnap.data().lessonActive : false;

            students.forEach(studentData => {
                const student = studentData.username;
                const studentGrades = studentData.grades || { lesson1: "-", lesson2: "-" };

                const tr = document.createElement("tr");

                // 1. Tələbə Adı
                const tdStudent = document.createElement("td");
                const bStudent = document.createElement("b");
                bStudent.textContent = student;
                tdStudent.appendChild(bStudent);

                // 2. Dərs Statusu Düyməsi
                const tdStatus = document.createElement("td");
                const btnToggle = document.createElement("button");
                btnToggle.className = `btn-toggle ${lessonActive ? 'btn-active' : 'btn-passive'}`;
                btnToggle.textContent = lessonActive ? 'Aktivdir' : 'Deaktivdir';
                btnToggle.addEventListener("click", () => toggleLesson(!lessonActive));
                tdStatus.appendChild(btnToggle);

                // 3. 1-ci Dərs Qiyməti
                const tdG1 = document.createElement("td");
                const inputG1 = document.createElement("input");
                inputG1.type = "text";
                inputG1.className = "grade-input";
                inputG1.value = studentGrades.lesson1;
                inputG1.id = `g1-${student}`;
                tdG1.appendChild(inputG1);

                // 4. 2-ci Dərs Qiyməti
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

                tr.appendChild(tdStudent);
                tr.appendChild(tdStatus);
                tr.appendChild(tdG1);
                tr.appendChild(tdG2);
                tr.appendChild(tdSave);

                tbody.appendChild(tr);
            });
        });
    });
}

// Dərs Statusunu Dəyişmək (Firebase-də yenilənir)
async function toggleLesson(newState) {
    const settingsRef = doc(db, "settings", "portal");
    await setDoc(settingsRef, { lessonActive: newState }, { merge: true });
}

// Qiyməti Yadda Saxlamaq (Firebase-də yenilənir)
async function saveGrade(student) {
    const g1 = document.getElementById(`g1-${student}`).value;
    const g2 = document.getElementById(`g2-${student}`).value;

    const studentRef = doc(db, "students", student);
    await setDoc(studentRef, {
        grades: { lesson1: g1, lesson2: g2 }
    }, { merge: true });

    alert(`${student} üçün qiymətlər bazada yadda saxlanıldı!`);
}

// Dərsləri Ekranlaşdırmaq
function renderCourses(username, isTeacher, settings, myGrades) {
    const container = document.getElementById("courses-container");
    container.innerHTML = "";

    if (settings.lessonActive || isTeacher) {
        // 1-ci Dərs Kartı
        const card1 = document.createElement("div");
        card1.className = "course-card";

        const h3_1 = document.createElement("h3");
        h3_1.textContent = "HTML 1-ci Dərs";
        card1.appendChild(h3_1);

        const p1 = document.createElement("p");
        p1.textContent = "Dərs materialını aşağıdakı düymədən yükləyə bilərsiniz.";
        card1.appendChild(p1);

        if (!isTeacher) {
            const pGrade1 = document.createElement("p");
            pGrade1.style.marginTop = "10px";
            
            const bGrade1 = document.createElement("b");
            bGrade1.textContent = "Qiymətiniz: ";
            pGrade1.appendChild(bGrade1);
            
            const gradeSpan1 = document.createElement("span");
            gradeSpan1.textContent = myGrades.lesson1 || "-";
            pGrade1.appendChild(gradeSpan1);
            
            card1.appendChild(pGrade1);
        }

        const btnDownload = document.createElement("a");
        btnDownload.href = settings.pdfUrl || "cpp.pdf";
        btnDownload.download = "";
        btnDownload.className = "btn-download";
        btnDownload.textContent = "PDF Yüklə";
        card1.appendChild(btnDownload);

        // 2-ci Dərs Kartı
        const card2 = document.createElement("div");
        card2.className = "course-card";

        const h3_2 = document.createElement("h3");
        h3_2.textContent = "HTML 2-ci Dərs";
        card2.appendChild(h3_2);

        const p2 = document.createElement("p");
        p2.textContent = "Dərs materialı hazırlıq mərhələsindədir.";
        card2.appendChild(p2);

        if (!isTeacher) {
            const pGrade2 = document.createElement("p");
            pGrade2.style.marginTop = "10px";

            const bGrade2 = document.createElement("b");
            bGrade2.textContent = "Qiymətiniz: ";
            pGrade2.appendChild(bGrade2);

            const gradeSpan2 = document.createElement("span");
            gradeSpan2.textContent = myGrades.lesson2 || "-";
            pGrade2.appendChild(gradeSpan2);

            card2.appendChild(pGrade2);
        }

        container.appendChild(card1);
        container.appendChild(card2);

    } else {
        const cardPassive = document.createElement("div");
        cardPassive.className = "course-card";

        const h3 = document.createElement("h3");
        h3.textContent = "HTML Dərsləri";
        cardPassive.appendChild(h3);

        const p = document.createElement("p");
        p.style.color = "#86efac";
        p.textContent = "Hələ Məllim Tərəfindən Aktiv Edilməyib!";
        cardPassive.appendChild(p);

        container.appendChild(cardPassive);
    }
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
