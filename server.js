const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

const users = [
    { username: "NurgunF", password: "N6gunTVT23" },
    { username: "SenanPS", password: "Sena4nCatssep" },
    { username: "NermenSD", password: "Nerm3nOP90" },
    { username: "Ayseen", password: "Ays4nPreps132" },
    { username: "Ulvid", password: "Ulv3Braku1378" },
    { username: "Aytac0", password: "Ayt4cJUKte34" },
    { username: "T0T", password: "T0T" }
];

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const foundUser = users.find(u => u.username === username && u.password === password);

    if (foundUser) {
        res.json({ success: true, username: foundUser.username });
    } else {
        res.status(401).json({ success: false, message: "İstifadəçi adı və ya şifrə yanlışdır!" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server uğurla işə düşdü: http://localhost:${PORT}`);
});
