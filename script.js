import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    onSnapshot, 
    collection 
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
        listenStudentsRealtime();
    } else {
        document.getElementById("role-badge").textContent = "(Tələbə)";
        await registerStudentToFirebase(currentUser);
    }

    // Kod Laboratoriyasını aktivləşdiririk
    initCodePlayground();

    // Çıxış Düyməsi
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
});

// 1. HTML/CSS Canlı Önizləmə (Playground) Funksiyası
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

// 2. Tələbəni Firebase Firestore-a Qeyd Etmək
async function registerStudentToFirebase(username) {
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

// 3. Müəllim Paneli: Tələbələri Canlı Rejimdə (Firebase-dən) Oxumaq
function listenStudentsRealtime() {
    const studentsCol = collection(db, "students");

    onSnapshot(studentsCol, (snapshot) => {
        const tbody = document.getElementById("student-list");
        tbody.innerHTML = "";

        const students = [];
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (data.username && data.username.trim().toLowerCase() !== TEACHER_USERNAME.toLowerCase()) {
                students.push(data);
            }
        });

        if (students.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Hələ heç bir tələbə sistemə daxil olmayıb.</td></tr>`;
            return;
        }

        getDoc(doc(db, "settings", "portal")).then(settingsSnap => {
            const lessonActive = settingsSnap.exists() ? settingsSnap.data().lessonActive : false;

            students.forEach(studentData => {
                const student = studentData.username;
                const studentGrades = studentData.grades || { lesson1: "-", lesson2: "-", lesson3: "-" };

                const tr = document.createElement("tr");

                // Tələbə Adı
                const tdStudent = document.createElement("td");
                const bStudent = document.createElement("b");
                bStudent.textContent = student;
                tdStudent.appendChild(bStudent);

                // Dərs Statusu
                const tdStatus = document.createElement("td");
                const btnToggle = document.createElement("button");
                btnToggle.className = `btn-toggle ${lessonActive ? 'btn-active' : 'btn-passive'}`;
                btnToggle.textContent = lessonActive ? 'Aktivdir' : 'Deaktivdir';
                btnToggle.addEventListener("click", () => toggleLesson(!lessonActive));
                tdStatus.appendChild(btnToggle);

                // Dərs 1
                const tdG1 = createGradeInput(`g1-${student}`, studentGrades.lesson1);
                // Dərs 2
                const tdG2 = createGradeInput(`g2-${student}`, studentGrades.lesson2);
                // Dərs 3
                const tdG3 = createGradeInput(`g3-${student}`, studentGrades.lesson3);

                // Yadda Saqla Düyməsi
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
                tr.appendChild(tdG3);
                tr.appendChild(tdSave);

                tbody.appendChild(tr);
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

// Qiyməti Yadda Saxlamaq
async function saveGrade(student) {
    const g1 = document.getElementById(`g1-${student}`).value;
    const g2 = document.getElementById(`g2-${student}`).value;
    const g3 = document.getElementById(`g3-${student}`).value;

    const studentRef = doc(db, "students", student);
    await setDoc(studentRef, {
        grades: { lesson1: g1, lesson2: g2, lesson3: g3 }
    }, { merge: true });

    alert(`${student} üçün Dərs 1, 2 və 3 qiymətləri yadda saxlanıldı!`);
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
