const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');
const logger = require('../utils/logger');

const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

const VALID_CATEGORIES = ['Hardware', 'Software', 'Network', 'Printer', 'Email', 'Internet', 'System Issue', 'Other'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High'];

function getModel(index = 0) {
  if (!genAI) return null;
  return genAI.getGenerativeModel({ model: MODELS[index] || MODELS[0] });
}

async function withFallback(fn) {
  if (!genAI) throw new Error('Gemini API key not configured');
  let lastErr;
  for (let i = 0; i < MODELS.length; i++) {
    try {
      const model = getModel(i);
      if (!model) break;
      return await fn(model);
    } catch (err) {
      lastErr = err;
      logger.warn(`AI model ${MODELS[i]} attempt failed: ${err.message}`);
      if (!err.message?.includes('503') && !err.message?.includes('429') && !err.message?.includes('404')) {
        break;
      }
    }
  }
  throw lastErr;
}

function cleanResponse(text) {
  if (!text) return '';
  return text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/```json/g, '').replace(/```/g, '').trim();
}

// ----------------------------------------------------
// 1. AI CHAT
// ----------------------------------------------------
async function chatWithAI({ message, history = [] }) {
  const sysPrompt = `You are OpsPulse AI Assistant, an enterprise IT service management and complaint resolution bot.
Help employees and IT admins with:
- Filing and tracking IT complaints, hardware, software, and network issues
- Fast self-service troubleshooting steps
- Understanding IT policies, SLA priority levels (Low, Medium, High)
Keep answers structured, crisp, polite, and helpful with bullet points where appropriate.`;

  try {
    const result = await withFallback(async (m) => {
      const chat = m.startChat({
        history: [
          { role: 'user', parts: [{ text: sysPrompt + '\n\nAcknowledge with: "Hello! I am your OpsPulse AI IT Copilot. How can I assist you today?"' }] },
          { role: 'model', parts: [{ text: 'Hello! I am your OpsPulse AI IT Copilot. How can I assist you today?' }] },
          ...history.map(h => ({ role: h.role === 'assistant' ? 'model' : h.role, parts: [{ text: h.text }] })),
        ],
      });
      return await chat.sendMessage(message);
    });
    return cleanResponse(result.response.text());
  } catch (err) {
    logger.warn(`Chat AI fallback triggered: ${err.message}`);
    // Smart heuristic response
    const lower = (message || '').toLowerCase();
    if (lower.includes('login') || lower.includes('password') || lower.includes('credential')) {
      return "For login issues, make sure you enter either your registered Email Address or Employee ID (e.g. EMP001). If you forgot your password, contact your IT administrator to reset your credentials.";
    }
    if (lower.includes('wifi') || lower.includes('internet') || lower.includes('network')) {
      return "For internet/network issues:\n1. Verify your Wi-Fi is toggled ON and connected to the corporate SSID.\n2. Disconnect and reconnect your VPN tunnel.\n3. Try flushing your DNS cache: open CMD and run 'ipconfig /flushdns'.\n4. If the issue persists, raise an 'Internet' or 'Network' ticket!";
    }
    if (lower.includes('printer') || lower.includes('print')) {
      return "For printer issues:\n1. Check if the printer has paper and toner lights are green.\n2. Restart the Windows Print Spooler service.\n3. Verify your computer is on the same subnet as the printer.\n4. Raise a 'Printer' complaint with the printer ID or floor location.";
    }
    if (lower.includes('raise') || lower.includes('complaint') || lower.includes('report') || lower.includes('ticket')) {
      return "To raise a complaint, click 'Raise Complaint' on your sidebar menu. Provide a clear title, select the category (Hardware, Software, Network, etc.), add the description, and click 'AI Suggest' to automatically classify category and priority!";
    }
    return `Hello! I am your OpsPulse AI IT Copilot. I'm here to assist you with raising tickets, diagnosing IT errors (Hardware, Network, Software, Printers), and tracking resolution status. How can I help you right now?`;
  }
}

