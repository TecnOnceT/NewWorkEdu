import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    onSnapshot 
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

// 📌 BURAYA TƏLƏBƏLƏRİN SİYAHISINI YAZIN (Login siyahısı kimi istifadə olunur)
const STUDENT_LIST = [
    "Ali Mammadov",
    "Leyla Aliyeva",
    "Rashad Huseynov",
    "Nigar Ahmedova",
    "Elvin Qasimov"
];

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
        
        // Siyahıdakı tələbələri Firebase-də mövcudluğunu yoxlayıb yaradırıq
        await initializeStudentsInFirebase();
        // Müəllim üçün tələbələri canlı olaraq Firebase-dən izləyirik
        listenStudentsRealtime();
    } else {
        document.getElementById("role-badge").textContent = "(Tələbə)";
        await registerSingleStudentToFirebase(currentUser);
    }

    // Kod Laboratoriyasını (Playground) başladırıq
    initCodePlayground();

    // Çıxış düyməsi
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
});

// 1. HTML və CSS Canlı Redaktor
function initCodePlayground() {
    const htmlCode = document.getElementById("html-code");
    const cssCode = document.getElementById("css-code");
    const preview = document.getElementById("code-preview");

    function updatePreview() {
        const html = htmlCode.value;
        const css = `<style>${cssCode.value}</style>`;
        const content = html + css;

        const accessDoc = preview.contentDocument || preview.contentWindow.document;
        accessDoc.open();
        accessDoc.write(content);
        accessDoc.close();
    }

    htmlCode.addEventListener("input", updatePreview);
    cssCode.addEventListener("input", updatePreview);
}

// 2. Siyahıdakı Şagirdləri Firebase Firestore-a Yükləmək
async function initializeStudentsInFirebase() {
    for (const studentName of STUDENT_LIST) {
        await registerSingleStudentToFirebase(studentName);
    }
}

async function registerSingleStudentToFirebase(username) {
    const studentRef = doc(db, "students", username);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
        await setDoc(studentRef, {
            username: username,
            grades: { lesson1: "-", lesson2: "-", lesson3: "-" },
            createdAt: new Date()
        });
    }
}

// 3. Müəllim Paneli: Siyahıdakı Şagirdləri Firebase-dən Canlı Dinləmək
function listenStudentsRealtime() {
    const settingsRef = doc(db, "settings", "portal");

    onSnapshot(settingsRef, (settingsSnap) => {
        const lessonActive = settingsSnap.exists() ? settingsSnap.data().lessonActive : false;
        const tbody = document.getElementById("student-list");
        tbody.innerHTML = "";

        STUDENT_LIST.forEach(studentName => {
            const studentRef = doc(db, "students", studentName);

            onSnapshot(studentRef, (studentSnap) => {
                let studentGrades = { lesson1: "-", lesson2: "-", lesson3: "-" };
                if (studentSnap.exists()) {
                    studentGrades = studentSnap.data().grades || studentGrades;
                }

                let existingRow = document.getElementById(`row-${studentName}`);
                if (!existingRow) {
                    existingRow = document.createElement("tr");
                    existingRow.id = `row-${studentName}`;
                    tbody.appendChild(existingRow);
                }

                existingRow.innerHTML = "";

                // Tələbə Adı
                const tdStudent = document.createElement("td");
                const bStudent = document.createElement("b");
                bStudent.textContent = studentName;
                tdStudent.appendChild(bStudent);

                // Dərs Statusu
                const tdStatus = document.createElement("td");
                const btnToggle = document.createElement("button");
                btnToggle.className = `btn-toggle ${lessonActive ? 'btn-active' : 'btn-passive'}`;
                btnToggle.textContent = lessonActive ? 'Aktivdir' : 'Deaktivdir';
                btnToggle.addEventListener("click", () => toggleLesson(!lessonActive));
                tdStatus.appendChild(btnToggle);

                // Dərs 1, 2, 3 Qiymət Xanaları
                const tdG1 = createGradeInput(`g1-${studentName}`, studentGrades.lesson1);
                const tdG2 = createGradeInput(`g2-${studentName}`, studentGrades.lesson2);
                const tdG3 = createGradeInput(`g3-${studentName}`, studentGrades.lesson3);

                // Yadda Saqla Düyməsi
                const tdSave = document.createElement("td");
                const btnSave = document.createElement("button");
                btnSave.className = "btn-danger";
                btnSave.style.padding = "4px 10px";
                btnSave.textContent = "Yadda Saqla";
                btnSave.addEventListener("click", () => saveGrade(studentName));
                tdSave.appendChild(btnSave);

                existingRow.appendChild(tdStudent);
                existingRow.appendChild(tdStatus);
                existingRow.appendChild(tdG1);
                existingRow.appendChild(tdG2);
                existingRow.appendChild(tdG3);
                existingRow.appendChild(tdSave);
            });
        });
    });
}

function createGradeInput(id, value) {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = "text";
    input.className = "grade-input";
    input.value = value || "-";
    input.id = id;
    td.appendChild(input);
    return td;
}

// Dərs Statusunu Dəyişmək
async function toggleLesson(newState) {
    const settingsRef = doc(db, "settings", "portal");
    await setDoc(settingsRef, { lessonActive: newState }, { merge: true });
}

// Qiymətləri Firebase-ə Yazmaq
async function saveGrade(studentName) {
    const g1 = document.getElementById(`g1-${studentName}`).value;
    const g2 = document.getElementById(`g2-${studentName}`).value;
    const g3 = document.getElementById(`g3-${studentName}`).value;

    const studentRef = doc(db, "students", studentName);
    await setDoc(studentRef, {
        grades: { lesson1: g1, lesson2: g2, lesson3: g3 }
    }, { merge: true });

    alert(`${studentName} üçün Dərs 1, 2 və 3 qiymətləri Firebase-də yadda saxlanıldı!`);
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
