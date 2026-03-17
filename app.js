// Voice News - CLEAN REWRITTEN VERSION
// ---------------------------------------------------------

const SUPABASE_URL = 'https://qidpqxsvzzyryklfkxmk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpZHBxeHN2enp5cnlrbGZreG1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTUzMjAsImV4cCI6MjA4OTI3MTMyMH0.YS37JnHF1bdR35gunVTvEQdK7CvCUiGQffDWOoUOi3s';

// UI Elements
const greetingScreen = document.getElementById('greeting-screen');
const mainScreen = document.getElementById('main-screen');
const startBtn = document.getElementById('start-btn');
const greetingText = document.getElementById('greeting-text');
const voiceContainer = document.getElementById('voice-options-container');

const newsImage = document.getElementById('news-image');
const karaokeText = document.getElementById('karaoke-text');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

const debugConsole = document.getElementById('debug-console');
const debugLogs = document.getElementById('debug-logs');
const voiceSelect = document.getElementById('voice-select');
const clearHeardBtn = document.getElementById('clear-heard-btn');

// State
let synth = window.speechSynthesis;
let selectedVoice = null; // Can be a SpeechSynthesisVoice object or a string "rv:..."
let voices = [];
let currentClusters = [];
let currentIndex = 0;
let isPlaying = false;
let autoNextTimeout = null;
let imageInterval = null;
let currentImageIndex = 0;
let googleAudio = null; // To hold the current Google TTS Audio object
let currentPlaybackId = 0; // To prevent voices overlapping when clicking Next fast

// --- LOGGING ---
function log(msg, color = 'white') {
    if (!debugLogs) return;
    const div = document.createElement('div');
    div.style.color = color;
    div.innerText = `> ${new Date().toLocaleTimeString()}: ${msg}`;
    debugLogs.prepend(div);
    console.log(`[APP] ${msg}`);
}

// --- INITIALIZATION ---
function init() {
    log("Đang khởi tạo ứng dụng...");
    updateGreetingText();
    dailyReset();

    // 1. Initial Voice Load
    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = loadVoices;
    }

    // 2. Event Listeners
    startBtn.onclick = startListening;
    prevBtn.onclick = prevNews;
    nextBtn.onclick = nextNews;
    playPauseBtn.onclick = togglePlay;

    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'd') debugConsole.classList.toggle('hidden');
    });

    if (clearHeardBtn) {
        clearHeardBtn.onclick = () => {
            localStorage.setItem('heard', JSON.stringify([]));
            location.reload();
        };
    }

    // 3. Fallback: If no voices after 2s, show what we have
    setTimeout(() => {
        if (voiceContainer && voiceContainer.children.length === 0) {
            log("Thời gian chờ giọng đọc hệ thống đã hết, hiển thị giọng mặc định...");
            renderVoiceButtons();
        }
    }, 2000);
}

let lastVoiceCount = -1;
function loadVoices() {
    const newVoices = synth.getVoices();
    // Only proceed if count changed or we haven't loaded yet
    if (newVoices.length === lastVoiceCount && lastVoiceCount !== 0) return;

    lastVoiceCount = newVoices.length;
    voices = newVoices;
    log(`Đã tìm thấy ${voices.length} giọng hệ thống.`);
    renderVoiceButtons();
    updateVoiceSelect();
}

function renderVoiceButtons() {
    if (!voiceContainer) return;
    voiceContainer.innerHTML = '';

    // A. Native Vietnamese Voices - Filter to only keep "Linh"
    const viVoices = voices.filter(v => v.lang.includes('vi-VN') && v.name.includes('Linh'));
    
    // If no Linh found, just take the first Vietnamese voice
    const displayVoices = viVoices.length > 0 ? [viVoices[0]] : [voices.find(v => v.lang.includes('vi-VN'))];

    displayVoices.forEach((v, i) => {
        if (!v) return;
        addVoiceButton("Linh - Vietnamese", "Giọng chuẩn hệ thống", v);
    });

    // B. Premium/Bilingual Voices (Google Fallback)
    addVoiceButton("Google Cao cấp ⭐", "Giọng đọc chuyên nghiệp", "google:vi");

    // Default Selection
    if (!selectedVoice && voiceContainer.firstChild) {
        voiceContainer.firstChild.click();
    }
}