// ----------------------------------------------------
// 2. CATEGORIZE COMPLAINT
// ----------------------------------------------------
async function categorizeComplaint(description) {
  const prompt = `Analyze this IT complaint and categorize it into EXACTLY ONE of the following:
Hardware, Software, Network, Printer, Email, Internet, System Issue, Other.

Reply with ONLY the exact category name from the list above, nothing else.

Complaint: "${description}"`;

  try {
    const result = await withFallback(m => m.generateContent(prompt));
    const raw = cleanResponse(result.response.text());
    const matched = VALID_CATEGORIES.find(c => c.toLowerCase() === raw.toLowerCase());
    if (matched) return matched;
  } catch (err) {
    logger.warn(`AI categorize fallback: ${err.message}`);
  }

  // Fallback NLP rules
  const desc = (description || '').toLowerCase();
  if (/printer|print|scanner|toner|cartridge|paper jam/i.test(desc)) return 'Printer';
  if (/outlook|email|mail|mailbox|spam|inbox|smtp/i.test(desc)) return 'Email';
  if (/wifi|wi-fi|internet|browser|chrome|firefox|website|url/i.test(desc)) return 'Internet';
  if (/vpn|network|lan|router|switch|firewall|ip address|dns/i.test(desc)) return 'Network';
  if (/laptop|screen|display|keyboard|mouse|monitor|battery|charger|hard drive|ssd|ram|motherboard/i.test(desc)) return 'Hardware';
  if (/crash|freeze|blue screen|bsod|slow|lag|hanging|reboot/i.test(desc)) return 'System Issue';
  if (/software|app|license|install|update|excel|word|teams|zoom|application|error code/i.test(desc)) return 'Software';
  return 'Other';
}

// ----------------------------------------------------
// 3. DETECT PRIORITY
// ----------------------------------------------------
async function detectPriority(description) {
  const prompt = `Analyze this IT complaint and determine priority: Low, Medium, or High.
- High: System down, business blocked, security concern, executive affected, multiple users blocked.
- Medium: Normal work impacted with workaround, performance degradation, software bug.
- Low: Minor question, cosmetic glitch, future request, single accessory.

Reply with ONLY one word: Low, Medium, or High.

Complaint: "${description}"`;

  try {
    const result = await withFallback(m => m.generateContent(prompt));
    const raw = cleanResponse(result.response.text());
    if (/high|critical|urgent|blocker/i.test(raw)) return 'High';
    if (/medium|moderate/i.test(raw)) return 'Medium';
    if (/low|minor/i.test(raw)) return 'Low';
  } catch (err) {
    logger.warn(`AI priority fallback: ${err.message}`);
  }

  const desc = (description || '').toLowerCase();
  if (/urgent|critical|immediately|emergency|down|broken|cannot work|blocked|production|firewall|security|hacked/i.test(desc)) {
    return 'High';
  }
  if (/error|failed|issue|slow|not working|problem|unable/i.test(desc)) {
    return 'Medium';
  }
  return 'Low';
}

// ----------------------------------------------------
// 4. GENERATE SUMMARY
// ----------------------------------------------------
async function generateSummary(complaintText) {
  const prompt = `Summarize this IT complaint in 1-2 concise, professional sentences for an IT engineer dashboard:
"${complaintText}"`;

  try {
    const result = await withFallback(m => m.generateContent(prompt));
    return cleanResponse(result.response.text());
  } catch (err) {
    logger.warn(`AI summary fallback: ${err.message}`);
    const words = (complaintText || '').split(' ');
    if (words.length <= 25) return complaintText;
    return words.slice(0, 25).join(' ') + '... (review ticket for full details)';
  }
}

