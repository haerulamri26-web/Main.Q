'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const uploadSchema = z.object({
  title: z.string().min(3, 'Judul minimal harus 3 karakter.'),
  description: z.string().optional(),
  class: z.string({
    required_error: 'Silakan pilih kelas.',
  }),
  subject: z.string({
    required_error: 'Silakan pilih mata pelajaran.',
  }),
  htmlCode: z.string().min(1, 'Kode HTML tidak boleh kosong.'),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

const defaultHtmlCode = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quiz Matematika - Real-time Leaderboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 800px;
            width: 100%;
            padding: 40px;
            animation: slideIn 0.5s ease-out;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        h1 {
            color: #667eea;
            text-align: center;
            margin-bottom: 30px;
            font-size: 2em;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            color: #333;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 0.95em;
        }

        input, select {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 1em;
            transition: all 0.3s;
        }

        input:focus, select:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        button {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1.1em;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        button:active {
            transform: translateY(0);
        }

        button:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
        }

        .quiz-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 15px;
        }

        .question-counter {
            background: #667eea;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-weight: 600;
        }

        .timer {
            background: #ff6b6b;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 1.2em;
            min-width: 100px;
            text-align: center;
        }

        .timer.warning {
            animation: pulse 0.5s infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        .score-display {
            background: #51cf66;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-weight: 600;
        }

        .question-box {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 25px;
            border-left: 5px solid #667eea;
        }

        .question-text {
            font-size: 1.2em;
            color: #333;
            font-weight: 600;
            margin-bottom: 20px;
        }

        .options {
            display: grid;
            gap: 12px;
        }

        .option {
            padding: 15px 20px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            background: white;
        }

        .option:hover {
            border-color: #667eea;
            background: #f0f4ff;
            transform: translateX(5px);
        }

        .option.selected {
            border-color: #667eea;
            background: #667eea;
            color: white;
        }

        .option.correct {
            border-color: #51cf66;
            background: #51cf66;
            color: white;
        }

        .option.incorrect {
            border-color: #ff6b6b;
            background: #ff6b6b;
            color: white;
        }

        .option.disabled {
            cursor: not-allowed;
            opacity: 0.6;
        }
        
        .result-box {
            text-align: center;
            padding: 30px;
        }

        .result-score {
            font-size: 3em;
            color: #667eea;
            font-weight: 700;
            margin: 20px 0;
        }

        .result-message {
            font-size: 1.2em;
            color: #666;
            margin-bottom: 30px;
        }

        .hidden {
            display: none;
        }

        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e0e0e0;
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 20px;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            transition: width 0.3s ease;
        }

        @media (max-width: 600px) {
            .container {
                padding: 20px;
            }

            h1 {
                font-size: 1.5em;
            }

            .quiz-header {
                flex-direction: column;
                align-items: stretch;
            }

            .question-text {
                font-size: 1em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Registration Form -->
        <div id="registrationScreen">
            <h1>📐 Quiz Matematika</h1>
            <p style="text-align: center; color: #666; margin-bottom: 30px;">
                Masukkan data Anda untuk memulai quiz
            </p>
            <form id="registrationForm">
                <div class="form-group">
                    <label for="playerName">Nama Lengkap *</label>
                    <input type="text" id="playerName" required placeholder="Contoh: Ahmad Rizki">
                </div>
                <div class="form-group">
                    <label for="playerClass">Kelas *</label>
                    <input type="text" id="playerClass" required placeholder="Contoh: X IPA 1">
                </div>
                <div class="form-group">
                    <label for="playerSchool">Nama Sekolah *</label>
                    <input type="text" id="playerSchool" required placeholder="Contoh: SMA Negeri 1 Jakarta">
                </div>
                <button type="submit">Mulai Quiz 🚀</button>
            </form>
        </div>

        <!-- Quiz Screen -->
        <div id="quizScreen" class="hidden">
            <div class="quiz-header">
                <div class="question-counter">
                    <span id="currentQuestion">1</span> / <span id="totalQuestions">15</span>
                </div>
                <div class="timer" id="timer">60</div>
                <div class="score-display">
                    Skor: <span id="currentScore">0</span>
                </div>
            </div>

            <div class="progress-bar">
                <div class="progress-fill" id="progressBar"></div>
            </div>

            <div class="question-box">
                <div class="question-text" id="questionText">Loading...</div>
                <div class="options" id="optionsContainer"></div>
            </div>

            <button id="nextButton" class="hidden">Lanjut ke Soal Berikutnya</button>
        </div>

        <!-- Result Screen -->
        <div id="resultScreen" class="hidden">
            <div class="result-box">
                <h1>🎉 Quiz Selesai!</h1>
                <div class="result-score" id="finalScore">0</div>
                <div class="result-message" id="resultMessage"></div>
                <button id="playAgainButton">Main Lagi</button>
            </div>
        </div>
    </div>
    
    <script>
        // ===== QUESTION BANK - 100 SOAL MATEMATIKA =====
        const questionBank = [
            // ARITMATIKA & OPERASI DASAR
            { question: "Berapakah hasil dari 15 + 27?", options: ["40", "42", "43", "45"], correct: 1 },
            { question: "Berapakah hasil dari 7 × 8?", options: ["54", "56", "58", "60"], correct: 1 },
            { question: "Berapakah akar kuadrat dari 144?", options: ["10", "11", "12", "13"], correct: 2 },
            { question: "Berapakah 100 - 37?", options: ["63", "64", "73", "74"], correct: 0 },
            { question: "Berapakah 9 × 9?", options: ["72", "81", "90", "99"], correct: 1 },
            { question: "Berapakah hasil dari 144 ÷ 12?", options: ["10", "11", "12", "13"], correct: 2 },
            { question: "Berapakah 25 × 4?", options: ["90", "95", "100", "105"], correct: 2 },
            { question: "Berapakah hasil dari 0.5 × 100?", options: ["5", "50", "500", "5000"], correct: 1 },
            { question: "Berapakah 60 menit dalam detik?", options: ["600", "1800", "3600", "6000"], correct: 2 },
            { question: "Berapakah hasil dari 1000 ÷ 25?", options: ["30", "35", "40", "45"], correct: 2 },
            
            // PERSENTASE & PECAHAN
            { question: "Berapakah 15% dari 200?", options: ["20", "25", "30", "35"], correct: 2 },
            { question: "Berapakah 20% dari 500?", options: ["50", "75", "100", "125"], correct: 2 },
            { question: "Berapakah 1/2 + 1/4?", options: ["1/6", "2/6", "3/4", "1/3"], correct: 2 },
            { question: "Berapakah 3/4 dari 80?", options: ["40", "50", "60", "70"], correct: 2 },
            { question: "Berapakah 10% dari 1000?", options: ["10", "50", "100", "200"], correct: 2 },
            { question: "Berapakah 1/5 dari 100?", options: ["15", "20", "25", "30"], correct: 1 },
            { question: "Berapakah 50% dari 250?", options: ["100", "125", "150", "175"], correct: 1 },
            { question: "Berapakah 2/3 dari 120?", options: ["60", "70", "80", "90"], correct: 2 },
            { question: "Berapakah 25% dari 800?", options: ["100", "150", "200", "250"], correct: 2 },
            { question: "Berapakah 1/8 dari 64?", options: ["6", "7", "8", "9"], correct: 2 },

            // EKSPONEN & AKAR
            { question: "Berapakah hasil dari 2³?", options: ["6", "8", "9", "12"], correct: 1 },
            { question: "Berapakah nilai π (pi) yang mendekati?", options: ["2.14", "3.14", "4.14", "5.14"], correct: 1 },
            { question: "Berapakah 5² + 3²?", options: ["30", "32", "34", "36"], correct: 2 },
            { question: "Berapakah akar kuadrat dari 81?", options: ["7", "8", "9", "10"], correct: 2 },
            { question: "Berapakah 10²?", options: ["20", "50", "100", "1000"], correct: 2 },
            { question: "Berapakah 4³?", options: ["12", "16", "48", "64"], correct: 3 },
            { question: "Berapakah akar kuadrat dari 225?", options: ["13", "14", "15", "16"], correct: 2 },
            { question: "Berapakah 3⁴?", options: ["12", "27", "64", "81"], correct: 3 },
            { question: "Berapakah 6²?", options: ["12", "24", "36", "48"], correct: 2 },
            { question: "Berapakah akar kuadrat dari 169?", options: ["11", "12", "13", "14"], correct: 2 },

            // ALJABAR SEDERHANA
            { question: "Jika x + 5 = 12, berapakah nilai x?", options: ["5", "6", "7", "8"], correct: 2 },
            { question: "Jika 2x = 20, berapakah nilai x?", options: ["5", "8", "10", "15"], correct: 2 },
            { question: "Jika x - 7 = 15, berapakah nilai x?", options: ["8", "15", "22", "25"], correct: 2 },
            { question: "Jika 3x = 27, berapakah nilai x?", options: ["6", "7", "8", "9"], correct: 3 },
            { question: "Jika x/4 = 5, berapakah nilai x?", options: ["15", "20", "25", "30"], correct: 1 },
            { question: "Jika x + 12 = 30, berapakah nilai x?", options: ["12", "15", "18", "20"], correct: 2 },
            { question: "Jika 5x = 45, berapakah nilai x?", options: ["7", "8", "9", "10"], correct: 2 },
            { question: "Jika x - 9 = 21, berapakah nilai x?", options: ["12", "24", "30", "36"], correct: 2 },
            { question: "Jika 4x = 48, berapakah nilai x?", options: ["10", "11", "12", "13"], correct: 2 },
            { question: "Jika x/5 = 8, berapakah nilai x?", options: ["30", "35", "40", "45"], correct: 2 },

            // GEOMETRI DASAR
            { question: "Jumlah sudut dalam segitiga adalah?", options: ["90°", "120°", "180°", "360°"], correct: 2 },
            { question: "Berapa banyak sisi pada segi enam?", options: ["4", "5", "6", "8"], correct: 2 },
            { question: "Luas persegi dengan sisi 5 cm adalah?", options: ["10 cm²", "20 cm²", "25 cm²", "30 cm²"], correct: 2 },
            { question: "Keliling persegi panjang dengan panjang 8 cm dan lebar 5 cm adalah?", options: ["13 cm", "20 cm", "26 cm", "40 cm"], correct: 2 },
            { question: "Berapa banyak diagonal pada persegi?", options: ["1", "2", "3", "4"], correct: 1 },
            { question: "Jumlah sudut dalam segiempat adalah?", options: ["180°", "270°", "360°", "450°"], correct: 2 },
            { question: "Luas lingkaran dengan jari-jari 7 cm (π = 22/7) adalah?", options: ["44 cm²", "88 cm²", "154 cm²", "308 cm²"], correct: 2 },
            { question: "Volume kubus dengan sisi 3 cm adalah?", options: ["9 cm³", "18 cm³", "27 cm³", "36 cm³"], correct: 2 },
            { question: "Keliling lingkaran dengan diameter 14 cm (π = 22/7) adalah?", options: ["22 cm", "33 cm", "44 cm", "66 cm"], correct: 2 },
            { question: "Luas trapesium dengan sisi sejajar 10 cm dan 6 cm, tinggi 4 cm adalah?", options: ["24 cm²", "32 cm²", "40 cm²", "64 cm²"], correct: 1 },

            // DERET & POLA
            { question: "Angka berikutnya dari deret 2, 4, 6, 8, ... adalah?", options: ["9", "10", "11", "12"], correct: 1 },
            { question: "Angka berikutnya dari deret 5, 10, 15, 20, ... adalah?", options: ["22", "24", "25", "30"], correct: 2 },
            { question: "Angka berikutnya dari deret 1, 4, 9, 16, ... adalah?", options: ["20", "21", "24", "25"], correct: 3 },
            { question: "Angka berikutnya dari deret 3, 6, 12, 24, ... adalah?", options: ["36", "40", "48", "50"], correct: 2 },
            { question: "Angka yang hilang dari deret 10, 20, ___, 40, 50 adalah?", options: ["25", "30", "35", "38"], correct: 1 },
            { question: "Angka berikutnya dari deret 1, 1, 2, 3, 5, 8, ... adalah?", options: ["11", "12", "13", "14"], correct: 2 },
            { question: "Angka berikutnya dari deret 100, 90, 80, 70, ... adalah?", options: ["50", "60", "65", "70"], correct: 1 },
            { question: "Angka yang hilang dari deret 7, 14, ___, 28, 35 adalah?", options: ["18", "20", "21", "24"], correct: 2 },
            { question: "Angka berikutnya dari deret 2, 6, 18, 54, ... adalah?", options: ["108", "126", "144", "162"], correct: 3 },
            { question: "Angka yang hilang dari deret 5, 15, ___, 135, 405 adalah?", options: ["30", "35", "45", "50"], correct: 2 },

            // PERBANDINGAN & RASIO
            { question: "Jika 2:3 = 8:x, berapakah nilai x?", options: ["10", "11", "12", "13"], correct: 2 },
            { question: "Rasio 20:50 dalam bentuk paling sederhana adalah?", options: ["1:2", "2:5", "4:10", "10:25"], correct: 1 },
            { question: "Jika 5:x = 15:45, berapakah nilai x?", options: ["10", "12", "15", "20"], correct: 2 },
            { question: "Jika perbandingan umur Ani dan Budi 3:5 dan umur Ani 12 tahun, berapa umur Budi?", options: ["15", "18", "20", "24"], correct: 2 },
            { question: "Rasio 24:36 dalam bentuk paling sederhana adalah?", options: ["1:2", "2:3", "3:4", "4:6"], correct: 1 },
            { question: "Jika 4:7 = 12:x, berapakah nilai x?", options: ["18", "19", "20", "21"], correct: 3 },
            { question: "Jika perbandingan panjang dan lebar 4:3 dan panjang 20 cm, berapa lebar?", options: ["12 cm", "15 cm", "16 cm", "18 cm"], correct: 1 },
            { question: "Rasio 18:27 dalam bentuk paling sederhana adalah?", options: ["1:2", "2:3", "3:4", "6:9"], correct: 1 },
            { question: "Jika 6:x = 18:30, berapakah nilai x?", options: ["8", "9", "10", "12"], correct: 2 },
            { question: "Jika perbandingan A dan B adalah 5:8 dan A = 15, berapakah B?", options: ["20", "22", "24", "28"], correct: 2 },

            // STATISTIKA DASAR
            { question: "Rata-rata dari 5, 10, 15, 20 adalah?", options: ["10", "12.5", "15", "17.5"], correct: 1 },
            { question: "Median dari data 3, 7, 5, 9, 11 adalah?", options: ["5", "7", "9", "11"], correct: 1 },
            { question: "Modus dari data 2, 3, 4, 3, 5, 3, 6 adalah?", options: ["2", "3", "4", "5"], correct: 1 },
            { question: "Rata-rata dari 8, 12, 16, 20, 24 adalah?", options: ["14", "16", "18", "20"], correct: 1 },
            { question: "Median dari data 10, 20, 30, 40, 50 adalah?", options: ["20", "25", "30", "35"], correct: 2 },
            { question: "Modus dari data 5, 7, 7, 8, 9, 7, 10 adalah?", options: ["5", "7", "8", "9"], correct: 1 },
            { question: "Rata-rata dari 15, 25, 35, 45 adalah?", options: ["25", "30", "35", "40"], correct: 1 },
            { question: "Median dari data 2, 4, 6, 8 adalah?", options: ["4", "5", "6", "7"], correct: 1 },
            { question: "Modus dari data 1, 2, 2, 3, 3, 3, 4 adalah?", options: ["1", "2", "3", "4"], correct: 2 },
            { question: "Rata-rata dari 10, 15, 20, 25, 30 adalah?", options: ["18", "20", "22", "25"], correct: 1 },

            // BILANGAN BULAT & OPERASI
            { question: "Berapakah hasil dari 13 + 29 - 7?", options: ["33", "34", "35", "36"], correct: 2 },
            { question: "Berapakah 18 × 5?", options: ["80", "85", "90", "95"], correct: 2 },
            { question: "Berapakah 72 ÷ 8?", options: ["7", "8", "9", "10"], correct: 2 },
            { question: "Berapakah 11 × 11?", options: ["111", "121", "131", "141"], correct: 1 },
            { question: "Berapakah 200 - 87?", options: ["103", "113", "123", "133"], correct: 1 },
            { question: "Berapakah 17 × 6?", options: ["92", "96", "102", "106"], correct: 2 },
            { question: "Berapakah 250 ÷ 5?", options: ["45", "50", "55", "60"], correct: 1 },
            { question: "Berapakah 99 + 1?", options: ["99", "100", "101", "110"], correct: 1 },
            { question: "Berapakah 6² - 4²?", options: ["12", "16", "20", "24"], correct: 2 },
            { question: "Berapakah 16 + 24 + 10?", options: ["40", "45", "50", "55"], correct: 2 }
        ];

        // ===== GAME STATE =====
        let playerData = {
            name: '',
            class: '',
            school: '',
            score: 0
        };

        let gameState = {
            currentQuestionIndex: 0,
            selectedQuestions: [],
            totalScore: 0,
            timer: null,
            timeLeft: 60,
            maxPointsPerQuestion: 500,
            questionStartTime: null
        };

        // ===== SCREEN MANAGEMENT =====
        function showScreen(screenId) {
            const screens = ['registrationScreen', 'quizScreen', 'resultScreen'];
            screens.forEach(screen => {
                document.getElementById(screen).classList.add('hidden');
            });
            document.getElementById(screenId).classList.remove('hidden');
        }

        // ===== SELECT 15 RANDOM QUESTIONS =====
        function selectRandomQuestions() {
            const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, 15);
        }

        // ===== REGISTRATION FORM =====
        document.getElementById('registrationForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            playerData.name = document.getElementById('playerName').value.trim();
            playerData.class = document.getElementById('playerClass').value.trim();
            playerData.school = document.getElementById('playerSchool').value.trim();

            if (playerData.name && playerData.class && playerData.school) {
                gameState.selectedQuestions = selectRandomQuestions();
                document.getElementById('totalQuestions').textContent = gameState.selectedQuestions.length;
                showScreen('quizScreen');
                startQuiz();
            }
        });

        // ===== START QUIZ =====
        function startQuiz() {
            gameState.currentQuestionIndex = 0;
            gameState.totalScore = 0;
            displayQuestion();
        }

        // ===== DISPLAY QUESTION =====
        function displayQuestion() {
            const questionData = gameState.selectedQuestions[gameState.currentQuestionIndex];
            const questionNum = gameState.currentQuestionIndex + 1;

            // Update UI
            document.getElementById('currentQuestion').textContent = questionNum;
            document.getElementById('questionText').textContent = questionData.question;
            document.getElementById('currentScore').textContent = gameState.totalScore;

            // Update progress bar
            const progress = (questionNum / gameState.selectedQuestions.length) * 100;
            document.getElementById('progressBar').style.width = progress + '%';

            // Display options
            const optionsContainer = document.getElementById('optionsContainer');
            optionsContainer.innerHTML = '';

            questionData.options.forEach((option, index) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                optionDiv.textContent = option;
                optionDiv.addEventListener('click', () => selectOption(index));
                optionsContainer.appendChild(optionDiv);
            });

            // Hide next button
            document.getElementById('nextButton').classList.add('hidden');

            // Start timer
            startTimer();
        }

        // ===== TIMER =====
        function startTimer() {
            gameState.timeLeft = 60;
            gameState.questionStartTime = Date.now();
            
            const timerElement = document.getElementById('timer');
            timerElement.textContent = gameState.timeLeft;
            timerElement.classList.remove('warning');

            if (gameState.timer) clearInterval(gameState.timer);

            gameState.timer = setInterval(() => {
                gameState.timeLeft--;
                timerElement.textContent = gameState.timeLeft;

                if (gameState.timeLeft <= 10) {
                    timerElement.classList.add('warning');
                }

                if (gameState.timeLeft <= 0) {
                    clearInterval(gameState.timer);
                    selectOption(-1);
                }
            }, 1000);
        }

        // ===== CALCULATE POINTS =====
        function calculatePoints() {
            const timeElapsed = (Date.now() - gameState.questionStartTime) / 1000;
            const maxTime = 60;
            
            const minPoints = 50;
            const pointsRange = gameState.maxPointsPerQuestion - minPoints;
            const timeFactor = Math.max(0, 1 - (timeElapsed / maxTime));
            
            return Math.round(minPoints + (pointsRange * timeFactor));
        }

        // ===== SELECT OPTION =====
        function selectOption(selectedIndex) {
            clearInterval(gameState.timer);

            const questionData = gameState.selectedQuestions[gameState.currentQuestionIndex];
            const options = document.querySelectorAll('.option');
            
            options.forEach(opt => opt.classList.add('disabled'));

            options[questionData.correct].classList.add('correct');

            if (selectedIndex === questionData.correct) {
                const points = calculatePoints();
                gameState.totalScore += points;
                document.getElementById('currentScore').textContent = gameState.totalScore;
            } else if (selectedIndex >= 0) {
                options[selectedIndex].classList.add('incorrect');
            }

            document.getElementById('nextButton').classList.remove('hidden');
            document.getElementById('nextButton').onclick = nextQuestion;
        }

        // ===== NEXT QUESTION =====
        function nextQuestion() {
            gameState.currentQuestionIndex++;

            if (gameState.currentQuestionIndex < gameState.selectedQuestions.length) {
                displayQuestion();
            } else {
                finishQuiz();
            }
        }

        // ===== FINISH QUIZ =====
        function finishQuiz() {
            showScreen('resultScreen');
            
            document.getElementById('finalScore').textContent = gameState.totalScore;
            
            let message = '';
            if (gameState.totalScore >= 6500) {
                message = '🌟 Sempurna! Ahli Matematika!';
            } else if (gameState.totalScore >= 5000) {
                message = '🎉 Hebat! Nilai yang bagus!';
            } else if (gameState.totalScore >= 3500) {
                message = '👍 Bagus! Terus tingkatkan!';
            } else if (gameState.totalScore >= 2000) {
                message = '💪 Cukup baik! Latihan lagi!';
            } else {
                message = '📚 Tetap semangat! Belajar lagi ya!';
            }
            
            document.getElementById('resultMessage').textContent = message;
        }
        
        // ===== PLAY AGAIN =====
        document.getElementById('playAgainButton').addEventListener('click', () => {
            location.reload();
        });

    </script>
