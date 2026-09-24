/**
 * padhle bhai - ICSE Class 9 History 80-Mark Hub
 * Application Logic: State management, timeline, search, flashcards, quiz engine
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initGlobalSearch();

    const path = window.location.pathname;
    if (path.includes('chapter.html')) {
        initChapterPage();
    } else {
        initHomePage();
    }
});

/* =========================================================
   1. THEME SWITCHER
   ========================================================= */
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('historia_theme') || 'light';
    
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('historia_theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('historia_theme', 'dark');
            }
        });
    }
}

/* =========================================================
   2. STUDENT PROGRESS & LOCALSTORAGE
   ========================================================= */
function getProgressData() {
    const defaultData = {
        completedChapters: [],
        masteredCards: [],
        quizScores: {}
    };
    try {
        const stored = localStorage.getItem('historia_progress');
        return stored ? JSON.parse(stored) : defaultData;
    } catch (e) {
        return defaultData;
    }
}

function saveProgressData(data) {
    localStorage.setItem('historia_progress', JSON.stringify(data));
}

function updateDashboardMetrics() {
    const progress = getProgressData();
    const totalChapters = chaptersData.length;
    const completedCount = progress.completedChapters.length;
    const masteredCardsCount = progress.masteredCards.length;
    const quizCount = Object.keys(progress.quizScores).length;

    // Estimate total flashcards available across 8 chapters
    let totalCardsAcrossAll = 0;
    chaptersData.forEach(c => {
        if (c.flashcards) totalCardsAcrossAll += c.flashcards.length;
    });

    // Calculate overall readiness percentage
    // 50% for completing 8 chapters reading, 25% for flashcards mastered, 25% for quizzes attempted
    const chapterScore = (completedCount / totalChapters) * 50;
    const cardScore = totalCardsAcrossAll > 0 ? (masteredCardsCount / totalCardsAcrossAll) * 25 : 0;
    const quizScore = (quizCount / totalChapters) * 25;
    const totalReadiness = Math.min(100, Math.round(chapterScore + cardScore + quizScore));

    const overallVal = document.getElementById('overallReadinessVal');
    const overallPercent = document.getElementById('overallReadinessPercent');
    const overallBar = document.getElementById('overallProgressBar');

    if (overallVal) overallVal.textContent = `${totalReadiness}%`;
    if (overallPercent) overallPercent.textContent = `${totalReadiness}%`;
    if (overallBar) overallBar.style.width = `${totalReadiness}%`;

    const chapVal = document.getElementById('chaptersCompletedVal');
    const chapCount = document.getElementById('chaptersCompletedCount');
    const chapBar = document.getElementById('chaptersProgressBar');
    if (chapVal) chapVal.textContent = completedCount;
    if (chapCount) chapCount.textContent = `${completedCount} / ${totalChapters}`;
    if (chapBar) chapBar.style.width = `${(completedCount / totalChapters) * 100}%`;

    const fcVal = document.getElementById('flashcardsMasteredVal');
    const fcCount = document.getElementById('flashcardsMasteredCount');
    const fcBar = document.getElementById('flashcardsProgressBar');
    if (fcVal) fcVal.textContent = masteredCardsCount;
    if (fcCount) fcCount.textContent = `${masteredCardsCount} Mastered`;
    if (fcBar) fcBar.style.width = `${Math.min(100, (masteredCardsCount / (totalCardsAcrossAll || 48)) * 100)}%`;

    const quizVal = document.getElementById('quizzesAttemptedVal');
    const quizCountEl = document.getElementById('quizzesAttemptedCount');
    const quizBar = document.getElementById('quizzesProgressBar');
    if (quizVal) quizVal.textContent = quizCount;
    if (quizCountEl) quizCountEl.textContent = `${quizCount} / ${totalChapters}`;
    if (quizBar) quizBar.style.width = `${(quizCount / totalChapters) * 100}%`;
}

/* =========================================================
   3. HOMEPAGE DASHBOARD
   ========================================================= */
function initHomePage() {
    updateDashboardMetrics();
    renderTimeline();
    renderChapterGrid();
}