function addVoiceButton(label, subtext, voiceValue) {
    const btn = document.createElement('button');
    btn.className = 'voice-btn';
    btn.innerHTML = `${label} <span class="voice-tag">${subtext}</span>`;

    btn.onclick = () => {
        selectedVoice = voiceValue;
        document.querySelectorAll('.voice-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        log(`Đã chọn: ${label}`);
        
        // Add distinct auditory traits for variety
        if (subtext.includes('Bắc')) {
            window.currentVoiceTraits = { rate: 0.9, pitch: 1.15 };
        } else if (subtext.includes('Nam')) {
            window.currentVoiceTraits = { rate: 0.85, pitch: 0.9 };
        } else {
            window.currentVoiceTraits = { rate: 0.88, pitch: 1.0 };
        }
        
        log(`Đặc tính âm thanh: Tốc độ ${window.currentVoiceTraits.rate}, Độ cao ${window.currentVoiceTraits.pitch}`, 'gray');
        
        testAudio();
    };

    // Keep "selected" state if we re-render
    if (selectedVoice === voiceValue || (selectedVoice && selectedVoice.name === voiceValue.name)) {
        btn.classList.add('selected');
    }

    voiceContainer.appendChild(btn);
}

function updateVoiceSelect() {
    if (!voiceSelect) return;
    voiceSelect.innerHTML = '';
    voices.forEach((v, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `${v.name} (${v.lang})`;
        voiceSelect.appendChild(opt);
    });
}

// --- ACTIONS ---

function speakText(text, onEnd) {
    // Unified Pause for both systems
    synth.cancel();
    if (googleAudio) {
        googleAudio.pause();
        googleAudio.onended = null;
        googleAudio.ontimeupdate = null;
    }

    // Google Translate TTS Path
    if (typeof selectedVoice === 'string' && selectedVoice.startsWith('google:')) {
        const lang = selectedVoice.split(':')[1] || 'vi';
        playGoogleTTS(text, lang, onEnd);
        return;
    }

    // Native Path
    const u = new SpeechSynthesisUtterance(text);
    if (selectedVoice) u.voice = selectedVoice;
    u.lang = 'vi-VN';
    
    // Apply variations
    const traits = window.currentVoiceTraits || { rate: 0.85, pitch: 1.0 };
    u.rate = traits.rate;
    u.pitch = traits.pitch;
    
    u.onstart = () => { isPlaying = true; updatePlayBtn(); };
    u.onend = () => {
        isPlaying = false;
        updatePlayBtn();
        if (onEnd) onEnd();
    };
    synth.speak(u);
}

// Google TTS Multi-chunk Player
async function playGoogleTTS(text, lang, onEnd) {
    if (googleAudio) {
        googleAudio.pause();
        googleAudio = null;
    }

    // Split text into sentences, but avoid splitting on dots between numbers (decimals/thousands)
    const rawSentences = text.match(/.*?[.!?](?!\d)(\s+|$)|.+$/g) || [text];
    const chunks = [];
    let currentChunk = "";

    rawSentences.forEach(sentence => {
        const s = sentence.trim();
        if (!s) return;
        if ((currentChunk + " " + s).length <= 190) { // Keep a small buffer
            currentChunk += (currentChunk ? " " : "") + s;
        } else {
            if (currentChunk) chunks.push(currentChunk);
            if (s.length > 190) {
                const parts = s.match(/.{1,190}(\s|$)/g) || [s];
                parts.forEach(p => chunks.push(p.trim()));
                currentChunk = "";
            } else {
                currentChunk = s;
            }
        }
    });
    if (currentChunk) chunks.push(currentChunk);
    log(`Bắt đầu đọc Google TTS (${chunks.length} đoạn)...`, '#00ffff');

    currentPlaybackId++;
    const myPlaybackId = currentPlaybackId;

    isPlaying = true;
    updatePlayBtn();

    // Prepare HTML for highlighting
    karaokeText.innerHTML = chunks.map((c, i) => `<span id="chunk-${i}">${c}</span>`).join('');


    // 1. Bulk preloading: Load ALL segments immediately
    const audioQueue = new Array(chunks.length).fill(null);
    const preloadAll = () => {
        chunks.forEach((chunk, index) => {
            const url = `/api/tts?tl=${lang}&q=${encodeURIComponent(chunk.trim())}`;
            const audio = new Audio(url);
            audio.preload = "auto";
            audioQueue[index] = new Promise(resolve => {
                audio.oncanplaythrough = () => resolve(audio);
                audio.onerror = () => {
                    console.error(`TTS Load Error for segment ${index}`);
                    resolve(null);
                };
            });
        });
    };
    preloadAll();

    const playChunkRecursive = async (index) => {
        if (index >= chunks.length || !isPlaying || myPlaybackId !== currentPlaybackId) {
            if (index >= chunks.length && myPlaybackId === currentPlaybackId) {
                isPlaying = false;
                updatePlayBtn();
                if (onEnd) onEnd();
            }
            return;
        }

        // Highlight UI
        document.querySelectorAll('.karaoke-container span').forEach(s => s.classList.remove('highlight'));
        const activeSpan = document.getElementById(`chunk-${index}`);
        if (activeSpan) {
            activeSpan.classList.add('highlight');
            activeSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Get preloaded audio
        const audio = await audioQueue[index];
        if (myPlaybackId !== currentPlaybackId) return;

        if (!audio) {
            log("Mất kết nối đoạn này, đang chuyển tiếp...", "yellow");
            playChunkRecursive(index + 1);
            return;
        }

        googleAudio = audio;
        
        let nextTriggered = false;
        const triggerNext = () => {
            if (nextTriggered) return;
            nextTriggered = true;
            // Clean up to prevent double trigger
            audio.ontimeupdate = null;
            audio.onended = null;
            playChunkRecursive(index + 1);
        };

        // Aggressive gapless: Trigger next 0.35s before end 
        // to cover network/browser latency and Google TTS trailing silence
        audio.ontimeupdate = () => {
            if (audio.duration && audio.currentTime > audio.duration - 0.35) {
                triggerNext();
            }
        };
        audio.onended = triggerNext;

        audio.play().catch(err => {
            console.error("Playback failed:", err);
            isPlaying = false;
            updatePlayBtn();
        });
    };

    playChunkRecursive(0);
}


function testAudio() {
    speakText("Xin chào ông bà, con là giọng đọc tự động. Các từ tiếng Anh như Facebook, Google được phát âm rất rõ.");
}

async function startListening() {
    log("Bắt đầu nghe tin...");
    // Warm up Vercel TTS Proxy to prevent cold start delay
    fetch('/api/tts?q=warmup').catch(() => {});
    synth.speak(new SpeechSynthesisUtterance("")); // Unlock Audio

    speakText(greetingText.innerText, () => {
        greetingScreen.classList.add('hidden');
        mainScreen.classList.remove('hidden');
        loadAndPlayNews();
    });
}

async function loadAndPlayNews() {
    try {
        const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const { data, error } = await supabaseClient
            .from('news_clusters')
            .select('*')
            .order('priority', { ascending: true })
            .order('created_at', { ascending: false })
            .limit(30);

        if (error) throw error;

        const heard = JSON.parse(localStorage.getItem('heard') || '[]');
        currentClusters = data.filter(item => !heard.includes(item.id));

        if (currentClusters.length === 0) {
            karaokeText.innerText = "Không còn tin mới cho hôm bà ạ.";
            return;
        }

        currentIndex = 0;
        playCurrentCluster();
    } catch (err) {
        log("Lỗi: " + err.message, "red");
    }
}

function playCurrentCluster() {
    if (autoNextTimeout) {
        clearTimeout(autoNextTimeout);
        autoNextTimeout = null;
    }
    if (currentIndex >= currentClusters.length) return;
    const cluster = currentClusters[currentIndex];

    // Background/Image Logic
    stopImageCarousel();
    if (cluster.images && cluster.images.length > 0) {
        newsImage.src = cluster.images[0];
        if (cluster.images.length > 1) startImageCarousel(cluster.images);
    }

    karaokeText.innerText = cluster.summary;
    speakText(cluster.summary, () => {
        markAsHeard(cluster.id);
        autoNextTimeout = setTimeout(nextNews, 3000);
    });
}

// --- UTILS ---
function startImageCarousel(images) {
    currentImageIndex = 0;
    imageInterval = setInterval(() => {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        newsImage.style.opacity = 0;
        setTimeout(() => {
            newsImage.src = images[currentImageIndex];
            newsImage.style.opacity = 1;
        }, 300);
    }, 4000);
}

function stopImageCarousel() {
    if (imageInterval) clearInterval(imageInterval);
}

function nextNews() {
    if (currentIndex < currentClusters.length - 1) {
        currentIndex++;
        log(`Chuyển sang tin tiếp theo: ${currentIndex + 1}/${currentClusters.length}`);
        playCurrentCluster();
    } else {
        karaokeText.innerText = "Chúc ông bà một ngày tốt lành!";
    }
}

function prevNews() {
    if (currentIndex > 0) {
        currentIndex--;
        log(`Quay lại tin trước: ${currentIndex + 1}/${currentClusters.length}`);
        playCurrentCluster();
    }
}

function togglePlay() {
    if (typeof selectedVoice === 'string' && selectedVoice.startsWith('google:')) {
        if (googleAudio) {
            if (isPlaying) {
                googleAudio.pause();
                isPlaying = false;
                stopImageCarousel();
            } else {
                googleAudio.play();
                isPlaying = true;
                // Resume carousel if images exist
                const cluster = currentClusters[currentIndex];
                if (cluster && cluster.images && cluster.images.length > 1) startImageCarousel(cluster.images);
            }
        } else {
            playCurrentCluster();
        }
    } else if (synth.speaking) {
        if (synth.paused) {
            synth.resume();
            isPlaying = true;
            const cluster = currentClusters[currentIndex];
            if (cluster && cluster.images && cluster.images.length > 1) startImageCarousel(cluster.images);
        } else {
            synth.pause();
            isPlaying = false;
            stopImageCarousel();
        }
    } else {
        playCurrentCluster();
    }
    updatePlayBtn();
}

function updatePlayBtn() {
    playPauseBtn.innerText = isPlaying ? '⏸' : '⏯';
}

function markAsHeard(id) {
    let heard = JSON.parse(localStorage.getItem('heard') || '[]');
    if (!heard.includes(id)) {
        heard.push(id);
        localStorage.setItem('heard', JSON.stringify(heard));
    }
}

function updateGreetingText() {
    const now = new Date();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    greetingText.innerText = `Chào ông bà, cô chú anh chị, hôm nay là ${days[now.getDay()]} Ngày ${now.getDate()} Tháng ${now.getMonth() + 1}`;
}

function dailyReset() {
    const today = new Date().toDateString();
    if (localStorage.getItem('lastResetDate') !== today) {
        localStorage.setItem('heard', JSON.stringify([]));
        localStorage.setItem('lastResetDate', today);
    }
}

init();
