// ─── VOICE ASSISTANT ───

const VoiceAssistant = {
  recognition: null,
  synthesis: window.speechSynthesis,
  isListening: false,
  isSpeaking: false,
  transcript: '',

  init() {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser');
      if (window.updateVoiceUI) window.updateVoiceUI('error', 'Speech Recognition not supported');
      return false;
    }
    
    try {
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
      console.log('VoiceAssistant initialized successfully');
      return true;
    } catch (e) {
      console.error('Failed to initialize VoiceAssistant:', e);
      return false;
    }
  },

  setupRecognition() {
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      console.log('Speech recognition started');
      this.isListening = true;
      if (window.updateVoiceUI) window.updateVoiceUI('listening', '');
    };

    this.recognition.onresult = (event) => {
      console.log('Speech result event - resultIndex:', event.resultIndex, 'results.length:', event.results.length);
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        console.log('Result', i, '- isFinal:', event.results[i].isFinal, '- transcript:', transcriptPart);
        
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart + ' ';
        } else {
          interimTranscript += transcriptPart;
        }
      }
      
      this.transcript = finalTranscript + interimTranscript;
      console.log('Updated transcript:', this.transcript);
      
      if (window.updateVoiceUI) {
        console.log('Calling updateVoiceUI with transcript:', this.transcript);
        window.updateVoiceUI('listening', this.transcript);
      } else {
        console.error('updateVoiceUI function not available');
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (window.updateVoiceUI) window.updateVoiceUI('error', event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      console.log('Speech recognition ended. Final transcript:', this.transcript);
      this.isListening = false;
      // Don't auto-process - let user edit and send manually
      if (window.updateVoiceUI) window.updateVoiceUI('done', this.transcript);
    };
  },

  startListening() {
    if (!this.recognition) {
      console.error('VoiceAssistant: recognition not initialized');
      return;
    }
    if (this.isListening || this.isSpeaking) {
      console.warn('VoiceAssistant: already listening or speaking');
      return;
    }
    
    console.log('VoiceAssistant: Starting to listen');
    this.transcript = '';
    try {
      this.recognition.start();
    } catch (e) {
      console.error('VoiceAssistant: Error starting recognition:', e);
    }
  },

  stopListening() {
    if (this.recognition && this.isListening) {
      console.log('VoiceAssistant: Stopping listening');
      this.recognition.stop();
    }
  },

  speak(text) {
    return new Promise((resolve) => {
      // Cancel any ongoing speech
      this.synthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (window.updateVoiceUI) window.updateVoiceUI('speaking');
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        resolve();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        resolve();
      };

      this.synthesis.speak(utterance);
    });
  },

  processCommand(text) {
    const originalText = text;
    text = text.toLowerCase().trim();
    const d = FF.data;
    const t = FF.getTotals();
    let response = '';

    // Balance/Savings queries
    if (text.includes('balance') || text.includes('how much') || text.includes('total')) {
      const saved = t.income - t.spent;
      response = `Your current balance is ${FF.fmt(saved)}. You've saved ${t.rate}% of your income this month.`;
    }

    // Budget Status
    else if (text.includes('budget') || text.includes('limit')) {
      const overBudget = d.budgets.filter(b => b.spent > b.lim);
      if (overBudget.length > 0) {
        response = `You have ${overBudget.length} budget(s) over limit. `;
        overBudget.forEach(b => {
          response += `${b.cat} is over by ${FF.fmt(b.spent - b.lim)}. `;
        });
      } else {
        response = 'All your budgets are within limits. Great job!';
      }
    }

    // Spending queries
    else if (text.includes('spent') || text.includes('spending')) {
      const catMap = {};
      d.txs.filter(t => t.type === 'expense').forEach(t => {
        catMap[t.cat] = (catMap[t.cat] || 0) + t.amt;
      });
      const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
      response = `You've spent ${FF.fmt(t.spent)} this month. Your highest spending is on ${topCat[0]} with ${FF.fmt(topCat[1])}.`;
    }

    // Income queries
    else if (text.includes('income') || text.includes('earn')) {
      response = `Your total income this month is ${FF.fmt(t.income)}.`;
    }

    // Savings rate
    else if (text.includes('saving') || text.includes('savings rate')) {
      response = `Your savings rate is ${t.rate}% this month. ${parseFloat(t.rate) >= 20 ? 'Excellent work!' : 'Try to increase your savings to 20% or more.'}`;
    }

    // Goals
    else if (text.includes('goal')) {
      if (d.goals.length === 0) {
        response = 'You have no goals set yet. Create a financial goal to get started!';
      } else {
        response = `You have ${d.goals.length} goal(s). ${d.goals.map(g => `${g.name}: ${FF.fmt(g.amt)} by ${g.date}`).join('. ')}`;
      }
    }

    // Category analysis
    else if (text.includes('food') || text.includes('shopping') || text.includes('travel') || text.includes('health') || text.includes('leisure') || text.includes('bills')) {
      const category = Object.keys(d.budgets).find((cat) => {
        const budget = d.budgets.find(b => b.cat.toLowerCase() === cat.toLowerCase());
        return text.includes(budget?.cat.toLowerCase());
      });
      
      const budget = d.budgets.find(b => b.cat.toLowerCase().includes(text.split(' ')[0]));
      if (budget) {
        response = `Your ${budget.cat} budget: ${FF.fmt(budget.spent)} spent out of ${FF.fmt(budget.lim)}. That's ${Math.round(budget.spent / budget.lim * 100)}% of your limit.`;
      }
    }

    // Transaction count
    else if (text.includes('transaction') || text.includes('history')) {
      response = `You have ${d.txs.length} transaction(s) logged. Your most recent transaction was ${d.txs[0]?.name || 'N/A'}.`;
    }

    // Default helpful response
    else {
      response = `I can help you with: your balance, spending analysis, budget status, savings rate, and financial goals. What would you like to know?`;
    }

    // Send response to chat if callback exists
    if (window.addVoiceResponseToChat) {
      window.addVoiceResponseToChat(originalText, response);
    } else if (window.send) {
      // Fallback: add to input and process
      document.getElementById('cin').value = originalText;
    }

    // Speak the response
    this.speak(response);
  }
};

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => VoiceAssistant.init());
} else {
  VoiceAssistant.init();
}