// ----------------------------------------------------
// 5. SUGGEST REPLY
// ----------------------------------------------------
async function suggestReply(complaint) {
  const prompt = `You are a senior IT Support Specialist. Suggest a friendly, professional 2-sentence response for this ticket:
Title: ${complaint.title}
Category: ${complaint.category}
Priority: ${complaint.priority}
Description: ${complaint.description}

Acknowledge the issue and provide clear next steps.`;

  try {
    const result = await withFallback(m => m.generateContent(prompt));
    return cleanResponse(result.response.text());
  } catch (err) {
    logger.warn(`AI suggest reply fallback: ${err.message}`);
    return `Thank you for reporting this issue regarding "${complaint.title}". Our IT Operations team has logged your ticket and an engineer is actively reviewing the diagnostics to provide a prompt resolution.`;
  }
}

// ----------------------------------------------------
// 6. ENHANCE DESCRIPTION (NEW FEATURE)
// ----------------------------------------------------
async function enhanceDescription(title, description) {
  const prompt = `You are an IT Support Analyst. Rewrite and expand this rough user complaint into a clean, professional IT support ticket specification.
Include:
- Summary of Problem
- Probable Impact
- Suggested Verification Steps

Title: ${title}
Raw Description: ${description}

Format with clear headers and bullet points. Keep it under 150 words.`;

  try {
    const result = await withFallback(m => m.generateContent(prompt));
    return cleanResponse(result.response.text());
  } catch (err) {
    return `**Problem Summary**: ${title} - ${description}\n**Impact**: Standard operational impact reported by user.\n**Action**: IT Engineer assigned to verify device configuration and test connectivity.`;
  }
}

// ----------------------------------------------------
// 7. SUGGEST TROUBLESHOOTING (NEW FEATURE)
// ----------------------------------------------------
async function suggestTroubleshooting(category, description) {
  const prompt = `Provide 3 quick, safe self-service troubleshooting steps a user can try right now for this IT issue:
Category: ${category}
Issue: ${description}

Format as a JSON array of 3 strings (e.g. ["Step 1...", "Step 2...", "Step 3..."]). Reply with ONLY the JSON array.`;

  try {
    const result = await withFallback(m => m.generateContent(prompt));
    const text = cleanResponse(result.response.text());
    return JSON.parse(text);
  } catch (err) {
    // Curated quick fixes by category
    const cat = (category || '').toLowerCase();
    if (cat.includes('printer')) {
      return [
        'Check paper tray alignment and verify printer power cable is firmly seated.',
        'Restart the Windows Print Spooler service via services.msc.',
        'Remove printer in Settings and click "Add Device" to re-sync network drivers.'
      ];
    }
    if (cat.includes('network') || cat.includes('internet')) {
      return [
        'Disconnect and reconnect your corporate VPN client.',
        'Run Command Prompt as Administrator and execute "ipconfig /flushdns".',
        'Toggle Airplane mode ON for 5 seconds, then reconnect to the corporate Wi-Fi.'
      ];
    }
    if (cat.includes('hardware')) {
      return [
        'Disconnect all peripheral USB hubs and external monitors, then reboot.',
        'Perform a 30-second hard power cycle with charger connected.',
        'Check Device Manager for yellow warning indicators on display or input adapters.'
      ];
    }
    return [
      'Restart the affected application and test again.',
      'Check if operating system or browser updates are pending installation.',
      'Clear application cache and temp files, then restart your workstation.'
    ];
  }
}

// ----------------------------------------------------
// 8. SENTIMENT & DUPLICATE
// ----------------------------------------------------
async function analyzeSentiment(text) {
  const prompt = `Analyze the sentiment of this text. Reply with exactly one word: Positive, Negative, or Neutral: "${text}"`;
  try {
    const result = await withFallback(m => m.generateContent(prompt));
    const s = cleanResponse(result.response.text());
    if (/positive/i.test(s)) return 'Positive';
    if (/negative/i.test(s)) return 'Negative';
    return 'Neutral';
  } catch {
    if (/urgent|terrible|broken|worst|unacceptable|furious/i.test(text)) return 'Negative';
    if (/thanks|great|good|appreciate|resolved/i.test(text)) return 'Positive';
    return 'Neutral';
  }
}

