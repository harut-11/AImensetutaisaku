// server.js
const express = require('express');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const fs = require('fs');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { generateFeedback } = require('./aiFeedback');

const app = express();
const port = 3000;
const USERS_FILE = './users.txt';

// ミドルウェア設定
app.use(cors()); // クロスオリジン許可（開発用）
app.use(express.json());
app.use(express.static(__dirname)); // 静的ファイル配信（loginPage.htmlなど）

// ユーザーファイル初期化
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, '[]');
}

// ユーザー登録API
app.post('/register', async (req, res) => {
  const { username, password, interview_date } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FILE));
  // ユーザー名の重複チェック
  if (users.find(user => user.username === username)) {
    return res.json({ message: 'このユーザー名はすでに使われています。' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword, interview_date });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ message: '登録が完了しました！' });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FILE));

  const user = users.find(user => user.username === username);
  if (!user) return res.json({ message: 'ユーザーが見つかりません。' });

  const match = await bcrypt.compare(password, user.password);
  if (match) {
    res.json({ message: 'ログイン成功' });
  } else {
    res.json({ message: 'パスワードが違います。' });
  }
});


// 面接日更新API
app.post('/updateInterviewDate', (req, res) => {
  const { username, interview_date } = req.body;
  const users = JSON.parse(fs.readFileSync(USERS_FILE));
  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ message: 'ユーザーが見つかりません。' });
  user.interview_date = interview_date;
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ message: '面接日を更新しました。' });
});


app.get('/interviewDate/:username', (req, res) => {
  const username = req.params.username;
  const users = JSON.parse(fs.readFileSync(USERS_FILE));
  const user = users.find(u => u.username === username);
  if (!user || !user.interview_date) {
    return res.status(404).json({ message: '面接日が見つかりません。' });
  }

  const today = new Date();
  const interviewDate = new Date(user.interview_date);
  const diffDays = Math.ceil((interviewDate - today) / (1000 * 60 * 60 * 24));
  res.json({ username, interview_date: user.interview_date, days_remaining: diffDays });
});


// AIフィードバック生成API
app.post('/api/feedback', async (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: '質問と回答は必須です。' });
  }

  try {
    const feedback = await generateFeedback(question, answer);
    res.json({ feedback });
  } catch (err) {
    console.error('AIフィードバック生成エラー:', err);
    res.status(500).json({ error: 'フィードバック生成中にエラーが発生しました。' });
  }
});

// Wordファイル生成API
app.post('/exportWord', async (req, res) => {
  const { username, answers } = req.body;

  const doc = new Document({
    creator: username || 'AImensetutaisaku',
    title: `${username}_面接対策`,
    description: '面接対策フィードバック',
    sections: [{
      children: [
        new Paragraph({
          children: [new TextRun({ text: "面接対策フィードバック", bold: true, size: 28 })],
        }),
        ...answers.flatMap((a, index) => [
          new Paragraph({ text: '' }),
          new Paragraph({ text: `
質問 ${index + 1}`, heading: "HEADING_2" }),
          new Paragraph({ text: `質問: ${a.question?.question || ''}` }),
          new Paragraph({ text: `回答: ${a.answer || ''}` }),
          new Paragraph({ text: `深掘り質問: ${a.question?.followup || ''}` }),
          new Paragraph({ text: `深掘り回答: ${a.followupAnswer || ''}` }),
          new Paragraph({ text: `
フィードバック`, heading: "HEADING_3" }),
          new Paragraph({
            children: [
              new TextRun({ text:"質問の意図", bold: true, size: 28 }),
              new TextRun({ text: a.intent || '', break: 1 })
             
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "回答の評価", bold: true, size: 28 }), 
              new TextRun({ text: a.evaluation || '', break: 1 }) 
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text:"総合フィードバックと改善アドバイス", bold: true, size: 28 }),
              new TextRun({ text: a.advice || '', break: 1 })
            ]
          }),
        ])
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  const filePath = `${__dirname}/${username}_面接対策.docx`;
  require('fs').writeFileSync(filePath, buffer);
  res.download(filePath);
});


// ルートはloginPage.htmlを返す
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/loginPage.html');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/loginPage.html`);
});