function renderTimeline() {
    const flow = document.getElementById('timelineFlow');
    if (!flow) return;
    flow.innerHTML = '';

    chaptersData.forEach((chapter) => {
        const node = document.createElement('div');
        node.className = 'timeline-card-node';
        node.innerHTML = `
            <div class="node-dot"></div>
            <div class="node-date">${chapter.era || 'Historical Era'}</div>
            <div class="node-title">${chapter.title}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 6px;">Chapter ${chapter.id}</div>
        `;
        node.addEventListener('click', () => {
            window.location.href = `chapter.html?id=${chapter.id}`;
        });
        flow.appendChild(node);
    });
}

function renderChapterGrid() {
    const grid = document.getElementById('chapterGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const progress = getProgressData();

    chaptersData.forEach((chapter) => {
        const isCompleted = progress.completedChapters.includes(chapter.id);
        const hasQuiz = progress.quizScores[chapter.id] !== undefined;

        const card = document.createElement('div');
        card.className = 'chapter-card glass';

        card.innerHTML = `
            <div class="card-top-meta">
                <span class="chapter-badge">Chapter ${chapter.id}</span>
                <span class="card-status-badge ${isCompleted ? 'completed' : ''}">
                    ${isCompleted ? '✓ Completed' : 'In Progress'}
                </span>
            </div>
            <h2>${chapter.title}</h2>
            <div style="font-size: 0.8rem; color: var(--accent-gold); font-weight: 600; margin-bottom: 8px;">
                ${chapter.era || ''} • ${chapter.readTime}
            </div>
            <p>${chapter.description}</p>
            <div class="card-btn-group">
                <a href="chapter.html?id=${chapter.id}&tab=notes" class="btn btn-primary">📖 Study Notes</a>
                <a href="chapter.html?id=${chapter.id}&tab=flashcards" class="btn btn-secondary">🗂️ Cards</a>
                <a href="chapter.html?id=${chapter.id}&tab=quiz" class="btn btn-secondary">📝 Test</a>
            </div>
        `;
        grid.appendChild(card);
    });
}

/* =========================================================
   4. CHAPTER READING PAGE
   ========================================================= */
let currentChapter = null;
let currentFlashcardIndex = 0;
let currentFlashcards = [];
let quizUserAnswers = {};

function initChapterPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const chapterId = parseInt(urlParams.get('id')) || 1;
    const activeTab = urlParams.get('tab') || 'notes';

    currentChapter = chaptersData.find(c => c.id === chapterId);
    if (!currentChapter) {
        document.getElementById('dynamicContent').innerHTML = "<p>Chapter not found.</p>";
        return;
    }

    // Populate Headers
    document.getElementById('chapterNumberLabel').textContent = `Chapter ${currentChapter.id}`;
    document.getElementById('readTimeLabel').textContent = currentChapter.readTime;
    document.getElementById('chapterTitle').textContent = currentChapter.title;
    document.getElementById('chapterDesc').textContent = currentChapter.subtitle || currentChapter.description;
    document.title = `${currentChapter.title} - padhle bhai`;

    // Completion Status
    updateChapterCompletionButton();

    // Render Key Facts Box
    renderKeyFactsBox();

    // Render Study Notes Content
    document.getElementById('dynamicContent').innerHTML = currentChapter.contentHtml || currentChapter.content;

    // Generate Table of Contents
    generateTableOfContents();

    // Render Quick Revision Tab
    renderQuickRevisionTab();

    // Render 5-Min Tab
    renderFiveMinTab();

    // Setup Flashcards Tab
    initFlashcardsTab();

    // Setup Quiz Tab
    initQuizTab();

    // Setup Model Answers Tab
    renderModelAnswersTab();

    // Setup Tab Navigation
    setupTabSwitching(activeTab);

    // Setup Mark as Completed button
    const markBtn = document.getElementById('markCompleteBtn');
    if (markBtn) {
        markBtn.addEventListener('click', toggleChapterCompletion);
    }

    // Prev / Next Chapter Buttons
    const prevBtn = document.getElementById('prevChapterBtn');
    const nextBtn = document.getElementById('nextChapterBtn');
    const practiceCardsBtn = document.getElementById('practiceFlashcardsBtn');

    if (prevBtn) {
        if (currentChapter.id > 1) {
            prevBtn.addEventListener('click', () => {
                window.location.href = `chapter.html?id=${currentChapter.id - 1}`;
            });
        } else {
            prevBtn.style.opacity = '0.4';
            prevBtn.style.cursor = 'not-allowed';
        }
    }

    if (nextBtn) {
        if (currentChapter.id < chaptersData.length) {
            nextBtn.addEventListener('click', () => {
                window.location.href = `chapter.html?id=${currentChapter.id + 1}`;
            });
        } else {
            nextBtn.style.opacity = '0.4';
            nextBtn.style.cursor = 'not-allowed';
        }
    }

    if (practiceCardsBtn) {
        practiceCardsBtn.addEventListener('click', () => {
            switchTab('flashcards');
        });
    }
}