async function detectDuplicate(newComplaint, existingComplaints) {
  if (!existingComplaints || existingComplaints.length === 0) return 'NONE';
  const prompt = `Compare this new complaint with the existing ones. If it is an obvious duplicate (same machine/issue), reply with the ID. Otherwise reply with "NONE".
New: "${newComplaint.title} - ${newComplaint.description}"
Existing:
${existingComplaints.slice(0, 5).map(c => `[${c._id}] ${c.title}`).join('\n')}`;

  try {
    const result = await withFallback(m => m.generateContent(prompt));
    return cleanResponse(result.response.text());
  } catch {
    return 'NONE';
  }
}

// ----------------------------------------------------
// 9. EXECUTIVE INSIGHTS
// ----------------------------------------------------
async function generateInsights(complaintsData) {
  const prompt = `Analyze these IT complaint metrics and generate 3 strategic management insights.
Metrics:
- Total: ${complaintsData.total}
- Open: ${complaintsData.open}
- Resolved: ${complaintsData.resolved}
- By Category: ${JSON.stringify(complaintsData.byCategory || {})}
- High Priority: ${complaintsData.highPriority || 0}

Reply with ONLY a valid JSON array of 3 string items.`;

  try {
    const result = await withFallback(m => m.generateContent(prompt));
    const text = cleanResponse(result.response.text());
    return JSON.parse(text);
  } catch (err) {
    const total = complaintsData.total || 0;
    const resolved = complaintsData.resolved || 0;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;
    return [
      `Overall resolution efficiency is currently at ${resolutionRate}% across all logged departmental tickets.`,
      `Highest ticket frequency is centered in ${Object.keys(complaintsData.byCategory || {})[0] || 'Hardware/Software'} infrastructure.`,
      `Proactive preventive maintenance is recommended to minimize high-priority escalations during peak hours.`
    ];
  }
}

