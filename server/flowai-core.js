const path = require("path");
const dotenv = require("dotenv");

// Load env files from common locations for local dev.
const candidateEnvFiles = [
  path.resolve(process.cwd(), ".env.local"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(__dirname, "..", ".env.local"),
  path.resolve(__dirname, "..", ".env")
];
for (const envPath of candidateEnvFiles) {
  dotenv.config({ path: envPath, override: false });
}

const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const RUNTIME_VERSION = "flowai-runtime-v3";

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function normalizeTransactions(txs) {
  if (!Array.isArray(txs)) return [];
  return txs.slice(0, 80).map((tx) => ({
    name: String(tx?.name || "Unknown"),
    type: String(tx?.type || "expense"),
    cat: String(tx?.cat || "Other"),
    amt: toNumber(tx?.amt, 0),
    date: String(tx?.date || "Unknown")
  }));
}

function normalizeBudgets(budgets) {
  if (!Array.isArray(budgets)) return [];
  return budgets.slice(0, 20).map((b) => ({
    cat: String(b?.cat || "Other"),
    spent: toNumber(b?.spent, 0),
    lim: toNumber(b?.lim, 0)
  }));
}

function normalizeGoals(goals) {
  if (!Array.isArray(goals)) return [];
  return goals.slice(0, 20).map((g) => ({
    name: String(g?.name || "Goal"),
    target: toNumber(g?.target ?? g?.amt ?? g?.lim, 0),
    saved: toNumber(g?.saved ?? g?.current ?? 0, 0)
  }));
}

function normalizeSubscriptions(subscriptions) {
  if (!Array.isArray(subscriptions)) return [];
  return subscriptions.slice(0, 80).map((s) => {
    const amount = toNumber(s?.amount ?? 0, 0);
    const cycle = String(s?.cycle || "monthly").trim().toLowerCase() || "monthly";
    const monthlyCost = cycle === "yearly"
      ? amount / 12
      : cycle === "quarterly"
        ? amount / 3
        : cycle === "weekly"
          ? (amount * 52) / 12
          : amount;

    return {
      name: String(s?.name || "Subscription"),
      category: String(s?.category || "Other"),
      amount: round(Math.max(amount, 0), 2),
      cycle,
      monthlyCost: round(Math.max(monthlyCost, 0), 2),
      nextBillingDate: String(s?.nextBillingDate || ""),
      autoRenew: s?.autoRenew !== false,
      status: String(s?.status || "active")
    };
  });
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];

  const out = [];
  for (const item of history.slice(-10)) {
    const roleRaw = String(item?.role || "").toLowerCase();
    const content = String(item?.content || "").trim().slice(0, 800);
    if (!content) continue;
    if (roleRaw === "user" || roleRaw === "assistant") {
      out.push({ role: roleRaw, content });
    }
  }

  return out;
}

function normalizeWealth(raw = {}) {
  const assets = Array.isArray(raw?.assets)
    ? raw.assets.slice(0, 80).map((a) => ({
        name: String(a?.name || "Asset"),
        type: String(a?.type || "Other"),
        value: toNumber(a?.value ?? a?.amount ?? 0, 0)
      }))
    : [];

  const liabilities = Array.isArray(raw?.liabilities)
    ? raw.liabilities.slice(0, 80).map((l) => ({
        name: String(l?.name || "Liability"),
        type: String(l?.type || "Other"),
        linkedTo: String(l?.linkedTo || ""),
        lender: String(l?.lender || ""),
        originalAmount: toNumber(l?.originalAmount ?? l?.principal ?? l?.amount ?? l?.value ?? 0, 0),
        outstandingAmount: toNumber(l?.outstandingAmount ?? l?.amount ?? l?.value ?? 0, 0),
        paidAmount: toNumber(l?.paidAmount ?? 0, 0),
        amount: toNumber(l?.outstandingAmount ?? l?.amount ?? l?.value ?? 0, 0),
        emi: toNumber(l?.emi ?? 0, 0),
        rate: toNumber(l?.rate ?? l?.interest ?? 0, 0)
      }))
    : [];

  const totalAssets = round(assets.reduce((sum, item) => sum + item.value, 0), 2);
  const normalizedLiabilities = liabilities.map((l) => {
    const outstandingAmount = round(Math.max(l.outstandingAmount, 0), 2);
    const originalAmount = round(Math.max(l.originalAmount || outstandingAmount, outstandingAmount), 2);
    const paidAmount = round(Math.max(l.paidAmount || (originalAmount - outstandingAmount), 0), 2);
    return { ...l, originalAmount, outstandingAmount, paidAmount, amount: outstandingAmount };
  });

  const totalLiabilities = round(normalizedLiabilities.reduce((sum, item) => sum + item.outstandingAmount, 0), 2);
  const totalLoanPaid = round(normalizedLiabilities.reduce((sum, item) => sum + item.paidAmount, 0), 2);
  const netWorth = round(totalAssets - totalLiabilities, 2);

  return { assets, liabilities: normalizedLiabilities, totalAssets, totalLiabilities, totalLoanPaid, netWorth };
}