function updateChapterCompletionButton() {
    const progress = getProgressData();
    const isCompleted = progress.completedChapters.includes(currentChapter.id);
    const icon = document.getElementById('markCompleteIcon');
    const text = document.getElementById('markCompleteText');
    const statusLabel = document.getElementById('chapterStatusLabel');

    if (isCompleted) {
        if (icon) icon.textContent = '✓';
        if (text) text.textContent = 'Completed';
        if (statusLabel) {
            statusLabel.textContent = 'Completed';
            statusLabel.classList.add('completed');
        }
    } else {
        if (icon) icon.textContent = '○';
        if (text) text.textContent = 'Mark as Completed';
        if (statusLabel) {
            statusLabel.textContent = 'In Progress';
            statusLabel.classList.remove('completed');
        }
    }
}

function toggleChapterCompletion() {
    const progress = getProgressData();
    const index = progress.completedChapters.indexOf(currentChapter.id);
    if (index > -1) {
        progress.completedChapters.splice(index, 1);
    } else {
        progress.completedChapters.push(currentChapter.id);
    }
    saveProgressData(progress);
    updateChapterCompletionButton();
}

function renderKeyFactsBox() {
    const container = document.getElementById('keyFactsContainer');
    if (!container || !currentChapter.keyFacts) {
        if (container) container.style.display = 'none';
        return;
    }
    container.style.display = 'block';

    const kf = currentChapter.keyFacts;
    container.innerHTML = `
        <div class="key-facts-title">
            <span>📌 KEY FACTS AT A GLANCE</span>
        </div>
        <div class="key-facts-grid">
            <div class="key-fact-category">
                <h4>👑 Prominent Figures</h4>
                <ul>
                    ${(kf.people || []).map(p => `<li>${p}</li>`).join('')}
                </ul>
            </div>
            <div class="key-fact-category">
                <h4>🗺️ Major Places</h4>
                <ul>
                    ${(kf.places || []).map(pl => `<li>${pl}</li>`).join('')}
                </ul>
            </div>
            <div class="key-fact-category">
                <h4>⏳ Important Dates</h4>
                <ul>
                    ${(kf.dates || []).map(d => `<li>${d}</li>`).join('')}
                </ul>
            </div>
            <div class="key-fact-category">
                <h4>📜 Essential Terms</h4>
                <ul>
                    ${(kf.terms || []).map(t => `<li>${t}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

function generateTableOfContents() {
    const contentArea = document.getElementById('dynamicContent');
    const headings = contentArea.querySelectorAll('h2');
    const tocList = document.getElementById('tocList');
    const mobileTocList = document.getElementById('mobileTocList');
    const mobileTocContainer = document.getElementById('mobileTocContainer');
    
    if (tocList) tocList.innerHTML = '';
    if (mobileTocList) mobileTocList.innerHTML = '';

    headings.forEach((heading, index) => {
        if (!heading.id) {
            heading.id = 'sec-heading-' + index;
        }

        // Desktop TOC item
        if (tocList) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#' + heading.id;
            a.textContent = heading.textContent;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            li.appendChild(a);
            tocList.appendChild(li);
        }

        // Mobile TOC item
        if (mobileTocList) {
            const mLi = document.createElement('li');
            const mA = document.createElement('a');
            mA.href = '#' + heading.id;
            mA.textContent = heading.textContent;
            mA.addEventListener('click', (e) => {
                e.preventDefault();
                if (mobileTocContainer) mobileTocContainer.removeAttribute('open');
                heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            mLi.appendChild(mA);
            mobileTocList.appendChild(mLi);
        }
    });
}

function setupTabSwitching(defaultTab) {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    switchTab(defaultTab);
}

function switchTab(tabName) {
    // Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    // Content areas
    const tabMap = {
        'notes': 'tabContentNotes',
        'quick-revision': 'tabContentQuickRevision',
        'five-min': 'tabContentFiveMin',
        'flashcards': 'tabContentFlashcards',
        'quiz': 'tabContentQuiz',
        'answers': 'tabContentAnswers'
    };

    Object.keys(tabMap).forEach(key => {
        const el = document.getElementById(tabMap[key]);
        if (el) {
            el.classList.toggle('hidden', key !== tabName);
        }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderQuickRevisionTab() {
    const container = document.getElementById('quickRevisionContent');
    if (!container) return;

    const points = currentChapter.quickRevision || [
        "Review key facts and historical developments discussed in the chapter notes."
    ];

    container.innerHTML = `
        <ul style="font-size: 1.05rem; line-height: 1.8; margin-left: 20px;">
            ${points.map(pt => `<li style="margin-bottom: 14px;">${pt}</li>`).join('')}
        </ul>
    `;
}

function renderFiveMinTab() {
    const container = document.getElementById('fiveMinContent');
    if (!container) return;

    container.innerHTML = currentChapter.fiveMinRevision || `
        <p>A quick 5-minute digest covering dates, rulers, and concepts for ${currentChapter.title}.</p>
    `;
}

function renderModelAnswersTab() {
    const container = document.getElementById('modelAnswersContent');
    if (!container) return;

    const models = currentChapter.modelAnswers || [];
    if (models.length === 0) {
        container.innerHTML = "<p>Model answers will appear here.</p>";
        return;
    }

    container.innerHTML = models.map((m, idx) => `
        <div class="doodle-card doodle-answer-tip" style="margin-bottom: 30px;">
            <div class="doodle-header">✍️ ${m.questionType}</div>
            <div class="doodle-content">
                <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 8px;">Q: ${m.question}</div>
                <div style="font-style: italic; color: var(--accent-gold); margin-bottom: 12px; font-size: 0.9rem;">
                    <strong>Exam Blueprint:</strong> ${m.blueprint}
                </div>
                <div style="background: rgba(255,255,255,0.6); padding: 14px 18px; border-radius: 8px; border-left: 3px solid var(--accent-color); font-size: 0.98rem; line-height: 1.7;">
                    ${m.modelAnswer}
                </div>
            </div>
        </div>
    `).join('');
}

/* =========================================================
   5. INTERACTIVE FLASHCARD SYSTEM
   ========================================================= */
function initFlashcardsTab() {
    currentFlashcards = (currentChapter.flashcards && currentChapter.flashcards.length > 0)
        ? [...currentChapter.flashcards]
        : [{ category: "Term", prompt: "No flashcards found", explanation: "Add flashcards." }];

    currentFlashcardIndex = 0;

    const badge = document.getElementById('fcCountBadge');
    if (badge) badge.textContent = currentFlashcards.length;

    const scene = document.getElementById('flashcardScene');
    const card = document.getElementById('flashcardElement');

    if (scene && card) {
        scene.addEventListener('click', () => {
            card.classList.toggle('is-flipped');
        });
    }

    const nextBtn = document.getElementById('fcNextBtn');
    const shuffleBtn = document.getElementById('fcShuffleBtn');
    const knowBtn = document.getElementById('fcKnowBtn');
    const reviseBtn = document.getElementById('fcReviseBtn');

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextFlashcard();
        });
    }

    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', () => {
            currentFlashcards.sort(() => Math.random() - 0.5);
            currentFlashcardIndex = 0;
            renderCurrentFlashcard();
        });
    }

    if (knowBtn) {
        knowBtn.addEventListener('click', () => {
            const cardId = `${currentChapter.id}_${currentFlashcardIndex}`;
            const progress = getProgressData();
            if (!progress.masteredCards.includes(cardId)) {
                progress.masteredCards.push(cardId);
                saveProgressData(progress);
            }
            nextFlashcard();
        });
    }

    if (reviseBtn) {
        reviseBtn.addEventListener('click', () => {
            nextFlashcard();
        });
    }

    renderCurrentFlashcard();
}

