//script.js
// 男性・女性音声の変数定義とデフォルトの音声タイプ設定
let maleVoice = null;
let femaleVoice = null;
let currentVoiceType = 'default';

// 利用可能な音声一覧を取得し、指定の日本語音声をフィルタリング
function setVoices() {
  const voices = speechSynthesis.getVoices();
  maleVoice = voices.find(v => v.name.includes("Otoya") || v.name.includes("Ichiro")); // 男性音声
  femaleVoice = voices.find(v => v.name.includes("Kyoko") || v.name.includes("Haruka") || v.name.includes("Google 日本語")); // 女性音声
}
speechSynthesis.onvoiceschanged = setVoices; // 音声リストが更新されたときにsetVoicesを実行

// 各種変数初期化
let allQuestions = []; // Excelから読み込んだすべての質問
let currentQuestion = null; // 現在の質問
let recognizing = false; // 音声認識中かどうか
let recognition; // 音声認識オブジェクト
let questionCount = 0; // 出題された質問の数
const maxQuestions = 6; // 最大質問数
const micBtn = document.getElementById('micBtn'); // マイクボタン
const questionBox = document.getElementById('questionBox'); // 質問表示領域
const answerText = document.getElementById('answerText'); // 回答表示領域
const exportBtn = document.getElementById('exportBtn'); // Excel出力ボタン
const answers = []; // 質問・回答履歴の配列


// 初期状態では micBtn を無効化
micBtn.disabled = `none`;

// 面接開始ボタンの処理
const startBtn = document.getElementById('startInterviewBtn');
startBtn.addEventListener('click', () => {
  micBtn.disabled = false;
  questionBox.disabled = `false`;
  startBtn.style.display = 'none'; // ボタンを非表示にする
  showRandomQuestion(); // 最初の質問を表示して読み上げ
});


// カメラを起動し、video要素にストリームを設定
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    document.getElementById('video').srcObject = stream;
  });

// URLパラメータからユーザー名を取得（ファイル名などに使用）
function getUsernameFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('username') || 'unknown_user';
}

// Excelファイル(AImensetushu.xlsx)から質問・深掘り情報を読み込む（B列とC列）
fetch('AImensetushu.xlsx')
  .then(response => response.arrayBuffer())
  .then(data => {
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    allQuestions = json
      .filter(row => row[1]) // 質問列がある行だけ抽出
      .map(row => ({
        question: row[1],
        followup: row[2] || ''
      }));
    
  });

// 質問文を音声で読み上げる関数
function speakTextFromQuestionBox() {
  const text = questionBox.textContent.trim();
  if (!text) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';

  if (currentVoiceType === 'male' && maleVoice) {
    utterance.voice = maleVoice;
  } else if (currentVoiceType === 'female' && femaleVoice) {
    utterance.voice = femaleVoice;
  }

  speechSynthesis.speak(utterance); // 読み上げ開始
}

// ランダムに質問を表示し、音声で読み上げる
function showRandomQuestion() {
  if (questionCount >= maxQuestions) {
    questionBox.innerHTML = "<strong>以上で面接を終わります。</strong>";
    micBtn.disabled = true;
    document.getElementById('restartBtn').style.display = 'inline-block';
    return;
  }

  if (allQuestions.length === 0) {
    questionBox.innerHTML = "<strong>質問がありません。</strong>"; // 質問が尽きた場合のメッセージ
    micBtn.disabled = true;
    document.getElementById('restartBtn').style.display = 'inline-block';
    return;
  }

  const index = Math.floor(Math.random() * allQuestions.length);
  const item = allQuestions[index];
  currentQuestion = item;

  // 選択された質問をallQuestionsから削除
  allQuestions.splice(index, 1);

  questionBox.innerHTML = `<div><strong></strong> ${item.question}</div>`;
  speakTextFromQuestionBox();

  answerText.textContent = '';
  currentQuestion.followupShown = false;
  currentQuestion.followupAnswered = false;
  questionCount++;
}

// 音声認識機能（Chrome限定のwebkitSpeechRecognition）を設定
if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = 'ja-JP';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    answerText.textContent = `回答： ${text}`;

    if (!currentQuestion.followupShown) {
      answers.push({
        question: currentQuestion,
        answer: text,
        followupAnswer: ''
      });

      // 深掘り質問の表示と読み上げ
      const followups = currentQuestion.followup?.split(/[\u3001\u3002]/).filter(f => f.trim()) || [];
      const selectedFollowups = followups.slice(0, 2);

      if (selectedFollowups.length > 0) {
        questionBox.innerHTML = selectedFollowups.map(f => `<div><strong></strong> ${f}</div>`).join('');
        speakTextFromQuestionBox();
      }

      currentQuestion.followupShown = true;
    } else {
      const lastAnswer = answers[answers.length - 1];
      if (lastAnswer) {
        lastAnswer.followupAnswer = text;
      }
      currentQuestion.followupAnswered = true;
    }

    exportBtn.style.display = 'inline-block';
    recognizing = false;
    micBtn.textContent = '🎤 マイクで答える';
  };

  recognition.onend = () => {
    if (!recognizing && currentQuestion && currentQuestion.followupAnswered) {
      currentQuestion.followupAnswered = false;
      setTimeout(() => {
        showRandomQuestion(); // 次の質問に進む
      }, 1000);
    }
  };
} else {
  micBtn.disabled = true;
  alert("このブラウザは音声認識に対応していません。Google Chrome をご利用ください。");
}