function normalizeQuestionnaire(raw = {}) {
  return {
    segment: String(raw?.segment || "").trim().toLowerCase() || null,
    primaryGoal: String(raw?.primaryGoal ?? raw?.goal ?? "").trim().toLowerCase() || null,
    monthlyIncome: toNumber(raw?.monthlyIncome ?? raw?.income ?? 0, 0),
    fixedExpenses: toNumber(raw?.fixedExpenses ?? raw?.monthly_fixed_expenses ?? 0, 0),
    monthlyDebtPayment: toNumber(raw?.monthlyDebtPayment ?? raw?.debtPayment ?? 0, 0),
    emergencyFundMonths: toNumber(raw?.emergencyFundMonths ?? raw?.emergencyMonths ?? 0, 0),
    riskStyle: String(raw?.riskStyle ?? raw?.risk ?? "").trim().toLowerCase() || null,
    adviceStyle: String(raw?.adviceStyle ?? raw?.style ?? "").trim().toLowerCase() || null,
    monthlyAllowance: toNumber(raw?.monthlyAllowance ?? raw?.allowance ?? 0, 0),
    educationLoanEmi: toNumber(raw?.educationLoanEmi ?? raw?.educationLoan ?? 0, 0),
    graduationYear: toNumber(raw?.graduationYear ?? raw?.gradYear ?? 0, 0),
    currentConcern: String(raw?.currentConcern ?? raw?.concern ?? "").trim().slice(0, 300)
  };
}

function normalizeProfile(raw = {}) {
  const questionnaire = normalizeQuestionnaire(raw?.questionnaire ?? raw?.aiQuestionnaire ?? raw?.ai_questionnaire ?? {});
  const wealth = normalizeWealth(raw?.wealth || {});
  const subscriptions = normalizeSubscriptions(raw?.subscriptions || []);
  const totals = raw?.totals || {};
  const fallbackIncome = questionnaire.monthlyIncome + (questionnaire.segment === "student" ? questionnaire.monthlyAllowance : 0);
  const fallbackSpent = questionnaire.fixedExpenses + questionnaire.monthlyDebtPayment + (questionnaire.segment === "student" ? questionnaire.educationLoanEmi : 0);
  const incomeFromTotals = toNumber(totals.income, 0);
  const spentFromTotals = toNumber(totals.spent, 0);
  const income = incomeFromTotals > 0 ? incomeFromTotals : fallbackIncome;
  const spent = spentFromTotals > 0 ? spentFromTotals : fallbackSpent;
  const saved = totals.saved !== undefined ? toNumber(totals.saved, income - spent) : income - spent;

  return {
    name: String(raw?.name || "User"),
    currency: String(raw?.currency || "INR").split(" ")[0] || "INR",
    incomeTarget: toNumber(raw?.income_target ?? raw?.income ?? 0, 0),
    totals: {
      income,
      spent,
      saved,
      rate: income > 0 ? round((saved / income) * 100, 1) : 0
    },
    txs: normalizeTransactions(raw?.txs),
    budgets: normalizeBudgets(raw?.budgets),
    goals: normalizeGoals(raw?.goals),
    subscriptions,
    wealth,
    questionnaire
  };
}

function computeSnapshot(profile) {
  const income = profile.totals.income;
  const spent = profile.totals.spent;
  const saved = profile.totals.saved;
  const savingsRate = income > 0 ? round((saved / income) * 100, 1) : 0;

  const overBudget = profile.budgets
    .filter((b) => b.lim > 0 && b.spent > b.lim)
    .map((b) => ({
      category: b.cat,
      overBy: round(b.spent - b.lim, 2),
      utilizationPct: round((b.spent / b.lim) * 100, 1)
    }));

  const topCategories = [...profile.budgets]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3)
    .map((b) => ({ category: b.cat, spent: round(b.spent, 2), limit: round(b.lim, 2) }));

  const topAssets = [...profile.wealth.assets]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((a) => ({ name: a.name, type: a.type, value: round(a.value, 2) }));

  const topLiabilities = [...profile.wealth.liabilities]
    .sort((a, b) => b.outstandingAmount - a.outstandingAmount)
    .slice(0, 3)
    .map((l) => ({ name: l.name, type: l.type, amount: round(l.outstandingAmount, 2), paid: round(l.paidAmount, 2), linked_to: l.linkedTo || "" }));

  const activeSubscriptions = profile.subscriptions.filter((s) => String(s.status || "active").toLowerCase() !== "inactive");
  const totalSubscriptionMonthly = round(activeSubscriptions.reduce((sum, s) => sum + toNumber(s.monthlyCost, 0), 0), 2);
  const totalSubscriptionYearly = round(totalSubscriptionMonthly * 12, 2);
  const topSubscriptions = [...activeSubscriptions]
    .sort((a, b) => b.monthlyCost - a.monthlyCost)
    .slice(0, 3)
    .map((s) => ({
      name: s.name,
      category: s.category,
      monthly_cost: round(s.monthlyCost, 2),
      next_billing_date: s.nextBillingDate || ""
    }));
  const nextSubscriptionDue = [...activeSubscriptions]
    .map((s) => ({ ...s, dueTs: s.nextBillingDate ? Date.parse(s.nextBillingDate) : NaN }))
    .filter((s) => Number.isFinite(s.dueTs))
    .sort((a, b) => a.dueTs - b.dueTs)[0];

  return {
    monthly_income: round(income, 2),
    monthly_spent: round(spent, 2),
    monthly_saved: round(saved, 2),
    savings_rate_pct: savingsRate,
    total_assets: profile.wealth.totalAssets,
    total_liabilities: profile.wealth.totalLiabilities,
    total_loan_paid: profile.wealth.totalLoanPaid,
    net_worth: profile.wealth.netWorth,
    active_subscriptions_count: activeSubscriptions.length,
    subscriptions_monthly_total: totalSubscriptionMonthly,
    subscriptions_yearly_total: totalSubscriptionYearly,
    top_subscriptions: topSubscriptions,
    next_subscription_due: nextSubscriptionDue
      ? { name: nextSubscriptionDue.name, next_billing_date: nextSubscriptionDue.nextBillingDate }
      : null,
    top_assets: topAssets,
    top_liabilities: topLiabilities,
    top_categories: topCategories,
    over_budget_categories: overBudget,
    alerts: [
      ...(savingsRate < 20 ? ["Savings rate is below 20%."] : []),
      ...(overBudget.length > 0 ? ["At least one budget category is over limit."] : []),
      ...(saved < 0 ? ["Monthly cashflow is negative."] : [])
    ]
  };
}