// ----------------------------------------------------
// 10. ROOT CAUSE ANALYSIS (RCA) & RESOLUTION PLAN
// ----------------------------------------------------
async function generateRCA({ title, description, category, priority }) {
  const prompt = `You are a Principal IT Infrastructure & DevOps Engineer. Analyze this operational ticket and formulate a structured Root Cause Analysis (RCA) and resolution playbook:
Title: ${title}
Category: ${category}
Priority: ${priority}
Description: ${description}

Reply with ONLY a valid JSON object with EXACTLY these keys:
{
  "rootCause": "Clear explanation of technical root cause or failure mechanism",
  "resolutionSteps": ["Step 1...", "Step 2...", "Step 3..."],
  "preventiveAction": "Policy, patch, or configuration to prevent future recurrence",
  "estimatedTime": "Estimated resolution time (e.g. 15-30 minutes)",
  "severityAssessment": "Severity rating (Minor, Major, or Mission Critical)"
}`;

  try {
    const result = await withFallback(m => m.generateContent(prompt));
    const text = cleanResponse(result.response.text());
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    logger.warn(`AI RCA fallback triggered: ${err.message}`);
  }

  // Robust Domain Heuristics for RCA
  const cat = (category || '').toLowerCase();
  const desc = (description || '').toLowerCase() + ' ' + (title || '').toLowerCase();

  if (cat.includes('network') || desc.includes('vpn') || desc.includes('wifi') || desc.includes('dns')) {
    return {
      rootCause: 'VPN tunnel negotiation timeout or DHCP / DNS lease renewal stall on corporate gateway.',
      resolutionSteps: [
        'Flush local DNS resolver cache using "ipconfig /flushdns".',
        'Verify corporate VPN gateway tunnel authentication and split-tunnel routes.',
        'Reset TCP/IP stack using "netsh int ip reset" and restart workstation network adapter.'
      ],
      preventiveAction: 'Increase gateway keepalive interval and ensure device VPN client is updated to latest build.',
      estimatedTime: '10 - 20 minutes',
      severityAssessment: priority === 'High' ? 'Mission Critical' : 'Major'
    };
  }

  if (cat.includes('printer') || desc.includes('print')) {
    return {
      rootCause: 'Corrupt print job stalled in Windows Print Spooler subsystem or subnet IP communication timeout.',
      resolutionSteps: [
        'Stop the Windows Print Spooler service via services.msc.',
        'Clear pending job files from "C:\\Windows\\System32\\spool\\PRINTERS\\".',
        'Restart the Spooler service and test print a diagnostic alignment page.'
      ],
      preventiveAction: 'Configure printer spooler auto-purge for orphaned jobs older than 12 hours.',
      estimatedTime: '15 - 25 minutes',
      severityAssessment: 'Minor'
    };
  }

  if (cat.includes('hardware') || desc.includes('laptop') || desc.includes('screen') || desc.includes('battery')) {
    return {
      rootCause: 'Hardware driver interrupt conflict or peripheral power controller voltage sag.',
      resolutionSteps: [
        'Disconnect all secondary display adapters and USB-C hubs.',
        'Perform a 30-second EC (embedded controller) hard power reset.',
        'Check Device Manager for yellow exclamation marks and reload vendor OEM chipset driver.'
      ],
      preventiveAction: 'Run scheduled OEM firmware & BIOS diagnostic check on hardware cycle.',
      estimatedTime: '20 - 45 minutes',
      severityAssessment: priority === 'High' ? 'Mission Critical' : 'Major'
    };
  }

  return {
    rootCause: 'Runtime application exception or corrupted localized profile configuration cache.',
    resolutionSteps: [
      'Terminate rogue background processes via Task Manager.',
      'Clear application local appdata cache and temporary profile state.',
      'Re-verify user authorization tokens and restart the application client.'
    ],
    preventiveAction: 'Audit application log streams and apply the latest stable service patch.',
    estimatedTime: '15 - 30 minutes',
    severityAssessment: priority === 'High' ? 'Major' : 'Minor'
  };
}

// ----------------------------------------------------
// 11. SLA & INCIDENT RISK PREDICTION
// ----------------------------------------------------
async function predictSlaRisk({ title, category, priority, createdAt }) {
  const created = createdAt ? new Date(createdAt) : new Date();
  const elapsedHours = Math.max(0, (Date.now() - created.getTime()) / (1000 * 60 * 60));
  
  const targetHours = priority === 'High' ? 4 : priority === 'Medium' ? 12 : 24;
  const remainingHours = Math.max(0, targetHours - elapsedHours);
  const percentageConsumed = Math.min(100, Math.round((elapsedHours / targetHours) * 100));

  let riskLevel = 'Low';
  if (percentageConsumed >= 75) riskLevel = 'Critical';
  else if (percentageConsumed >= 50) riskLevel = 'Moderate';

  return {
    slaTargetHours: targetHours,
    elapsedHours: Math.round(elapsedHours * 10) / 10,
    remainingHours: Math.round(remainingHours * 10) / 10,
    percentageConsumed,
    riskLevel,
    isBreached: elapsedHours > targetHours,
    recommendation: riskLevel === 'Critical' 
      ? 'Immediate engineer escalation required to prevent SLA penalty.'
      : 'Ticket is currently progressing within compliant SLA thresholds.'
  };
}

module.exports = {
  chatWithAI,
  categorizeComplaint,
  detectPriority,
  generateSummary,
  suggestReply,
  enhanceDescription,
  suggestTroubleshooting,
  analyzeSentiment,
  detectDuplicate,
  generateInsights,
  generateRCA,
  predictSlaRisk
};

