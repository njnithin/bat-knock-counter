class AIDetector {
  constructor() {
    this.model = null;
    this.isModelLoaded = false;
    this.currentBatName = null;
    
    // UI Elements
    this.smartModeBtnOn = document.getElementById('smartModeBtnOn');
    this.smartModeBtnOff = document.getElementById('smartModeBtnOff');
    this.aiCalibrationBtn = document.getElementById('aiCalibrationBtn');
    this.modal = document.getElementById('aiCalibrationModal');
    this.modalContent = document.getElementById('aiCalibrationModalContent');
    this.closeModalBtn = document.getElementById('closeAiCalibrationBtn');
    this.batNameDisplay = document.getElementById('calibrationBatName');
    
    this.recordBgBtn = document.getElementById('recordBgBtn');
    this.recordKnockBtn = document.getElementById('recordKnockBtn');
    this.trainBtn = document.getElementById('trainAiModelBtn');
    this.resetBtn = document.getElementById('resetAiModelBtn');
    
    this.bgSampleCountEl = document.getElementById('bgSampleCount');
    this.knockSampleCountEl = document.getElementById('knockSampleCount');
    this.progressBar = document.getElementById('aiTrainProgressBar');
    this.statusText = document.getElementById('aiTrainStatusText');
    
    // Data
    this.bgSamples = [];
    this.knockSamples = [];
    this.bgBurstCount = 0;
    this.knockBurstCount = 0;
    this.isRecording = false;
    this.isSmartModeEnabled = false;
    this.inputShape = 256; // 512 fftSize -> 256 frequency bins

    this.initEventListeners();
  }

  initEventListeners() {
    if (this.smartModeBtnOn) {
      this.smartModeBtnOn.addEventListener('click', () => {
        this.setSmartMode(true);
      });
    }
    if (this.smartModeBtnOff) {
      this.smartModeBtnOff.addEventListener('click', () => {
        this.setSmartMode(false);
      });
    }
    
    if (this.aiCalibrationBtn) {
      this.aiCalibrationBtn.addEventListener('click', () => this.openModal());
    }
    if (this.closeModalBtn) {
      this.closeModalBtn.addEventListener('click', () => this.closeModal());
    }
    
    if (this.recordBgBtn) {
      this.recordBgBtn.addEventListener('click', () => this.recordBurst('bg'));
    }
    
    if (this.recordKnockBtn) {
      this.recordKnockBtn.addEventListener('click', () => this.recordBurst('knock'));
    }
    
    if (this.trainBtn) {
      this.trainBtn.addEventListener('click', () => this.trainModel());
    }
    
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => this.resetModel());
    }
  }

  setSmartMode(enabled, skipSave = false) {
    if (enabled && !this.isModelLoaded) {
      this.openModal();
      return;
    }
    
    this.isSmartModeEnabled = enabled;
    
    // Save setting for this bat
    if (!skipSave && this.currentBatName && window.appData && window.appData.bats[this.currentBatName]) {
      window.appData.bats[this.currentBatName]._smartModeEnabled = enabled;
      if (typeof window.triggerSave === 'function') window.triggerSave();
    }
    
    if (enabled) {
      this.smartModeBtnOn.className = 'px-3 py-1 text-[11px] font-bold rounded-full transition-all bg-brand text-brand-contrast neu-shadow border-transparent border';
      this.smartModeBtnOff.className = 'px-3 py-1 text-[11px] font-bold rounded-full transition-all text-on-surface-variant hover:text-on-surface border-transparent border';
    } else {
      this.smartModeBtnOff.className = 'px-3 py-1 text-[11px] font-bold rounded-full transition-all bg-brand text-brand-contrast neu-shadow border-transparent border';
      this.smartModeBtnOn.className = 'px-3 py-1 text-[11px] font-bold rounded-full transition-all text-on-surface-variant hover:text-on-surface border-transparent border';
    }
    
    // Clear telemetry UI to prevent stale data when switching modes mid-recording
    const badge = document.getElementById('pingQualityBadge');
    if (badge) {
      badge.textContent = 'Ping Quality: N/A';
      badge.className = 'px-3 py-1 text-[11px] font-bold rounded-full bg-surface-container-high text-on-surface-variant neu-shadow-inset-sm transition-colors duration-300';
    }
    const freqDisplay = document.getElementById('pingFreqDisplay');
    if (freqDisplay) freqDisplay.textContent = 'Peak Freq: -- Hz';
    const descDisplay = document.getElementById('pingDescDisplay');
    if (descDisplay) descDisplay.textContent = 'Hit the bat to analyze';
  }

  openModal() {
    if (window.isListening) {
      const micBtn = document.getElementById('micToggleBtn');
      if (micBtn) micBtn.click();
    }
    
    this.batNameDisplay.textContent = this.currentBatName || "this bat";
    this.modal.classList.remove('opacity-0', 'pointer-events-none');
    this.modalContent.classList.remove('scale-90');
    this.modalContent.classList.add('scale-100');
    this.initStandaloneMic();
  }

  closeModal() {
    this.modal.classList.add('opacity-0', 'pointer-events-none');
    this.modalContent.classList.remove('scale-100');
    this.modalContent.classList.add('scale-90');
    this.stopStandaloneMic();
  }

  async initStandaloneMic() {
    if (this.standaloneAnalyser) return;
    try {
      this.standaloneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.standaloneAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.standaloneAnalyser = this.standaloneAudioCtx.createAnalyser();
      this.standaloneAnalyser.fftSize = 512;
      this.standaloneSource = this.standaloneAudioCtx.createMediaStreamSource(this.standaloneStream);
      this.standaloneSource.connect(this.standaloneAnalyser);
    } catch (e) {
      console.error("Mic access denied for calibration:", e);
      window.alert("Microphone access is required for calibration.");
    }
  }

  stopStandaloneMic() {
    if (this.standaloneAudioCtx && this.standaloneAudioCtx.state !== 'closed') {
      this.standaloneAudioCtx.close();
    }
    if (this.standaloneStream) {
      this.standaloneStream.getTracks().forEach(track => track.stop());
    }
    this.standaloneAnalyser = null;
    this.standaloneSource = null;
    this.standaloneStream = null;
    this.standaloneAudioCtx = null;
  }

  async loadModelForBat(batName) {
    this.currentBatName = batName;
    this.isModelLoaded = false;
    this.bgSamples = [];
    this.knockSamples = [];
    this.bgBurstCount = 0;
    this.knockBurstCount = 0;
    this.updateSampleCounts();
    this.setSmartMode(false, true); // default, don't save
    this.aiCalibrationBtn.classList.remove('hidden'); // Always allow calibration
    
    // Restore UI from bat settings
    const batSettings = (window.appData && window.appData.bats[batName]) ? window.appData.bats[batName] : {};
    
    // Restore sensitivity
    if (batSettings._sensitivity) {
      const micSensEl = document.getElementById('micSensitivity');
      if (micSensEl) micSensEl.value = batSettings._sensitivity;
    } else {
      const micSensEl = document.getElementById('micSensitivity');
      if (micSensEl) micSensEl.value = 50; // Default
    }
    
    // Restore Auto Switch
    if (window.updateAutoSwitchUI) {
       window.isAutoSwitchOn = batSettings._isAutoSwitchOn || false;
       window.updateAutoSwitchUI();
    }
    
    try {
      this.model = await tf.loadLayersModel(`indexeddb://knock-model-${batName}`);
      this.isModelLoaded = true;
      console.log(`Loaded AI model for ${batName}`);
      
      this.bgBurstCount = batSettings._bgBurstCount || 0;
      this.knockBurstCount = batSettings._knockBurstCount || 0;
      this.updateSampleCounts();
      
      this.updateStatusUI(true);
      
      const savedSmartMode = batSettings._smartModeEnabled !== undefined ? batSettings._smartModeEnabled : true;
      this.setSmartMode(savedSmartMode, true);
    } catch (e) {
      console.log(`No model found for ${batName}.`);
      this.model = null;
      this.updateStatusUI(false);
      this.bgSamples = [];
      this.knockSamples = [];
      this.bgBurstCount = 0;
      this.knockBurstCount = 0;
      this.updateSampleCounts();
      this.checkTrainBtnState();
    }
  }
  
  async deleteModelForBat(batName) {
    try {
      await tf.io.removeModel(`indexeddb://knock-model-${batName}`);
      console.log(`Deleted model for ${batName}`);
    } catch (e) {
      console.log(`No model to delete for ${batName}`);
    }
  }

  async resetModel() {
    if (this.currentBatName) {
      await this.deleteModelForBat(this.currentBatName);
      this.model = null;
      this.isModelLoaded = false;
      this.setSmartMode(false);
      this.bgSamples = [];
      this.knockSamples = [];
      this.bgBurstCount = 0;
      this.knockBurstCount = 0;
      this.updateSampleCounts();
      this.checkTrainBtnState();
      this.updateStatusUI(false);
      window.alert("Model reset successfully.");
    }
  }

  updateStatusUI(isTrained) {
    if (isTrained) {
      this.progressBar.style.width = '100%';
      this.statusText.textContent = 'Trained';
      this.statusText.classList.add('text-brand');
      this.trainBtn.innerHTML = `<span class="material-symbols-outlined text-[16px]">model_training</span> Re-Train`;
      
      this.aiCalibrationBtn.classList.remove('bg-surface-container', 'text-on-surface-variant', 'hover:bg-surface-container-high', 'hover:text-brand');
      this.aiCalibrationBtn.classList.add('bg-brand', 'text-brand-contrast');
      this.aiCalibrationBtn.innerHTML = `<span class="material-symbols-outlined text-[16px]">psychology</span>`;
    } else {
      this.progressBar.style.width = '0%';
      this.statusText.textContent = 'Not Trained';
      this.statusText.classList.remove('text-brand');
      this.trainBtn.innerHTML = `<span class="material-symbols-outlined text-[16px]">model_training</span> Train`;
      
      this.aiCalibrationBtn.classList.add('bg-surface-container', 'text-on-surface-variant', 'hover:bg-surface-container-high', 'hover:text-brand');
      this.aiCalibrationBtn.classList.remove('bg-brand', 'text-brand-contrast');
      this.aiCalibrationBtn.innerHTML = `<span class="material-symbols-outlined text-[16px]">tune</span>`;
    }
  }

  async recordBurst(type) {
    if (!this.standaloneAnalyser) {
      window.alert("Microphone not initialized. Please ensure mic permissions are granted.");
      return;
    }
    
    const btn = type === 'bg' ? this.recordBgBtn : this.recordKnockBtn;
    const otherBtn = type === 'bg' ? this.recordKnockBtn : this.recordBgBtn;
    const originalText = btn.innerHTML;
    const icon = type === 'bg' ? 'mic' : 'sports_cricket';
    
    btn.innerHTML = `
      <div class="opacity-0 pointer-events-none">${originalText}</div>
      <canvas id="recordCanvas_${type}" class="absolute inset-0 w-full h-full pointer-events-none opacity-100"></canvas>
      <div class="absolute inset-0 m-auto w-9 h-9 bg-surface-container-highest rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.6)] border border-outline-variant/50 z-10 backdrop-blur-sm">
        <span id="recordCountdown_${type}" class="text-brand font-bold text-[10px] tracking-wider drop-shadow-md">10.0s</span>
      </div>
    `;
    btn.classList.add('relative', 'overflow-hidden', '!opacity-100', 'ring-1', 'ring-brand');
    btn.disabled = true;
    otherBtn.disabled = true;
    this.trainBtn.disabled = true;
    this.resetBtn.disabled = true;
    
    this.isRecording = true;
    this.recordType = type;
    
    // Start Waveform drawing loop
    const canvas = document.getElementById(`recordCanvas_${type}`);
    const ctx = canvas.getContext('2d');
    canvas.width = btn.clientWidth;
    canvas.height = btn.clientHeight;
    
    const drawWaveform = () => {
      if (!this.isRecording || this.recordType !== type) return;
      requestAnimationFrame(drawWaveform);
      
      const bufferLength = this.standaloneAnalyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      this.standaloneAnalyser.getByteTimeDomainData(dataArray);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2.5;
      const brandColor = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#d4ff37';
      ctx.strokeStyle = brandColor;
      ctx.beginPath();
      
      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;
      
      for(let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        if(i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    drawWaveform();
    
    // Record for 10 seconds (100 samples at 100ms intervals)
    let samplesCollected = 0;
    const countdownEl = document.getElementById(`recordCountdown_${type}`);
    
    const interval = setInterval(() => {
      this.recordSingleSample(type);
      samplesCollected++;
      
      const timeLeft = ((100 - samplesCollected) / 10).toFixed(1);
      if (countdownEl) countdownEl.textContent = `${timeLeft}s`;
      
      if (samplesCollected >= 100) {
        clearInterval(interval);
        this.isRecording = false;
        if (type === 'bg') this.bgBurstCount++;
        else this.knockBurstCount++;
        
        btn.classList.remove('relative', 'overflow-hidden', '!opacity-100', 'ring-1', 'ring-brand');
        btn.innerHTML = `<span class="material-symbols-outlined text-[16px]">${icon}</span> Record`;
        btn.disabled = false;
        otherBtn.disabled = false;
        this.resetBtn.disabled = false;
        this.updateSampleCounts();
        this.checkTrainBtnState();
      }
    }, 100);
  }

  recordSingleSample(type) {
    if (!this.standaloneAnalyser) return;
    const freqData = new Uint8Array(this.standaloneAnalyser.frequencyBinCount);
    this.standaloneAnalyser.getByteFrequencyData(freqData);
    
    const normalized = Array.from(freqData).map(val => val / 255.0);
    
    if (type === 'bg') {
      this.bgSamples.push(normalized);
    } else if (type === 'knock') {
      const maxVal = Math.max(...normalized);
      if (maxVal > 0.05) {
        this.knockSamples.push(normalized);
      }
    }
    
    this.updateSampleCounts();
  }

  updateSampleCounts() {
    this.bgSampleCountEl.textContent = this.bgBurstCount;
    this.knockSampleCountEl.textContent = this.knockBurstCount;
  }

  checkTrainBtnState() {
    if (this.bgBurstCount >= 1 && this.knockBurstCount >= 1 && this.bgSamples.length > 10 && this.knockSamples.length > 5) {
      this.trainBtn.disabled = false;
    } else {
      this.trainBtn.disabled = true;
    }
  }

  buildModel() {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [this.inputShape] }));
    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 2, activation: 'softmax' }));
    
    model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
    
    return model;
  }

  async trainModel() {
    if (this.bgSamples.length === 0 || this.knockSamples.length === 0) return;
    
    this.trainBtn.disabled = true;
    this.recordBgBtn.disabled = true;
    this.recordKnockBtn.disabled = true;
    this.resetBtn.disabled = true;
    
    this.statusText.textContent = 'Training...';
    this.statusText.classList.remove('text-brand');
    
    // Prepare Data
    const features = [...this.bgSamples, ...this.knockSamples];
    const labels = [
      ...Array(this.bgSamples.length).fill([1, 0]), // Background: [1, 0]
      ...Array(this.knockSamples.length).fill([0, 1]) // Knock: [0, 1]
    ];
    
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels);
    
    this.model = this.buildModel();
    
    try {
      await this.model.fit(xs, ys, {
        epochs: 15,
        shuffle: true,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            const progress = Math.round(((epoch + 1) / 15) * 100);
            this.progressBar.style.width = `${progress}%`;
            this.statusText.textContent = `${progress}%`;
            await tf.nextFrame(); // Yield to main thread so animation doesn't freeze
          }
        }
      });
      
      this.isModelLoaded = true;
      this.updateStatusUI(true);
      
      // Save the model
      if (this.currentBatName) {
        await this.model.save(`indexeddb://knock-model-${this.currentBatName}`);
        console.log(`Saved model for ${this.currentBatName}`);
        
        if (window.appData && window.appData.bats[this.currentBatName]) {
          window.appData.bats[this.currentBatName]._bgBurstCount = this.bgBurstCount;
          window.appData.bats[this.currentBatName]._knockBurstCount = this.knockBurstCount;
          if (window.triggerSave) window.triggerSave();
        }
      }
      
      window.alert("Model trained successfully! Smart Mode is now available.");
      this.setSmartMode(true);
      
    } catch (e) {
      console.error("Training error:", e);
      window.alert("Error training model. Check console.");
      this.updateStatusUI(false);
    } finally {
      xs.dispose();
      ys.dispose();
      this.trainBtn.disabled = false;
      this.recordBgBtn.disabled = false;
      this.recordKnockBtn.disabled = false;
      this.resetBtn.disabled = false;
    }
  }

  async predict(freqData) {
    if (!this.model || !this.isModelLoaded || !this.isSmartModeEnabled) return null;
    
    const normalized = Array.from(freqData).map(val => val / 255.0);
    
    // Only predict if there is some sound (threshold gate to save compute and prevent phantom knocks)
    if (Math.max(...normalized) < 0.15) return { isKnock: false, confidence: 0 };
    
    return tf.tidy(() => {
      const input = tf.tensor2d([normalized]);
      const prediction = this.model.predict(input);
      const scores = prediction.dataSync();
      
      const knockConfidence = scores[1];
      
      return {
        isKnock: knockConfidence > 0.85,
        confidence: knockConfidence
      };
    });
  }
}

// Initialize global instance
window.aiDetector = new AIDetector();