function reallocateBudget(profile, targetSavingsRate) {
  const income = profile.totals.income;
  const currentSaved = profile.totals.saved;
  const targetSaved = (income * targetSavingsRate) / 100;
  let gap = round(targetSaved - currentSaved, 2);

  if (income <= 0) {
    return {
      status: "insufficient_income_data",
      message: "Cannot estimate reallocation without monthly income.",
      cuts: []
    };
  }

  if (gap <= 0) {
    return {
      status: "already_on_track",
      message: "Current savings already meets or exceeds requested target savings rate.",
      cuts: []
    };
  }

  const priorityOrder = ["Shopping", "Leisure", "Travel", "Food", "Dining", "Entertainment", "Bills"];
  const categoryRank = new Map(priorityOrder.map((cat, idx) => [cat, idx]));

  const candidates = [...profile.budgets]
    .filter((b) => b.spent > 0)
    .sort((a, b) => {
      const aRank = categoryRank.has(a.cat) ? categoryRank.get(a.cat) : 999;
      const bRank = categoryRank.has(b.cat) ? categoryRank.get(b.cat) : 999;
      if (aRank !== bRank) return aRank - bRank;
      return b.spent - a.spent;
    });

  const cuts = [];
  for (const category of candidates) {
    if (gap <= 0) break;

    const maxCutRate = category.cat === "Bills" ? 0.07 : 0.22;
    const maxCut = round(category.spent * maxCutRate, 2);
    if (maxCut <= 0) continue;

    const cut = round(Math.min(maxCut, gap), 2);
    gap = round(gap - cut, 2);

    cuts.push({
      category: category.cat,
      suggested_cut: cut,
      new_spend_estimate: round(Math.max(category.spent - cut, 0), 2)
    });
  }

  return {
    status: gap > 0 ? "partial_plan" : "complete_plan",
    target_savings_rate_pct: round(targetSavingsRate, 1),
    unresolved_gap: round(Math.max(gap, 0), 2),
    cuts
  };
}

function buildWealthGuidance(profile, snapshot) {
  const tips = [];

  if (snapshot.total_assets <= 0 && snapshot.total_liabilities > 0) {
    tips.push("You have liabilities but no assets logged. Start tracking cash, investments, gold, or property to get a full net-worth view.");
  }

  if (snapshot.total_liabilities > snapshot.total_assets) {
    tips.push("Liabilities are higher than assets. Prioritize faster debt reduction before adding risky investments.");
  }

  const highRateLoan = [...profile.wealth.liabilities]
    .filter((l) => l.rate > 0)
    .sort((a, b) => b.rate - a.rate)[0];
  if (highRateLoan) {
    tips.push(`Consider extra prepayment toward ${highRateLoan.name} (${round(highRateLoan.rate, 2)}% interest) to lower total interest.`);
  }

  const zeroDiversification = profile.wealth.assets.length > 0
    && profile.wealth.assets.every((a) => String(a.type || "").toLowerCase() === String(profile.wealth.assets[0].type || "").toLowerCase());
  if (zeroDiversification) {
    tips.push("Your assets are concentrated in one type. Consider diversifying gradually across multiple asset classes.");
  }

  if (!tips.length && profile.wealth.assets.length > 0) {
    tips.push("Review and update your asset and loan values monthly so FlowAI can give sharper suggestions.");
  }

  return tips.slice(0, 4);
}

function buildSubscriptionGuidance(profile, snapshot) {
  const tips = [];
  const monthlyIncome = toNumber(snapshot.monthly_income, 0);
  const monthlySubs = toNumber(snapshot.subscriptions_monthly_total, 0);
  const activeSubs = profile.subscriptions.filter((s) => String(s.status || "active").toLowerCase() !== "inactive");

  if (!activeSubs.length) {
    return tips;
  }

  const subShare = monthlyIncome > 0 ? (monthlySubs / monthlyIncome) * 100 : 0;
  if (subShare > 12) {
    tips.push(`Subscriptions are ${round(subShare, 1)}% of monthly income, which is high. Consider pausing at least one low-usage plan.`);
  } else if (subShare > 7) {
    tips.push(`Subscriptions are ${round(subShare, 1)}% of monthly income. Keep only plans you use every week.`);
  }

  const duplicateCategories = new Map();
  for (const sub of activeSubs) {
    const key = String(sub.category || "Other").toLowerCase();
    duplicateCategories.set(key, (duplicateCategories.get(key) || 0) + 1);
  }
  const duplicate = [...duplicateCategories.entries()].find((entry) => entry[1] > 1);
  if (duplicate) {
    tips.push(`You have multiple subscriptions in ${duplicate[0]}. Compare usage and keep only the highest-value one.`);
  }

  const topSub = [...activeSubs].sort((a, b) => b.monthlyCost - a.monthlyCost)[0];
  if (topSub && topSub.monthlyCost > 0) {
    tips.push(`Review ${topSub.name} (${profile.currency}${round(topSub.monthlyCost, 2)}/month) first for downgrade or sharing options.`);
  }

  return tips.slice(0, 4);
}