</body>
</html>
`;

export default function UploadPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
      htmlCode: defaultHtmlCode,
    }
  });

  const onSubmit = async (data: UploadFormValues) => {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Kesalahan',
        description: 'Anda harus masuk untuk mengunggah game.',
      });
      return;
    }

    setIsUploading(true);
    
    try {
      if (!firestore) throw new Error("Firestore is not initialized");
      const gamesCollection = collection(firestore, 'publishedGames');
      const newGame = {
        ...data,
        userId: user.uid,
        authorName: user.displayName || user.email || 'Pengguna Anonim',
        uploadDate: serverTimestamp(),
        views: 0,
      };
      
      await addDocumentNonBlocking(gamesCollection, newGame);

      toast({
        title: 'Berhasil!',
        description: `Game Anda "${data.title}" telah diunggah.`,
      });
      form.reset({
        title: "",
        description: "",
        htmlCode: defaultHtmlCode
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Unggahan Gagal',
        description: error.message || 'Terjadi kesalahan yang tidak diketahui.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold font-headline">Akses Ditolak</h1>
        <p className="text-muted-foreground">Anda harus masuk untuk mengunggah game.</p>
        <Button asChild className="mt-4">
          <a href="/login">Masuk</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in-0 slide-in-from-top-4 duration-500">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <UploadCloud className="h-6 w-6" />
            Unggah Game Baru
          </CardTitle>
          <CardDescription>
            Bagikan game HTML interaktif Anda dengan komunitas MAIN Q. Isi detailnya dan tempel kode Anda di bawah.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul Game</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Game Memori Keren" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kelas</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kelas" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Kelas 1 SD">Kelas 1 SD</SelectItem>
                          <SelectItem value="Kelas 2 SD">Kelas 2 SD</SelectItem>
                          <SelectItem value="Kelas 3 SD">Kelas 3 SD</SelectItem>
                          <SelectItem value="Kelas 4 SD">Kelas 4 SD</SelectItem>
                          <SelectItem value="Kelas 5 SD">Kelas 5 SD</SelectItem>
                          <SelectItem value="Kelas 6 SD">Kelas 6 SD</SelectItem>
                          <SelectItem value="Kelas 7 SMP">Kelas 7 SMP</SelectItem>
                          <SelectItem value="Kelas 8 SMP">Kelas 8 SMP</SelectItem>
                          <SelectItem value="Kelas 9 SMP">Kelas 9 SMP</SelectItem>
                          <SelectItem value="Kelas 10 SMA">Kelas 10 SMA</SelectItem>
                          <SelectItem value="Kelas 11 SMA">Kelas 11 SMA</SelectItem>
                          <SelectItem value="Kelas 12 SMA">Kelas 12 SMA</SelectItem>
                          <SelectItem value="Umum">Umum</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mata Pelajaran</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih mata pelajaran" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pendidikan Agama">Pendidikan Agama</SelectItem>
                          <SelectItem value="PPKn">PPKn</SelectItem>
                          <SelectItem value="Bahasa Indonesia">Bahasa Indonesia</SelectItem>
                          <SelectItem value="Bahasa Inggris">Bahasa Inggris</SelectItem>
                          <SelectItem value="Bahasa Daerah">Bahasa Daerah</SelectItem>
                          <SelectItem value="Bahasa Asing Lainnya">Bahasa Asing Lainnya</SelectItem>
                          <SelectItem value="Matematika">Matematika</SelectItem>
                          <SelectItem value="Ilmu Pengetahuan Alam (IPA)">Ilmu Pengetahuan Alam (IPA)</SelectItem>
                          <SelectItem value="Fisika">Fisika</SelectItem>
                          <SelectItem value="Kimia">Kimia</SelectItem>
                          <SelectItem value="Biologi">Biologi</SelectItem>
                          <SelectItem value="Ilmu Pengetahuan Sosial (IPS)">Ilmu Pengetahuan Sosial (IPS)</SelectItem>
                          <SelectItem value="Sejarah">Sejarah</SelectItem>
                          <SelectItem value="Geografi">Geografi</SelectItem>
                          <SelectItem value="Ekonomi">Ekonomi</SelectItem>
                          <SelectItem value="Sosiologi">Sosiologi</SelectItem>
                          <SelectItem value="Ilmu Pengetahuan Alam dan Sosial (IPAS)">Ilmu Pengetahuan Alam dan Sosial (IPAS)</SelectItem>
                          <SelectItem value="Seni Budaya">Seni Budaya</SelectItem>
                          <SelectItem value="PJOK (Pendidikan Jasmani)">PJOK (Pendidikan Jasmani)</SelectItem>
                          <SelectItem value="Prakarya & Kewirausahaan">Prakarya & Kewirausahaan</SelectItem>
                          <SelectItem value="Informatika (TIK)">Informatika (TIK)</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Jelaskan secara singkat game Anda."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="htmlCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode HTML</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="<!DOCTYPE html>..."
                        className="font-mono min-h-[250px] text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengunggah...
                  </>
                ) : 'Unggah Game'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