// マイクボタンのクリックで音声認識の開始/停止を切り替え
micBtn.addEventListener('click', () => {
  if (recognizing) {
    recognition.stop();
    micBtn.textContent = '🎤 マイクで答える';
    recognizing = false;
  } else {
    recognition.start();
    micBtn.textContent = '🛑 話し終えたらもう一度押してください';
    recognizing = true;
  }
});
// AIフィードバック生成APIを呼び出す関数
async function generateFeedback(question, answer) {
  const res = await fetch('http://localhost:3000/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer }),
  });
  if (!res.ok) {
    throw new Error('API呼び出しエラー');
  }
  const data = await res.json();
  return data.feedback;
}

// エクスポートボタンの処理
exportBtn.addEventListener('click', async () => {
  const spinner = document.getElementById('loadingSpinner');
  spinner.style.display = 'block';
  questionBox.style.display = 'none';
  answerText.style.display = 'none';

  try {
    const username = getUsernameFromURL();
    const enrichedAnswers = [];

    for (const a of answers) {
      const question = a.question?.question || '';
      const answer = a.answer || '';
      const followup = a.question?.followup || '';
      const followupAnswer = a.followupAnswer || '';
      const feedback = a.feedback || await generateFeedback(question, answer);

      let intent = '', evaluation = '', advice = '';
      const feedbackParts = feedback.split(/\d+\.\s/).map(p => p.trim()).filter(Boolean);
      for (const part of feedbackParts) {
        if (part.startsWith("質問の意図")) intent = part.replace(/^質問の意図\s*/, '');
        else if (part.startsWith("回答の評価")) evaluation = part.replace(/^回答の評価\s*/, '');
        else if (part.startsWith("総合フィードバックと改善アドバイス")) advice = part.replace(/^総合フィードバックと改善アドバイス\s*/, '');
      }

      enrichedAnswers.push({
        question: { question, followup },
        answer,
        followupAnswer,
        intent,
        evaluation,
        advice
      });
    }

    const response = await fetch('http://localhost:3000/exportWord', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, answers: enrichedAnswers })
    });

    if (!response.ok) throw new Error('Wordファイル生成に失敗しました');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${username}_面接対策.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();

  } catch (err) {
    console.error('Word保存エラー:', err);
  } finally {
    spinner.style.display = 'none';
    questionBox.style.display = 'block';
    answerText.style.display = 'block';
  }
});


// 面接官画像と声の切り替え処理
const maleBtn = document.getElementById('maleBtn');
const femaleBtn = document.getElementById('femaleBtn');
const video = document.getElementById('video');
const image = document.getElementById('interviewerImage');

// 面接官画像を表示してWebカメラ映像を小さく表示
function showInterviewer(imageSrc) {
  image.src = imageSrc;
  image.style.display = 'block';
  image.style.zIndex = '5';
  video.classList.add('small');
  video.style.zIndex = '1000';
}

maleBtn.addEventListener('click', () => {
  showInterviewer('pictures/mensetukan.jpeg');
  currentVoiceType = 'male';
});

femaleBtn.addEventListener('click', () => {
  showInterviewer('pictures/mensetukan2.png');
  currentVoiceType = 'female';
});

// 面接官モードのON/OFF切り替え
const toggleBtn = document.getElementById('toggleInterviewerBtn');
const optionsBox = document.getElementById('interviewerOptions');
let interviewerMode = false;

toggleBtn.addEventListener('click', () => {
  interviewerMode = !interviewerMode;
  if (interviewerMode) {
    toggleBtn.textContent = '👤 面接官なし';
    optionsBox.style.display = 'block';
  } else {
    toggleBtn.textContent = '👤 面接官あり';
    optionsBox.style.display = 'none';
    image.style.display = 'none';
    video.classList.remove('small');
    currentVoiceType = 'default';
  }
});