function buildSystemPrompt() {
  return [
    "You are FlowAI, a personal finance assistant inside Finance Flow.",
    "Directly answer the exact user question in the first sentence.",
    "Use provided app data as primary truth; when data is missing, provide practical educational guidance with clear assumptions.",
    "Use only relevant metrics for the question. Do not repeat the same full snapshot in every reply.",
    "If the user asks a conceptual question (for example: what is, define, explain, how does X work), give a clear educational explanation first and do not force account snapshot data.",
    "If asked about name/profile fields, answer from profile data exactly.",
    "If asked for weekly or monthly plans, provide concrete numeric allocations and clear next actions.",
    "If subscription data is present, include recurring-cost analysis, renewal risk, and cancellation or downgrade suggestions.",
    "If asked about loans, include paid amount, remaining amount, and linked asset/lender when available.",
    "If asked where user is overspending, identify categories and exact overage or reduction suggestions.",
    "If profile type is student, prioritize allowance and education-loan cashflow guidance with low-risk habits.",
    "Do not promise returns or guaranteed outcomes.",
    "Keep answers concise and practical, usually 4-8 sentences.",
    "For non-finance questions, give a concise helpful general answer; optionally add one line if there is a useful finance connection."
  ].join(" ");
}

function buildGeneralSystemPrompt() {
  return [
    "You are FlowAI, a helpful general assistant.",
    "Answer the user's question directly, clearly, and concisely.",
    "If the question is factual and you are unsure, state uncertainty briefly.",
    "For live or changing data (news, prices, scores, weather), mention that real-time verification may be needed.",
    "Keep the answer practical and easy to understand."
  ].join(" ");
}

async function callOpenAI(apiKey, message, profile, snapshot, reallocation, wealthGuidance, subscriptionGuidance, history) {
  const financeMode = isLikelyFinanceMessage(message);
  let messages;

  if (financeMode) {
    const context = [
      `Profile JSON: ${JSON.stringify(profile)}`,
      `Snapshot JSON: ${JSON.stringify(snapshot)}`,
      `Reallocation JSON: ${JSON.stringify(reallocation)}`,
      `Wealth Guidance JSON: ${JSON.stringify(wealthGuidance)}`,
      `Subscription Guidance JSON: ${JSON.stringify(subscriptionGuidance)}`
    ].join("\n");

    messages = [
      { role: "system", content: buildSystemPrompt() },
      { role: "system", content: `Live finance context:\n${context}` },
      ...(Array.isArray(history) ? history : []),
      { role: "user", content: message }
    ];
  } else {
    messages = [
      { role: "system", content: buildGeneralSystemPrompt() },
      ...(Array.isArray(history) ? history : []),
      { role: "user", content: message }
    ];
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: financeMode ? 0.3 : 0.4,
      max_tokens: 450
    })
  });

  const raw = await res.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch (_err) {
    throw new Error(`OpenAI returned non-JSON response (status ${res.status}).`);
  }

  if (!res.ok) {
    throw new Error(data?.error?.message || `OpenAI request failed (status ${res.status}).`);
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned empty content.");
  }

  return {
    reply: String(content).trim(),
    model: data?.model || MODEL,
    trace_id: data?.id || null
  };
}

function isLikelyFinanceMessage(message) {
  const m = String(message || "").toLowerCase();
  const terms = [
    "money", "finance", "financial", "budget", "expense", "spend", "saving", "savings", "invest",
    "stock", "mutual", "fund", "sip", "etf", "loan", "debt", "emi", "income",
    "net worth", "asset", "liability", "subscription", "credit", "interest", "tax",
    "portfolio", "insurance", "retirement", "emergency fund"
  ];
  return terms.some((term) => m.includes(term));
}