function nextFlashcard() {
    const card = document.getElementById('flashcardElement');
    if (card) card.classList.remove('is-flipped');

    currentFlashcardIndex = (currentFlashcardIndex + 1) % currentFlashcards.length;
    setTimeout(() => {
        renderCurrentFlashcard();
    }, 200);
}

function renderCurrentFlashcard() {
    const cardData = currentFlashcards[currentFlashcardIndex];
    if (!cardData) return;

    document.getElementById('fcFrontCategory').textContent = cardData.category || "Study Concept";
    document.getElementById('fcFrontText').textContent = cardData.prompt;
    document.getElementById('fcBackText').innerHTML = cardData.explanation;
    document.getElementById('fcCurrentIndex').textContent = currentFlashcardIndex + 1;
    document.getElementById('fcTotalCount').textContent = currentFlashcards.length;
}

/* =========================================================
   6. SELF-TEST QUIZ ENGINE
   ========================================================= */
function initQuizTab() {
    const container = document.getElementById('quizQuestionsContainer');
    const submitBtn = document.getElementById('submitQuizBtn');
    const scoreBanner = document.getElementById('quizScoreBanner');
    const retryBtn = document.getElementById('retryQuizBtn');
    if (!container) return;

    quizUserAnswers = {};
    scoreBanner.style.display = 'none';
    submitBtn.style.display = 'inline-block';

    const questions = currentChapter.quiz || [];
    if (questions.length === 0) {
        container.innerHTML = "<p>No quiz questions available for this chapter.</p>";
        submitBtn.style.display = 'none';
        return;
    }

    container.innerHTML = questions.map((q, qIndex) => `
        <div class="quiz-question-card" id="quizCard_${qIndex}">
            <div class="quiz-q-header">
                <span class="q-badge">Question ${qIndex + 1}</span>
                <span class="q-type-badge">${q.type === 'mcq' ? 'Multiple Choice' : 'True / False'}</span>
            </div>
            <div class="quiz-q-text">${q.question}</div>
            <div class="quiz-options-list">
                ${q.options.map((opt, optIndex) => `
                    <button class="quiz-opt-btn" data-q="${qIndex}" data-opt="${optIndex}">
                        ${String.fromCharCode(65 + optIndex)}. ${opt}
                    </button>
                `).join('')}
            </div>
            <div class="quiz-explanation-box" id="explanation_${qIndex}">
                <strong>Explanation:</strong> ${q.explanation}
            </div>
        </div>
    `).join('');

    // Attach click handlers to option buttons
    container.querySelectorAll('.quiz-opt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const qIdx = parseInt(btn.getAttribute('data-q'));
            const optIdx = parseInt(btn.getAttribute('data-opt'));

            // Set user answer
            quizUserAnswers[qIdx] = optIdx;

            // Highlight selected button
            const parent = document.getElementById(`quizCard_${qIdx}`);
            parent.querySelectorAll('.quiz-opt-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

    if (submitBtn) {
        submitBtn.onclick = evaluateQuiz;
    }

    if (retryBtn) {
        retryBtn.onclick = () => {
            initQuizTab();
        };
    }
}

function evaluateQuiz() {
    const questions = currentChapter.quiz || [];
    let score = 0;

    questions.forEach((q, qIdx) => {
        const userChoice = quizUserAnswers[qIdx];
        const correctChoice = q.answer;
        const card = document.getElementById(`quizCard_${qIdx}`);
        const expBox = document.getElementById(`explanation_${qIdx}`);

        const buttons = card.querySelectorAll('.quiz-opt-btn');
        buttons.forEach((btn, bIdx) => {
            btn.disabled = true;
            if (bIdx === correctChoice) {
                btn.classList.add('correct');
            } else if (bIdx === userChoice && userChoice !== correctChoice) {
                btn.classList.add('incorrect');
            }
        });

        if (userChoice === correctChoice) {
            score++;
        }

        if (expBox) {
            expBox.style.display = 'block';
        }
    });

    const percent = Math.round((score / questions.length) * 100);

    // Save quiz score
    const progress = getProgressData();
    progress.quizScores[currentChapter.id] = {
        score: score,
        total: questions.length,
        percentage: percent
    };
    saveProgressData(progress);

    // Show score banner
    const banner = document.getElementById('quizScoreBanner');
    const title = document.getElementById('quizScoreTitle');
    const details = document.getElementById('quizScoreDetails');
    const submitBtn = document.getElementById('submitQuizBtn');

    if (banner) {
        banner.style.display = 'block';
        if (title) title.textContent = percent >= 75 ? "🎉 Excellent Mastery!" : percent >= 50 ? "👍 Good Effort!" : "📖 Needs Further Revision";
        if (details) details.textContent = `You scored ${score} out of ${questions.length} (${percent}%). Review the detailed explanations above.`;
        submitBtn.style.display = 'none';
        banner.scrollIntoView({ behavior: 'smooth' });
    }
}

/* =========================================================
   7. GLOBAL SEARCH SYSTEM
   ========================================================= */
function initGlobalSearch() {
    const searchModal = document.getElementById('searchModal');
    const openBtn = document.getElementById('openSearchBtn');
    const closeBtn = document.getElementById('closeSearchBtn');
    const searchInput = document.getElementById('globalSearchInput');
    const resultsList = document.getElementById('searchResultsList');

    if (!searchModal || !openBtn || !searchInput) return;

    openBtn.addEventListener('click', () => {
        searchModal.classList.add('active');
        searchInput.focus();
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            searchModal.classList.remove('active');
        });
    }

    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            searchModal.classList.remove('active');
        }
    });

    // Keyboard shortcut '/' or 'Escape'
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            searchModal.classList.add('active');
            searchInput.focus();
        } else if (e.key === 'Escape' && searchModal.classList.contains('active')) {
            searchModal.classList.remove('active');
        }
    });

    // Search query listener
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (query.length < 2) {
            resultsList.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 30px 0;">Start typing to search across all 8 chapters...</p>`;
            return;
        }

        const matches = [];

        chaptersData.forEach(chap => {
            // Check title & subtitle
            if (chap.title.toLowerCase().includes(query) || (chap.subtitle && chap.subtitle.toLowerCase().includes(query))) {
                matches.push({
                    chapterId: chap.id,
                    chapterTitle: chap.title,
                    type: 'Chapter Overview',
                    title: chap.title,
                    snippet: chap.description
                });
            }

            // Check Key facts
            if (chap.keyFacts) {
                (chap.keyFacts.people || []).forEach(p => {
                    if (p.toLowerCase().includes(query)) {
                        matches.push({
                            chapterId: chap.id,
                            chapterTitle: chap.title,
                            type: 'Historical Person',
                            title: p.split(':')[0],
                            snippet: p
                        });
                    }
                });

                (chap.keyFacts.places || []).forEach(pl => {
                    if (pl.toLowerCase().includes(query)) {
                        matches.push({
                            chapterId: chap.id,
                            chapterTitle: chap.title,
                            type: 'Historical Place',
                            title: pl.split(':')[0],
                            snippet: pl
                        });
                    }
                });

                (chap.keyFacts.terms || []).forEach(t => {
                    if (t.toLowerCase().includes(query)) {
                        matches.push({
                            chapterId: chap.id,
                            chapterTitle: chap.title,
                            type: 'Key Terminology',
                            title: t.split(':')[0],
                            snippet: t
                        });
                    }
                });
            }

            // Check Flashcards
            (chap.flashcards || []).forEach(fc => {
                if (fc.prompt.toLowerCase().includes(query) || fc.explanation.toLowerCase().includes(query)) {
                    matches.push({
                        chapterId: chap.id,
                        chapterTitle: chap.title,
                        type: `Flashcard (${fc.category})`,
                        title: fc.prompt,
                        snippet: fc.explanation
                    });
                }
            });
        });

        if (matches.length === 0) {
            resultsList.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 30px 0;">No matching topics found for "${query}". Try another keyword.</p>`;
            return;
        }

        resultsList.innerHTML = matches.slice(0, 15).map(m => `
            <div class="search-item" onclick="window.location.href='chapter.html?id=${m.chapterId}'">
                <div class="search-item-meta">${m.type} • Chapter ${m.chapterId}: ${m.chapterTitle}</div>
                <div class="search-item-title">${m.title}</div>
                <div class="search-item-snippet">${m.snippet}</div>
            </div>
        `).join('');
    });
}