// 面接の再スタート処理
const restartBtn = document.getElementById('restartBtn');
restartBtn.addEventListener('click', () => {
  // 状態リセット
  questionCount = 0;
  answers.length = 0;
  currentQuestion = null; // currentQuestionもリセット
  micBtn.disabled = false;
  restartBtn.style.display = 'none';
  answerText.textContent = '';
  questionBox.innerHTML = '';

  // allQuestionsを再読み込みする
  fetch('AImensetushu.xlsx')
    .then(response => response.arrayBuffer())
    .then(data => {
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      allQuestions = json
        .filter(row => row[1])
        .map(row => ({
          question: row[1],
          followup: row[2] || ''
        }));
      // 新しい質問を表示
      showRandomQuestion();
    });
});

// 操作説明モーダル表示処理
document.getElementById("operation").addEventListener("click", function() {
  document.getElementById("operationModal").style.display = "block";
  event.stopPropagation();
});

document.getElementById("closeModal").addEventListener("click", function() {
  document.getElementById("operationModal").style.display = "none";
});

// モーダル内のクリックはイベント伝播を防止
document.querySelector(".modal-content").addEventListener("click", function(event) {
  event.stopPropagation();
});

// モーダルの外側クリックで閉じる
window.addEventListener("click", function(event) {
  const modal = document.getElementById("operationModal");
  const modalContent = document.querySelector(".modal-content");

  if (modal.style.display === "block" && !modalContent.contains(event.target)) {
    modal.style.display = "none";
  }
});

// ユーザー名を取得してアイコンに表示
window.addEventListener('DOMContentLoaded', () => {
  const username = getUsernameFromURL();   // URLからユーザー名を取得
  const filename = `${username}`; // ファイル名に使用する
  const label = document.getElementById('usernameLabel'); // ユーザー名を表示するラベル要素を取得

  // ラベルが存在する場合、ユーザー名を設定
  if (label) {
    label.textContent = filename;    // ラベルにユーザー名を設定
    const container = document.querySelector('.circle-container');   // ユーザー名ラベルの親要素を取得
    
    // adjustFontSizeToFit(container, label);   // ラベルのフォントサイズを調整
  }
});


const calendarBtn = document.getElementById('calendarBtn'); // カレンダーボタン
const calendarInput = document.getElementById('calendarInput'); // カレンダー入力フィールド
const daysRemaining = document.getElementById('daysRemaining'); // 残り日数表示要素
calendarInput.style.display = 'none';


function saveInterviewDateToServer(username, dateStr) {
  fetch('/updateInterviewDate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, interview_date: dateStr })
  })
  .then(res => res.json())
  .then(data => {
    console.log('面接日保存結果:', data);
  })
  .catch(err => {
    console.error('面接日保存エラー:', err);
  });
}

// ユーザー名に基づいて面接日を localStorage に保存
function saveInterviewDate(username, dateStr) {
  localStorage.setItem(`interviewDate_${username}`, dateStr);
}

// ユーザー名に基づいて保存された面接日を取得
function loadInterviewDate(username) {
  return localStorage.getItem(`interviewDate_${username}`);
}


// 日数を計算して表示
function updateDaysRemaining(dateStr) {
  const selectedDate = new Date(dateStr);
  const today = new Date();
  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((selectedDate - today) / (1000 * 60 * 60 * 24));

  daysRemaining.style.display = 'block';
  if (diffDays >= 0) {
    daysRemaining.textContent = `面接まであと ${diffDays} 日`;
  } else {
    daysRemaining.textContent = `面接日は過ぎています`;
  }
}
function fetchInterviewDateFromServer(username) {
  fetch(`/interviewDate/${username}`)
    .then(res => res.json())
    .then(data => {
      if (data.interview_date) {
        calendarInput.value = data.interview_date;
        updateDaysRemaining(data.interview_date);
      }
    })
    .catch(err => {
      console.error('サーバーから面接日取得エラー:', err);
    });
}




// 初期化：保存済み面接日があれば表示
window.addEventListener('DOMContentLoaded', () => {
  const username = getUsernameFromURL();

  // ローカル保存された日付を表示
  const savedDate = loadInterviewDate(username);
  if (savedDate) {
    calendarInput.value = savedDate;
    updateDaysRemaining(savedDate);
  }

  // サーバーからも日付を取得して表示
  fetchInterviewDateFromServer(username);
});


// カレンダー選択時の処理
calendarBtn.addEventListener('click', () => {
  calendarInput.style.display = 'block';
});

calendarInput.addEventListener('change', () => {
  const selectedDate = calendarInput.value;
  const username = getUsernameFromURL();
  if (selectedDate) {
    saveInterviewDate(username, selectedDate); // localStorage に保存
    saveInterviewDateToServer(username, selectedDate); // サーバーにも保存
    updateDaysRemaining(selectedDate); // 表示更新
    calendarInput.style.display = 'none';
  }
});