function extractGeneralTopic(message) {
  const original = String(message || "").trim().replace(/[?]+$/g, "");
  if (!original) return null;

  let topic = original;
  const prefixes = [
    /^what\s+is\s+/i,
    /^what'?s\s+/i,
    /^whats\s+/i,
    /^who\s+is\s+/i,
    /^define\s+/i,
    /^meaning\s+of\s+/i,
    /^explain\s+/i,
    /^tell\s+me\s+about\s+/i,
    /^how\s+does\s+/i,
    /^how\s+do\s+/i
  ];
  for (const p of prefixes) {
    topic = topic.replace(p, "");
  }

  topic = topic
    .replace(/\bfor me\b/ig, "")
    .replace(/[^\w\s\-.'"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!topic || topic.length < 2) return null;
  return topic.slice(0, 80);
}

function shortText(text, maxChars = 420) {
  const t = String(text || "").trim();
  if (!t) return "";
  if (t.length <= maxChars) return t;
  return `${t.slice(0, maxChars).replace(/\s+\S*$/, "")}...`;
}

async function fetchGeneralKnowledgeReply(message) {
  if (isLikelyFinanceMessage(message)) return null;
  const m = String(message || "").trim().toLowerCase();
  if (!m) return null;

  if (/\bjoke\b/.test(m)) {
    return "Here is one: Why did the accountant break up with the calculator? It kept bringing up old figures.";
  }
  if (/\b(motivate|motivation|inspire|encourage)\b/.test(m)) {
    return "Small consistent progress beats perfect plans. Pick one action you can finish today, complete it, then build momentum.";
  }
  if (/\b(weather|temperature|rain|forecast)\b/.test(m)) {
    return "I can help with that, but weather is real-time and location-specific. Share your city and I will give a practical weather check approach.";
  }
  if (/\btime\b/.test(m) && m.length < 40) {
    return `Current local time is ${new Date().toLocaleTimeString()}.`;
  }

  const topic = extractGeneralTopic(message);
  const topicCandidates = [topic, String(message || "").trim()]
    .filter(Boolean)
    .map((x) => shortText(String(x), 90));

  async function fetchSummaryByTitle(title) {
    const encoded = encodeURIComponent(String(title).replace(/\s+/g, "_"));
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data = await res.json();
    const summary = shortText(data?.extract || "", 440);
    return summary || null;
  }

  try {
    for (const q of topicCandidates) {
      const direct = await fetchSummaryByTitle(q);
      if (direct) return `${direct} If you want, I can also connect this topic to your money decisions.`;

      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*`;
      const searchRes = await fetch(searchUrl, { headers: { Accept: "application/json" } });
      if (!searchRes.ok) continue;
      const searchJson = await searchRes.json();
      const firstTitle = searchJson?.query?.search?.[0]?.title;
      if (!firstTitle) continue;
      const summary = await fetchSummaryByTitle(firstTitle);
      if (summary) return `${summary} If you want, I can also connect this topic to your money decisions.`;
    }
    return null;
  } catch (_err) {
    return null;
  }
}

function localGeneralFallback(message) {
  const m = String(message || "").trim().toLowerCase();
  if (!m) return "Please ask your question in one line and I will answer directly.";
  if (/\bjoke\b/.test(m)) return "Here is one: Why did the spreadsheet go to therapy? Too many unresolved issues.";
  if (/\bhello\b|\bhi\b|\bhey\b/.test(m)) return "Hi. Ask me any question, and I will answer directly and clearly.";
  if (/\bweather|temperature|rain|forecast\b/.test(m)) return "For weather, share your city and I can guide you with a practical real-time check.";
  if (/\bwho are you\b|\bwhat can you do\b/.test(m)) return "I am FlowAI. I can answer general questions and personal finance questions, and I can create actionable finance plans from your data.";
  return "I can answer this. Please ask with a bit more detail so I can give a precise response.";
}

function localFallbackReply(message, profile, snapshot, reallocation, wealthGuidance, subscriptionGuidance) {
  const sym = profile.currency || "INR";
  const m = String(message || "").toLowerCase();
  const dense = m.replace(/[^a-z0-9]/g, "");
  const q = profile.questionnaire || {};
  const parts = [];
  const has = (...words) => words.some((w) => {
    const low = String(w || "").toLowerCase();
    const lowDense = low.replace(/[^a-z0-9]/g, "");
    return (low && m.includes(low)) || (lowDense && dense.includes(lowDense));
  });
  const isGreeting = /(^|\s)(hi|hello|hey)\b/.test(m.trim());
  const topCategory = snapshot.top_categories?.[0];
  const topLoan = snapshot.top_liabilities?.[0];
  const topAsset = snapshot.top_assets?.[0];
  const topSub = snapshot.top_subscriptions?.[0];
  const largestLoan = [...profile.wealth.liabilities]
    .sort((a, b) => b.outstandingAmount - a.outstandingAmount)[0];
  const firstGoal = profile.goals?.[0];
  const userName = String(profile.name || "User");
  const monthlyIncome = snapshot.monthly_income > 0
    ? snapshot.monthly_income
    : toNumber(q.segment === "student" ? q.monthlyAllowance : q.monthlyIncome, 0);
  const monthlyDebt = toNumber(q.segment === "student" ? q.educationLoanEmi : q.monthlyDebtPayment, 0);
  const monthlyFixed = toNumber(q.fixedExpenses, 0);
  const monthlyCommitted = round(Math.max(monthlyFixed + monthlyDebt, 0), 2);
  const monthlyFree = round(Math.max(monthlyIncome - monthlyCommitted, 0), 2);
  const conceptIntent = /(^|\s)(what is|what's|whats|define|meaning of|explain|how does|how do)\b/.test(m);
  const marketCompareIntent = (
    has("stock", "stocks", "share market", "equity")
    && has("property", "properties", "real estate", "realestate", "house", "home")
    && has("which", "better", "profitable", "profit", "returns", "vs", "versus", "or")
  );

  const conceptTopic = (() => {
    if (has("stock market", "stockmarket", "share market", "equity market")) return "stock_market";
    if (has("mutual fund", "mutualfund", "mf")) return "mutual_fund";
    if (has("sip", "systematic investment plan")) return "sip";
    if (has("etf")) return "etf";
    if (has("emi")) return "emi";
    if (has("credit score", "cibil")) return "credit_score";
    if (has("inflation")) return "inflation";
    if (has("compound interest", "compounding")) return "compounding";
    if (has("emergency fund")) return "emergency_fund";
    if (has("net worth")) return "net_worth";
    if (has("budgeting", "budget")) return "budgeting";
    return null;
  })();

  if (has("whatismyname", "what'smyname", "whatsmyname", "myname", "mynam", "mynme", "whoami")) {
    parts.push(`Your profile name is ${userName}.`);
    if (q.segment) parts.push(`Profile type: ${q.segment.replace(/_/g, " ")}.`);
    if (q.primaryGoal) parts.push(`Primary goal: ${q.primaryGoal.replace(/_/g, " ")}.`);
    parts.push("Ask for a weekly plan, debt strategy, overspending check, or investment allocation and I will calculate it from your data.");
  } else if (marketCompareIntent) {
    parts.push("Neither is always more profitable globally; it depends on timeline, interest rates, valuations, location, and risk.");
    parts.push("Stocks are usually more liquid and diversified, and historically have stronger long-term growth but higher short-term volatility.");
    parts.push("Property can provide rental income and leverage, but needs high capital, has lower liquidity, and includes maintenance, vacancy, and location risk.");
    parts.push("In uncertain economies, a diversified mix is often safer than going all-in on one asset.");
    if (monthlyFree > 0) parts.push(`Based on current free cash around ${sym}${monthlyFree}/month, start with diversified market exposure first, then add property when down payment and emergency fund are strong.`);
    parts.push("Share your investment horizon and risk comfort, and I will suggest a precise split.");
  } else if (conceptIntent && conceptTopic) {
    const explain = {
      stock_market: "Stock market is a marketplace where investors buy and sell ownership shares of companies. When company value grows, share prices may rise, and some companies also pay dividends.",
      mutual_fund: "A mutual fund pools money from many investors and is managed by professionals who invest in stocks, bonds, or other assets. It gives diversification without buying each asset separately.",
      sip: "SIP means investing a fixed amount regularly, usually monthly, into a mutual fund. It builds discipline and reduces timing risk by spreading purchases over time.",
      etf: "ETF is a basket of securities that trades on an exchange like a stock. It usually tracks an index and offers low-cost diversification.",
      emi: "EMI is the fixed monthly payment for a loan, including principal and interest. Early EMIs typically contain more interest and less principal.",
      credit_score: "Credit score is a number that reflects repayment behavior and credit risk. Higher scores usually improve loan approval chances and interest rates.",
      inflation: "Inflation is the rise in prices over time, which reduces purchasing power of money. Your long-term returns should beat inflation to grow real wealth.",
      compounding: "Compounding means earning returns on both your original money and past returns. Time and consistency are the key drivers.",
      emergency_fund: "Emergency fund is cash kept for unexpected expenses like medical issues or job loss, usually 3 to 6 months of essential costs.",
      net_worth: "Net worth is total assets minus total liabilities. It is a simple measure of financial health over time.",
      budgeting: "Budgeting is planning how much to spend, save, and invest each month so your money follows your priorities."
    };
    parts.push(explain[conceptTopic]);
    if (conceptTopic === "stock_market") {
      parts.push("Simple start: build emergency fund first, then use diversified funds/ETFs and invest gradually.");
    }
    parts.push("If you want, I can now relate this to your profile and give a personalized action plan.");
  } else if (conceptIntent && !conceptTopic) {
    parts.push("I can answer general questions as well. Ask in one line like: what is quantum computing, who is Alan Turing, or explain black holes.");
  } else if (has("weekly", "weekplan", "weeklysaving", "weeklybudget")) {
    const weeklyIncome = round(monthlyIncome / 4.33, 2);
    const weeklyCommitted = round(monthlyCommitted / 4.33, 2);
    if (q.segment === "student") {
      if (weeklyCommitted >= weeklyIncome) {
        const weeklyDeficit = round(weeklyCommitted - weeklyIncome, 2);
        parts.push(`Weekly student plan: income ${sym}${weeklyIncome}, essential needs+EMI ${sym}${weeklyCommitted}, deficit ${sym}${weeklyDeficit}.`);
        parts.push("For this week, pause non-essential spending, trim living costs, and prioritize covering essentials first.");
      } else {
        const remaining = round(weeklyIncome - weeklyCommitted, 2);
        const weeklyStudy = round(remaining * 0.3, 2);
        const weeklyPersonal = round(remaining * 0.3, 2);
        const weeklySavings = round(Math.max(remaining - weeklyStudy - weeklyPersonal, 0), 2);
        parts.push(`Weekly student plan: income ${sym}${weeklyIncome}, needs+EMI ${sym}${weeklyCommitted}, study ${sym}${weeklyStudy}, personal ${sym}${weeklyPersonal}, savings ${sym}${weeklySavings}.`);
        parts.push("Use separate weekly buckets and move unspent personal money to savings at week end.");
      }
    } else {
      if (weeklyCommitted >= weeklyIncome) {
        const weeklyDeficit = round(weeklyCommitted - weeklyIncome, 2);
        parts.push(`Weekly plan: income ${sym}${weeklyIncome}, committed bills/debt ${sym}${weeklyCommitted}, deficit ${sym}${weeklyDeficit}.`);
        parts.push("Reduce optional spend and renegotiate fixed outflows to remove the weekly deficit before setting new savings targets.");
      } else {
        const maxSave = round(weeklyIncome - weeklyCommitted, 2);
        const weeklySavingsTarget = round(Math.min(Math.max((monthlyIncome * 0.2) / 4.33, 0), maxSave), 2);
        const weeklyFlexible = round(Math.max(maxSave - weeklySavingsTarget, 0), 2);
        parts.push(`Weekly plan: income ${sym}${weeklyIncome}, committed bills/debt ${sym}${weeklyCommitted}, savings target ${sym}${weeklySavingsTarget}, flexible spend ${sym}${weeklyFlexible}.`);
        parts.push("Review weekly and auto-transfer leftover flexible money into savings.");
      }
    }
  } else if (has("month", "doing", "summary", "status", "health")) {
    parts.push(`This month: income ${sym}${snapshot.monthly_income}, spend ${sym}${snapshot.monthly_spent}, saved ${sym}${snapshot.monthly_saved}, savings rate ${snapshot.savings_rate_pct}%.`);
    if (snapshot.subscriptions_monthly_total > 0) parts.push(`Subscriptions are ${sym}${snapshot.subscriptions_monthly_total}/month.`);
    if (snapshot.over_budget_categories.length > 0) {
      const first = snapshot.over_budget_categories[0];
      parts.push(`You are over budget in ${first.category} by ${sym}${first.overBy}.`);
    } else {
      parts.push("You are currently within your tracked budget categories.");
    }
    parts.push(`Loans paid ${sym}${snapshot.total_loan_paid} and loans left ${sym}${snapshot.total_liabilities}.`);
  } else if (has("subscription", "subscriptions", "recurring", "renew", "renewal", "cancel", "ott", "netflix", "spotify", "prime")) {
    const subCount = toNumber(snapshot.active_subscriptions_count, 0);
    if (subCount <= 0) {
      parts.push("No active subscriptions are tracked yet. Add subscriptions so I can optimize cancellations and renewals.");
    } else {
      parts.push(`You have ${subCount} active subscriptions costing ${sym}${snapshot.subscriptions_monthly_total}/month (${sym}${snapshot.subscriptions_yearly_total}/year).`);
      if (topSub) parts.push(`Highest-cost subscription is ${topSub.name} at about ${sym}${topSub.monthly_cost}/month.`);
      if (snapshot.next_subscription_due?.name) {
        parts.push(`Next due renewal is ${snapshot.next_subscription_due.name}${snapshot.next_subscription_due.next_billing_date ? ` on ${snapshot.next_subscription_due.next_billing_date}` : ""}.`);
      }
      if (Array.isArray(subscriptionGuidance) && subscriptionGuidance.length > 0) {
        parts.push(`Suggestion: ${subscriptionGuidance.slice(0, 2).join(" ")}`);
      }
    }
  } else if (has("budget", "overspend", "spend", "expense")) {
    if (snapshot.over_budget_categories.length > 0) {
      const topOver = snapshot.over_budget_categories
        .slice(0, 2)
        .map((b) => `${b.category} (+${sym}${b.overBy})`)
        .join(", ");
      parts.push(`Over-budget categories: ${topOver}.`);
    } else if (topCategory) {
      parts.push(`Top spend category is ${topCategory.category} at ${sym}${topCategory.spent}.`);
    }
    if (reallocation.cuts.length > 0) {
      const plan = reallocation.cuts.slice(0, 2).map((c) => `${c.category}: cut ${sym}${c.suggested_cut}`).join(", ");
      parts.push(`Suggested monthly budget move: ${plan}.`);
    } else {
      parts.push("Set category caps and review weekly to catch overspending early.");
    }
  } else if (has("goalcheck", "goal", "target", "ontrack", "milestone")) {
    if (firstGoal && firstGoal.target > 0) {
      const progress = round((firstGoal.saved / firstGoal.target) * 100, 1);
      const left = round(Math.max(firstGoal.target - firstGoal.saved, 0), 2);
      parts.push(`Goal check: ${firstGoal.name} is ${progress}% complete (${sym}${firstGoal.saved} of ${sym}${firstGoal.target}).`);
      parts.push(`Remaining amount is ${sym}${left}.`);
    } else if (q.primaryGoal) {
      parts.push(`Primary goal is ${q.primaryGoal.replace(/_/g, " ")}. Set a numeric target in Goals to track progress precisely.`);
    } else {
      parts.push("No numeric goal is tracked yet. Add a target amount so I can run progress checks.");
    }
    if (monthlyFree > 0) parts.push(`Current free monthly cash estimate is ${sym}${monthlyFree}; allocate part of this to goal progress.`);
  } else if (has("save", "saving", "savings", "save more")) {
    const targetSave = round(Math.max(snapshot.monthly_income * 0.2, 0), 2);
    const gap = round(Math.max(targetSave - Math.max(snapshot.monthly_saved, 0), 0), 2);
    parts.push(`Current monthly savings is ${sym}${Math.max(snapshot.monthly_saved, 0)} with savings rate ${snapshot.savings_rate_pct}%.`);
    parts.push(`A practical target is ${sym}${targetSave} per month (20% of income).`);
    if (gap > 0) {
      if (reallocation.cuts.length > 0) {
        const plan = reallocation.cuts.slice(0, 2).map((c) => `${c.category}: cut ${sym}${c.suggested_cut}`).join(", ");
        parts.push(`To close the ${sym}${gap} gap, start with: ${plan}.`);
      } else {
        parts.push(`You need about ${sym}${gap} more monthly surplus. Reduce optional spends first and automate saving on income day.`);
      }
    } else {
      parts.push("You are already at or above the 20% savings target. Continue with automated savings and periodic review.");
    }
  } else if (has("loan", "debt", "emi", "liability")) {
    parts.push(`Total loan repaid is ${sym}${snapshot.total_loan_paid}; remaining is ${sym}${snapshot.total_liabilities}.`);
    if (largestLoan || topLoan) {
      const ln = largestLoan || {};
      const name = ln.name || topLoan?.name || "your largest loan";
      const left = round(ln.outstandingAmount ?? topLoan?.amount ?? 0, 2);
      const paid = round(ln.paidAmount ?? topLoan?.paid ?? 0, 2);
      const link = String(ln.linkedTo || topLoan?.linked_to || "").trim();
      const lender = String(ln.lender || "").trim();
      parts.push(`Largest loan is ${name} (${sym}${left} left, ${sym}${paid} paid${link ? `, linked to ${link}` : ""}${lender ? `, lender ${lender}` : ""}).`);
    }
    parts.push("Focus extra prepayments on the highest-interest loan first after maintaining emergency cash.");
  } else if (has("asset", "net worth", "stock", "mutual", "gold", "portfolio", "invest")) {
    parts.push(`Assets total ${sym}${snapshot.total_assets}, liabilities ${sym}${snapshot.total_liabilities}, net worth ${sym}${snapshot.net_worth}.`);
    if (topAsset) parts.push(`Largest asset is ${topAsset.name} (${topAsset.type}) at about ${sym}${topAsset.value}.`);
    if (Array.isArray(wealthGuidance) && wealthGuidance.length > 0) {
      const tip = wealthGuidance.slice(0, 2).join(" ");
      parts.push(`Suggestion: ${tip}`);
    }
  } else if (has("emergency", "reserve", "rainy day")) {
    const monthlyNeed = Math.max(toNumber(q.fixedExpenses, 0), snapshot.monthly_spent || 0);
    const target = round(monthlyNeed * 6, 2);
    parts.push(`A 6-month emergency target is about ${sym}${target} based on monthly need ${sym}${monthlyNeed}.`);
    parts.push("Build this in a safe, liquid account before increasing higher-risk investments.");
  } else if (has("afford", "buy", "purchase", "can i")) {
    parts.push(`Current monthly free cash is about ${sym}${monthlyFree}.`);
    parts.push("A safe rule is: keep emergency fund intact and keep new EMIs within a manageable share of monthly income.");
    parts.push("Share the purchase price and timeline, and I can calculate an exact affordability plan.");
  } else if (isGreeting) {
    parts.push(`Hi ${userName}.`);
    parts.push("Ask me about finance or any general topic, and I will answer directly.");
  } else {
    parts.push("I can answer general questions and finance questions.");
    parts.push("Try asking: what is inflation, where am I overspending, which subscriptions should I cancel, or how much loan is left.");
  }

  if (conceptIntent || marketCompareIntent) {
    parts.push("This is educational information.");
    return parts.join(" ");
  }

  if (q.primaryGoal && !has("goal", "target")) parts.push(`Primary goal on record: ${q.primaryGoal.replace(/_/g, " ")}.`);
  if (q.currentConcern && !has("concern", "problem")) parts.push(`Noted concern: ${q.currentConcern}.`);
  parts.push("This is educational guidance, not personalized investment advice.");
  return parts.join(" ");
}

async function runFlowAI(payload) {
  const rawApiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
  const apiKey = String(rawApiKey || "").trim().replace(/^['"]|['"]$/g, "");

  const message = String(payload?.message || "").trim();
  if (!message) {
    throw new Error("Message is required.");
  }

  const profile = normalizeProfile(payload?.profile || {});
  const history = normalizeHistory(payload?.history || payload?.conversation || []);
  const snapshot = computeSnapshot(profile);
  const reallocation = reallocateBudget(profile, 20);
  const wealthGuidance = buildWealthGuidance(profile, snapshot);
  const subscriptionGuidance = buildSubscriptionGuidance(profile, snapshot);
  const financeMessage = isLikelyFinanceMessage(message);

  if (!apiKey) {
    const generalKnowledgeReply = await fetchGeneralKnowledgeReply(message);
    if (generalKnowledgeReply) {
      return {
        reply: generalKnowledgeReply,
        model: "local-knowledge",
        trace_id: null,
        runtime: RUNTIME_VERSION
      };
    }
    if (!financeMessage) {
      return {
        reply: localGeneralFallback(message),
        model: "local-general",
        trace_id: null,
        runtime: RUNTIME_VERSION
      };
    }
    return {
      reply: localFallbackReply(message, profile, snapshot, reallocation, wealthGuidance, subscriptionGuidance),
      model: "local-fallback",
      trace_id: null,
      runtime: RUNTIME_VERSION
    };
  }

  try {
    const result = await callOpenAI(apiKey, message, profile, snapshot, reallocation, wealthGuidance, subscriptionGuidance, history);
    return {
      ...result,
      runtime: RUNTIME_VERSION
    };
  } catch (_err) {
    const generalKnowledgeReply = await fetchGeneralKnowledgeReply(message);
    if (generalKnowledgeReply) {
      return {
        reply: generalKnowledgeReply,
        model: "local-knowledge",
        trace_id: null,
        runtime: RUNTIME_VERSION
      };
    }
    if (!financeMessage) {
      return {
        reply: localGeneralFallback(message),
        model: "local-general",
        trace_id: null,
        runtime: RUNTIME_VERSION
      };
    }
    return {
      reply: localFallbackReply(message, profile, snapshot, reallocation, wealthGuidance, subscriptionGuidance),
      model: "local-fallback",
      trace_id: null,
      runtime: RUNTIME_VERSION
    };
  }
}

module.exports = {
  runFlowAI
};
