// TitanEdge Academy curriculum. Modules → lessons → content + quizzes.
// Real implementation will move this to Postgres + an admin editor.

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];          // exactly 4
  correctIndex: number;       // 0-3
  explanation: string;
}

export interface LessonQuiz {
  questions: QuizQuestion[];
  passingScore: number;       // percent, default 70
}

export interface Lesson {
  slug: string;
  title: string;
  intro: string;
  keyPoints: string[];
  examples?: string[];
  commonMistakes?: string[];
  takeaway: string;
  durationMin: number;
  askAiPrompts: string[];
  // 6A.8 additions
  videoUrl?: string;          // YouTube/Vimeo embed URL; falls back to placeholder
  deepDive?: string[];        // extra paragraphs of reading material
  quiz?: LessonQuiz;          // 10-question quiz, undefined = "coming soon"
}

export interface Module {
  slug: string;
  title: string;
  description: string;
  icon: "foundations" | "technical" | "setups" | "risk" | "psychology" | "context" | "bot";
  lessons: Lesson[];
}

// Quiz helpers to keep author shorthand short.
const Q = (
  id: string,
  question: string,
  options: string[],
  correctIndex: number,
  explanation: string,
): QuizQuestion => ({ id, question, options, correctIndex, explanation });

const quiz = (questions: QuizQuestion[]): LessonQuiz => ({
  questions,
  passingScore: 70,
});

export const modules: Module[] = [
  // ============ Module 1: Foundations ============
  {
    slug: "foundations",
    title: "Foundations",
    description: "What futures are, how orders work, and what you must know before you place a single trade.",
    icon: "foundations",
    lessons: [
      {
        slug: "futures-basics",
        title: "Futures Contracts — The Basics",
        intro:
          "A futures contract is a standardized agreement to buy or sell an asset at a set price on a set future date. For day traders, you never hold to expiration — you're trading the price movement of the contract itself.",
        keyPoints: [
          "Each contract has a tick size (the smallest price move) and a tick value (the dollar value of that move). Example: MNQ tick size = 0.25 points, tick value = $0.50.",
          "Micros (MNQ, MES, MGC, MCL) are 1/10th the size of their full-sized cousins (NQ, ES, GC, CL). Lower risk per tick, ideal for learning.",
          "Front-month contracts have the most volume. TradingView shows them as `MNQ1!` (continuous) or `MNQM6` (specific contract — Jun 2026).",
          "You're trading on margin — a fraction of the contract value. This amplifies both gains and losses dramatically.",
          "Settlement is daily — your P&L hits your account in real time, not at expiration.",
        ],
        examples: [
          "MNQ at 18,000 → 1 point move = $2. 10 points = $20 per contract. 100 points = $200 per contract. A 1-contract MNQ winner of 20 points = $40.",
          "MGC at 2,350 → 1 dollar move = $10. $5 move on 1 contract = $50.",
        ],
        commonMistakes: [
          "Confusing tick size with tick value. Always know both for any symbol you trade.",
          "Trading full-sized contracts (ES, NQ) too early — one 5-point loss on ES is $250.",
          "Forgetting that overnight margin is much higher than day-trade margin. Holding overnight without checking can trigger a margin call.",
        ],
        takeaway:
          "Master the dollar value of one tick on every symbol you trade before you click buy.",
        durationMin: 8,
        askAiPrompts: [
          "What's the difference between MNQ and NQ?",
          "How much margin does MNQ require per contract?",
          "Why are micros better for beginners?",
        ],
        deepDive: [
          "Standardization is what makes futures liquid. CME defines the tick size, contract size, expiry calendar, last trade date, settlement procedure, and trading hours for every contract. You can swap MNQ for MES without re-learning the order ticket because the structure is the same.",
          "Contract expiry: most index futures (ES, NQ, MES, MNQ) trade quarterly cycles — March, June, September, December. The 'front month' is the contract closest to expiry, which carries 95%+ of the volume. When you see MNQM6 it means MNQ June 2026. About a week before expiry, traders 'roll' to the next contract — volume migrates from MNQM6 to MNQU6 (September). TradingView's `1!` symbol auto-rolls so you don't have to think about it.",
          "Why micros exist: CME launched the Micro E-mini series (MES, MNQ, MYM, M2K) in 2019 to bring algo traders and retail into futures without requiring a $100K+ account. Micros trade with the same tick increments but at 1/10th the notional value — making them ideal for learning, prop-firm evaluations, and small-account scaling.",
        ],
        quiz: quiz([
          Q("f1-1", "What's the tick size for MNQ?", ["0.10 points", "0.25 points", "0.50 points", "1.00 point"], 1,
            "MNQ moves in 0.25-point increments. Each tick = $0.50."),
          Q("f1-2", "If MNQ moves 8 points in your favor on 2 contracts, what's your P&L?", ["$8.00", "$16.00", "$32.00", "$64.00"], 2,
            "8 points × $2/point × 2 contracts = $32."),
          Q("f1-3", "What does the symbol 'MNQM6' represent?", ["MNQ contract for May 2026", "MNQ contract for June 2026", "Multi-month NQ index", "Micro Nasdaq Mini contract #6"], 1,
            "Month code M = June; the digit is the year. MNQM6 is the June 2026 MNQ contract."),
          Q("f1-4", "How is daily P&L settled in futures?", ["At contract expiration", "Weekly on Fridays", "In real time, mark-to-market each session", "Only when you close the position"], 2,
            "Futures settle daily — gains/losses hit your account at session close."),
          Q("f1-5", "Why is overnight margin higher than day-trade margin?", ["The exchange charges interest overnight", "Brokers want to charge more fees", "Risk is higher when markets are closed and you can't react", "It's a regulatory requirement only"], 2,
            "Day-trade margin is reduced because you'll close before the bell. Overnight you can't manage the position if news breaks."),
          Q("f1-6", "What's the tick value of MGC?", ["$0.50", "$1.00", "$5.00", "$10.00"], 1,
            "MGC tick size is 0.10 with a $10/oz multiplier, making 1 tick = $1.00."),
        ]),
      },
      {
        slug: "order-types",
        title: "Order Types & Execution",
        intro:
          "Knowing which order type to use is the difference between getting filled correctly and giving away edge to slippage.",
        keyPoints: [
          "Market: fills immediately at the current best price. Fastest, but in fast markets you can slip several ticks.",
          "Limit: only fills at your price or better. No slippage, but no guarantee you fill at all.",
          "Stop: becomes a market order once the trigger is hit. Used for stop-losses and breakout entries.",
          "Stop-Limit: triggers a limit order once the stop is hit. Safer than stop, but you might not fill in a fast move.",
          "OCO (one-cancels-the-other): two linked orders. Used for bracket orders — when one fills (stop or target), the other cancels.",
          "Trailing stop: moves with price in your favor, locking in unrealized gain.",
        ],
        commonMistakes: [
          "Using market orders for entries in thin markets — you get filled at terrible prices.",
          "Setting a stop-limit so tight that the limit never fills and your stop becomes useless.",
          "Forgetting to attach stops before celebrating an entry.",
        ],
        takeaway:
          "Default to limit for entries, stop-market for stops, OCO bracket for managed trades.",
        durationMin: 6,
        askAiPrompts: [
          "When should I use a stop-limit vs a stop-market?",
          "How do bracket orders work in TradingView Paper Trading?",
          "What's slippage and how do I minimize it?",
        ],
        deepDive: [
          "Slippage is the difference between the expected price and the actual fill. On thin instruments or fast moves it can be brutal — a market buy on MGC during a news spike can fill 3-5 ticks above what you saw on the chart. The rule of thumb: market orders for exits when you NEED out, limit orders everywhere else.",
          "Brackets (OCO) are the safest way to enter a trade. The moment your entry fills, your stop AND target are submitted as a linked pair. If price hits the stop, the target cancels automatically. If price hits the target, the stop cancels. You can't be 'stuck' in a trade without protection — and you don't have to babysit the screen.",
        ],
        quiz: quiz([
          Q("f2-1", "Which order type guarantees a fill but not a price?", ["Limit", "Stop-limit", "Market", "OCO"], 2,
            "Market orders fill immediately at whatever the next available price is."),
          Q("f2-2", "What does OCO stand for?", ["Open-Close-Open", "One-Cancels-the-Other", "Order-Confirm-Override", "Out-Cancel-Out"], 1,
            "OCO links a stop and a target so when one fills, the other cancels."),
          Q("f2-3", "When is a stop-limit risky?", ["In calm markets", "In fast-moving markets where price gaps past your limit", "When the spread is tight", "At market open"], 1,
            "If price gaps below your limit, the limit order sits unfilled while you bleed."),
          Q("f2-4", "What's the right default for an entry order in normal market conditions?", ["Market", "Limit", "Stop", "Stop-limit"], 1,
            "Limit gives you a known fill price and removes slippage from the entry."),
          Q("f2-5", "A trailing stop is BEST used to:", ["Enter on a breakout", "Lock in profit as price moves in your favor", "Replace a target", "Catch a falling knife"], 1,
            "Trailing stops follow price up (long) or down (short) and lock in gains."),
        ]),
      },
      {
        slug: "margin-sizing",
        title: "Margin & Position Sizing",
        intro:
          "Position sizing is the most important skill in trading. It's what keeps you alive long enough to be profitable.",
        keyPoints: [
          "Day-trade margin is typically 25-50% of overnight margin. For MNQ that's around $50-100 per contract intraday.",
          "Never risk more than 1% of your account on a single trade. Period.",
          "Position size = (1% of account ÷ dollar risk per contract). If you have $50K and your stop is 40 ticks on MNQ (40 × $0.50 = $20), you'd buy 25 contracts. (That's a LOT — start with 1-2 to learn.)",
          "Risk per contract = (stop distance in ticks) × (tick value).",
          "Scale UP only after consistent profitability — never to recover a loss.",
        ],
        examples: [
          "$50K account, 1% = $500 max risk. MNQ stop at 40 ticks = $20/contract risk → max 25 contracts. Start with 1.",
          "$10K account, 1% = $100. MNQ at 40 ticks = $20/contract → max 5 contracts. Start with 1.",
        ],
        commonMistakes: [
          "Sizing by 'how many can I afford' instead of 'how many fit my 1% risk limit'.",
          "Pyramiding losses — adding to losers to lower average price. Almost always a disaster in futures.",
          "Ignoring overnight margin and being forced out at the close.",
        ],
        takeaway:
          "Calculate position size from your STOP, not from how much capital you have.",
        durationMin: 10,
        askAiPrompts: [
          "Can you walk me through sizing a trade with my account size?",
          "What's the difference between day-trade and overnight margin?",
          "How do prop firms enforce position sizing?",
        ],
        deepDive: [
          "The math behind 1% risk: with 1% risk per trade, even a 10-trade losing streak only draws your account down ~10%. With 5% risk per trade, the same streak draws you down 40%+ (because losses compound on a smaller base). Position sizing is the highest-leverage decision you make all day.",
          "Pyramiding losers (adding to a losing position) feels rational — you 'average down' to a better entry. In stocks it can work because you have time. In futures, where you're using leverage and your stop is structurally placed, pyramiding losers usually just means you're 2x your size when the stop hits, doubling the loss. Add to WINNERS, not losers.",
        ],
        quiz: quiz([
          Q("f3-1", "What's the max recommended risk per trade as a percent of account?", ["0.5%", "1%", "5%", "10%"], 1,
            "1% is the standard cap. Anything above 2% starts compounding drawdown risk badly."),
          Q("f3-2", "With a $30K account and a 25-tick MNQ stop, what's the max position size at 1% risk?", ["8 contracts", "12 contracts", "24 contracts", "30 contracts"], 2,
            "$300 risk ÷ (25 × $0.50) = 24 contracts max. Start much smaller in practice."),
          Q("f3-3", "What is pyramiding a loser?", ["Adding to a losing trade to lower avg entry", "Compounding gains across multiple winners", "Scaling out of partial profits", "Stacking multiple symbols"], 0,
            "Pyramiding a loser = adding contracts as price moves against you. Usually disastrous in leveraged futures."),
          Q("f3-4", "Which formula correctly sizes a position?", ["Account × 1%", "(Account × 1%) ÷ (stop_ticks × tick_value)", "Stop ticks × contract count", "Margin ÷ contract price"], 1,
            "Position size is calculated from your dollar risk divided by per-contract dollar risk."),
          Q("f3-5", "When should you increase position size?", ["After a big loss to recover", "After consistent profitability over many trades", "When you feel a strong setup coming", "Every Monday"], 1,
            "Scale up gradually based on proven performance — never to recover losses."),
        ]),
      },
      {
        slug: "reading-chart",
        title: "Reading the Chart",
        intro:
          "Before any indicator, you must read raw price. Bars, candles, and structure tell the story.",
        keyPoints: [
          "A candle's body shows open-to-close; the wick shows the range. A big body with small wicks = decisive move. Long wicks = rejection.",
          "Structure: higher highs + higher lows = uptrend. Lower highs + lower lows = downtrend. Equal highs/lows = range.",
          "Volume confirms moves. Breakouts on low volume usually fail.",
          "Always start on the higher timeframe (1H, 4H) and zoom in for entry (5m, 15m).",
        ],
        commonMistakes: [
          "Trading the 1-minute without checking the higher timeframe context.",
          "Mistaking choppy back-and-forth for a trend.",
        ],
        takeaway:
          "Higher timeframe sets the direction; lower timeframe gives the entry. Never reverse this.",
        durationMin: 6,
        askAiPrompts: [
          "How do I tell if the market is trending or ranging?",
          "What's the best timeframe pair for MNQ scalping?",
          "Why do long wicks matter at S/R levels?",
        ],
        deepDive: [
          "Candles tell a story per bar. A green hammer (small body at top, long lower wick) at support says: sellers tried to push lower, got rejected, buyers won. A shooting star (small body at bottom, long upper wick) at resistance says the inverse. The longer the wick, the stronger the rejection.",
          "Trend definition matters: in technical analysis, an uptrend is a sequence of HH/HL — each pullback bottoms higher than the prior one. The moment that breaks (price makes a lower low), the trend's structure is broken even if price hasn't yet reversed. This is what experienced traders mean by 'break of structure'.",
        ],
      },
    ],
  },

  // ============ Module 2: Technical Analysis ============
  {
    slug: "technical-analysis",
    title: "Technical Analysis",
    description: "The pattern-recognition layer: trends, support/resistance, momentum, volume — the language your bot is speaking.",
    icon: "technical",
    lessons: [
      {
        slug: "ema-trend",
        title: "Trend via EMA Structure",
        intro:
          "Your bot uses 21/50/200 EMA alignment to define trend. Here's why.",
        keyPoints: [
          "21 EMA = short-term tide. Price above = current momentum is up.",
          "50 EMA = swing trend. The 50 is what intraday traders most watch.",
          "200 EMA = primary trend. Above = institutional bias is long.",
          "Bullish trend: close > 200 EMA AND 21 EMA > 50 EMA (your bot's exact condition).",
          "EMAs reacting faster than SMAs is what makes them better for short timeframes.",
        ],
        commonMistakes: [
          "Trading against a strong 200 EMA slope — counter-trend trades have much lower win rates.",
          "Treating a single EMA touch as confirmation. Look for the alignment, not one bar.",
        ],
        takeaway:
          "Trade with the 200 EMA's direction, use the 21/50 cross for timing.",
        durationMin: 6,
        askAiPrompts: [
          "Why does my bot specifically use 21/50/200?",
          "What if EMAs are flat and crossing — is that a trade?",
          "How do EMAs perform in chop?",
        ],
        deepDive: [
          "EMA vs SMA: an Exponential MA weights recent prices more heavily, so it 'turns' faster after a real shift. For day trading where you care about what's happening NOW, EMAs are the right tool. The 21/50/200 trio became standard because they roughly map to: this hour, this session, this week.",
          "Slope > level: an EMA that's pointing up is more valuable than just 'price above EMA'. A rising 200 EMA confirms an institutional bias even when price pulls back below it temporarily. A flat or down-sloping 200 EMA means the bias is gone regardless of where price is relative to the line.",
        ],
      },
      {
        slug: "support-resistance-pivots",
        title: "Support, Resistance, and Pivots",
        intro:
          "Levels matter because order flow piles up at them. Your bot's 3-Touch rule is a way of asking: has this level proven itself yet?",
        keyPoints: [
          "Support = a price level where buyers historically stepped in. Resistance = where sellers stepped in.",
          "A level becomes more powerful each time it holds. 3+ touches = institutional respect.",
          "Daily/weekly pivots (R1/R2/S1/S2) are watched by everyone — they self-fulfill.",
          "PDH (prior day high), PDL (prior day low), PDC (prior day close) are magnets.",
          "Round numbers (18,000 on MNQ) attract orders simply because humans like round numbers.",
        ],
        commonMistakes: [
          "Treating a level that touched once as significant. It needs to hold under pressure to count.",
          "Drawing too many lines. If everything is a level, nothing is.",
        ],
        takeaway:
          "Use only the levels with 3+ touches OR confluence (pivot + EMA + round number).",
        durationMin: 8,
        askAiPrompts: [
          "How does my bot count pivot touches?",
          "What's the most reliable level type on MNQ?",
          "When does a level 'break' vs 'fake out'?",
        ],
        deepDive: [
          "Why pivots self-fulfill: every retail platform displays the same R1/R2/S1/S2 levels. Algos watch them. Institutions know retail watches them. The result is that price often hesitates at pivots even when there's no fundamental reason — because everyone agrees to treat them as walls.",
          "Confluence is the multiplier: a level that's a daily pivot AND a 50 EMA touch AND a round number is far more powerful than any of those alone. Your bot's confidence score weights pivot confirmation at 20 points specifically because pivot+touch confluence is one of the highest-edge entry signals.",
        ],
      },
      {
        slug: "rsi-macd",
        title: "Momentum: RSI & MACD",
        intro:
          "Momentum tells you whether the move has gas left in the tank.",
        keyPoints: [
          "RSI > 50 = bullish momentum; RSI < 50 = bearish. Above 70 = overbought (don't chase). Below 30 = oversold.",
          "MACD histogram crossing zero = momentum shift. Above zero = bull side has control.",
          "Divergence: price makes a new high but RSI/MACD makes a lower high → momentum weakening.",
          "Best use is CONFIRMATION, not standalone signal.",
        ],
        commonMistakes: [
          "Shorting just because RSI > 70 in a strong uptrend. Strong markets stay overbought.",
          "Using MACD as a primary trigger instead of a filter.",
        ],
        takeaway:
          "Momentum confirms; it doesn't trigger. Your bot uses RSI ≥ 50 as a filter, not an entry.",
        durationMin: 7,
        askAiPrompts: [
          "What RSI value is optimal for slingshot entries?",
          "How does the MACD histogram differ from the lines?",
          "Why does divergence work?",
        ],
        deepDive: [
          "RSI is a 0-100 oscillator measuring the relative size of recent gains vs losses. The 50 line is the most useful reference — above 50 means more buying pressure than selling over the lookback. Overbought/oversold (70/30) levels are TRENDING-market noise — in a strong rally, RSI can sit at 75-85 for days.",
          "MACD has three components: the MACD line (12 EMA - 26 EMA), the signal line (9 EMA of MACD), and the histogram (MACD - signal). Histogram crossing zero = momentum changing direction. Histogram growing = momentum accelerating. The histogram is more sensitive than line crosses.",
        ],
      },
      {
        slug: "volume-vwap",
        title: "Volume & VWAP",
        intro:
          "Volume = participation. VWAP = the institutional fair-value price for the day.",
        keyPoints: [
          "Volume confirms breakouts. Breakout + volume spike = real. Breakout on flat volume = often a fake.",
          "VWAP (Volume-Weighted Average Price) resets each session. Price above VWAP = bull intraday bias.",
          "Above VWAP + pulling back to VWAP = textbook long re-entry.",
          "Volume profile (POC, VAH, VAL) shows where most trades happened — magnet zones.",
        ],
        commonMistakes: [
          "Ignoring volume on breakouts. The single biggest tell.",
          "Trading VWAP rejections without context — sometimes price slices VWAP and doesn't look back.",
        ],
        takeaway:
          "If price is above VWAP and pulling back, look for longs. Below VWAP and pulling up, look for shorts.",
        durationMin: 7,
        askAiPrompts: [
          "Is VWAP useful pre-market?",
          "How do I read volume profile shapes?",
          "What volume spike threshold confirms a breakout?",
        ],
        deepDive: [
          "Institutions use VWAP as a benchmark — they buy below it, sell above it, to prove their executions weren't worse than average. This is why VWAP acts as a magnet AND a support/resistance level. Retail traders piggyback on this behavior knowingly.",
          "Volume profile shapes tell you market personality: a 'D-shape' (volume centered, balanced) = ranging day. A 'P-shape' (volume bulge near top) = strong uptrend that found acceptance. A 'b-shape' = downtrend. Reading the shape gives you bias before you even draw a line.",
        ],
      },
      {
        slug: "multi-timeframe",
        title: "Multi-Timeframe Analysis",
        intro:
          "The single most valuable habit a new trader can build: always check 2 timeframes.",
        keyPoints: [
          "Rule of thumb: trade on a timeframe, confirm direction on 4× higher. (5m entry → 20m or 1H context; 15m entry → 1H or 4H context.)",
          "If higher timeframe is sideways/choppy, intraday signals are unreliable.",
          "If higher timeframe is trending hard, even mediocre intraday setups in that direction can work.",
          "Your bot's 'Trend Cloud' on 15m+1h aligned = this concept in code.",
        ],
        commonMistakes: [
          "Looking at 1m and never zooming out.",
          "Calling a bigger timeframe bullish when it's just consolidating after a rally.",
        ],
        takeaway:
          "Higher timeframe = the highway you're driving on. Lower timeframe = lane changes.",
        durationMin: 5,
        askAiPrompts: [
          "What timeframe pair is best for MNQ swing-day-trades?",
          "How do I know if the higher timeframe is choppy?",
          "Can I ever trade against the higher timeframe?",
        ],
        deepDive: [
          "The 4x rule is empirical, not magic: it gives you a HTF context that updates roughly once for every 4 bars on your entry TF, which is enough resolution to know the macro tape without distraction. 1m+5m, 5m+20m, 15m+1h all work.",
          "Counter-trend trades CAN work but have to be sized smaller and held shorter. The math: counter-trend trades have ~40% win rate vs 60% for with-trend. To break even at 40% you need a 1.5R reward — meaning you take profit faster.",
        ],
      },
    ],
  },

  // ============ Module 3: Your Setups (all with full quizzes) ============
  {
    slug: "setups",
    title: "Your Setups",
    description: "Deep dives on the specific patterns your TitanEdge bot trades. One lesson per setup.",
    icon: "setups",
    lessons: [
      {
        slug: "slingshot",
        title: "Slingshot Continuation",
        intro:
          "The Slingshot is the bot's highest-expectancy setup. It's a pullback to the 21/50 EMA inside a trending market followed by a rejection candle that 'slings' price back in the trend direction.",
        keyPoints: [
          "Trigger: bullish trend confirmed (close > 200 EMA, 21 > 50 EMA), price pulls back to the 21 EMA (or 50 in stronger pullbacks), rejects with a bullish close in the upper half of the bar's range.",
          "RSI must recover above 50 on the rejection bar.",
          "Confirmed by MACD histogram turning positive (optional but adds confidence).",
          "Best window: NY Open (9:30–11:00 EST) when participation peaks.",
          "Stop: just below the pullback low (or 40 ticks fixed). Target: prior swing high or 2× initial risk.",
          "Avoid when VIX is rising fast — momentum reversals invalidate the trend assumption.",
        ],
        examples: [
          "MNQ 18,100 in uptrend. Pulls back to 21 EMA at 18,072. Bullish rejection bar closes at 18,088. RSI ticks back to 53. Bot fires 'TE_Slingshot' BUY at next bar open ~18,090 with stop at 18,065 (~25 ticks), target 18,140.",
          "MGC 2,355 trending. Pulls back to 21 EMA at 2,348. Hammer reversal candle. Long entry at 2,350, stop 2,344, target 2,365.",
        ],
        commonMistakes: [
          "Taking the slingshot before trend is confirmed — you're catching a knife.",
          "Tight stops below the pullback low get hit by noise. Allow 5-10 ticks of breathing room.",
          "Ignoring VIX direction — Slingshots fail in expanding volatility.",
        ],
        takeaway:
          "Slingshot is a trend-respecting setup. Trade it WITH the trend, never against.",
        durationMin: 12,
        askAiPrompts: [
          "What's the historical win rate of Slingshot on MNQ in my data?",
          "What VIX range is best for Slingshot?",
          "How tight should my stop be on a Slingshot entry?",
        ],
        deepDive: [
          "Why the Slingshot works: in a healthy trend, pullbacks to the 21/50 EMA represent institutional buyers reloading. When price respects the EMA and rejects sharply (long lower wick, close in upper half), it's a footprint of size buyers stepping in. Your job is to ride that wave.",
          "The 'slingshot' name comes from the stretching-and-releasing visual: price stretches DOWN to the EMA (loading the slingshot), then releases UP with momentum. The bigger the stretch (deeper pullback), the bigger the potential release — but also the bigger the failure risk if the EMA breaks.",
          "Pairing with VIX: Slingshots have a 72% historical win rate when VIX is FALLING or flat (declining vol = trend persistence). When VIX is rising, the win rate drops to ~45% — same pattern, different regime. The VIX filter in the bot exists for this exact reason.",
        ],
        quiz: quiz([
          Q("s1-1", "What's the ENTRY trigger for a long Slingshot?",
            ["EMA crosses above 200 SMA", "Pullback to 21 EMA + bullish rejection candle", "RSI crosses 30 from below", "Volume spike above average"], 1,
            "Slingshot = trending market + pullback to 21 EMA + rejection. Other items may filter but the trigger is the EMA touch + rejection."),
          Q("s1-2", "Where does the stop go on a long Slingshot?",
            ["At the 50 EMA", "5-10 ticks below the pullback low", "At round-number support", "At yesterday's close"], 1,
            "Below the pullback low gives the bar's wick room to breathe without invalidating the setup."),
          Q("s1-3", "Slingshot is BEST avoided when:",
            ["VIX is rising fast", "Mag 7 is bullish", "Volume is above average", "Pivot has 4+ touches"], 0,
            "Rising VIX = expanding volatility = trend invalidation risk. The pullback-and-go logic breaks down."),
          Q("s1-4", "What's the highest-win-rate session for Slingshot?",
            ["Asia overnight", "London open", "NY open 9:30-11:00 EST", "Lunch chop 11:30-13:30"], 2,
            "NY Open has the most participation and the cleanest tape for trend continuation setups."),
          Q("s1-5", "What RSI level does the bot want on a Slingshot rejection bar?",
            ["Above 70", "Above 50 (recovery from pullback)", "Below 30", "Doesn't matter"], 1,
            "RSI > 50 confirms bullish momentum has resumed."),
          Q("s1-6", "Which is NOT a valid Slingshot context?",
            ["Bullish trend, pullback to 21 EMA, bullish close", "Bearish trend, push UP to 21 EMA, bearish close", "Sideways chop, multiple EMA crossings", "Trending up, deeper pullback to 50 EMA, bullish reversal"], 2,
            "Slingshot requires a confirmed trend. Sideways chop means no Slingshot setup."),
          Q("s1-7", "Approximate Slingshot win rate when VIX is falling vs rising?",
            ["72% vs 45%", "50% vs 50%", "60% vs 65%", "80% vs 75%"], 0,
            "Per backtest data the win-rate edge is significant — VIX direction is one of the biggest determinants."),
          Q("s1-8", "What's the typical target structure for a Slingshot?",
            ["1× initial risk", "2× initial risk OR prior swing high", "Always 100 ticks", "Closest pivot level"], 1,
            "2R or the prior swing high gives Slingshot enough room to make its expectancy positive given the win rate."),
          Q("s1-9", "Why does a deep pullback to the 50 EMA still count as Slingshot?",
            ["Because the 50 is the strongest support", "Because deeper retracements in trends still respect institutional support, just at a different level", "Because the bot doesn't care which EMA", "It doesn't — only 21 EMA touches count"], 1,
            "21 and 50 are both institutional levels. Deeper pullbacks to 50 are 'stronger Slingshots' but rarer."),
          Q("s1-10", "How tight is too tight for the stop on Slingshot?",
            ["Anything inside the pullback low's wick", "20 ticks below the entry bar's low", "40 fixed ticks", "Wider is always better"], 0,
            "Stops inside the wick of the rejection bar get tagged by noise — leave breathing room beyond the bar's low."),
        ]),
      },
      {
        slug: "pivot-bounce",
        title: "3-Touch Pivot Bounce",
        intro:
          "Price returns to a pivot level that has held at least 3 times. Each touch increases the probability that the level holds again.",
        keyPoints: [
          "Identify a pivot level (R1/R2/S1/S2, PDH/PDL/PDC) that has been touched and held 3+ times within a recent window.",
          "Entry: bullish rejection candle off support (or bearish off resistance).",
          "Stop: 5-15 ticks beyond the level. Target: midpoint of recent range.",
          "Works best when the broader market is sideways/ranging.",
          "Avoid when news event is imminent — pivots get violated through news.",
        ],
        commonMistakes: [
          "Counting touches loosely. Be strict — only count clean reactions, not random visits.",
          "Trading the 4th touch without observing the 1st-3rd. If a level has been tested rapid-fire it may be exhausted.",
        ],
        takeaway:
          "Levels with 3+ clean touches in calm regimes = bread-and-butter trades.",
        durationMin: 10,
        askAiPrompts: [
          "What counts as a 'touch' in my bot's logic?",
          "When is a pivot likely to fail?",
          "What's the average target distance for Pivot Bounce on MGC?",
        ],
        deepDive: [
          "A 'touch' means price came within tolerance of the level AND rejected. If price plowed through and came back later, that's TWO touches, not one. The bot uses 0.10% tolerance for proximity and counts a touch only when price returns to the level after first leaving it.",
          "Level decay: a level loses power as it ages. A 3-touch level from this morning is sharper than a 3-touch level from a week ago. Recency matters because the order flow that defined the level has been absorbed and may not regenerate.",
          "When to skip: any major economic release within 30 minutes — pivots get violated through news, often cleanly. The pivot-bounce edge depends on a stable order book, which news destroys.",
        ],
        quiz: quiz([
          Q("s2-1", "What's the minimum touches before the bot considers a pivot tradeable?",
            ["1", "2", "3", "5"], 2,
            "3+ clean touches signals institutional respect for the level."),
          Q("s2-2", "Pivot Bounce works BEST in what market regime?",
            ["Strong trending market", "Sideways / ranging market", "High-volatility breakout", "Holiday low-liquidity"], 1,
            "Ranges respect pivots. Trends bulldoze them."),
          Q("s2-3", "What counts as a valid 'touch'?",
            ["Any bar that crosses the level", "Bar comes within tolerance AND rejects", "Close within 5 ticks", "Open or close at the level"], 1,
            "Touch = approach + reject. Just crossing through doesn't count."),
          Q("s2-4", "Where does the stop go for a long Pivot Bounce?",
            ["At the level", "5-15 ticks below the level", "5 ticks above the level", "At the next pivot down"], 1,
            "Just beyond the level so noise doesn't take you out but a true break does."),
          Q("s2-5", "Why is the 4th+ touch riskier than the 3rd?",
            ["Bot's confidence score drops", "Each touch absorbs order flow — the level weakens", "Higher touch counts mean more retail watching", "It's not riskier"], 1,
            "Each successful defense consumes the order block that defined the level."),
          Q("s2-6", "What's the typical target for Pivot Bounce?",
            ["Closest opposite pivot or midpoint of recent range", "Always 50 ticks", "1R", "Prior session close"], 0,
            "Range trades target the other side of the range — bounce off support, ride to resistance."),
          Q("s2-7", "Should you trade Pivot Bounce 5 minutes before FOMC?",
            ["Yes, news typically respects pivots", "No, news events violate pivots cleanly", "Yes, but with bigger size", "Only on Mondays"], 1,
            "News events kill the order-book stability that pivot bounces rely on."),
          Q("s2-8", "Daily pivots R1/R2/S1/S2 self-fulfill because:",
            ["The exchange pays attention to them", "Everyone watches them, so everyone trades around them", "They're computed from prior day high/low/close", "They're rare numbers"], 1,
            "Self-fulfilling prophecy: universal awareness → universal behavior → predictable reactions."),
          Q("s2-9", "If a 3-touch pivot has formed in the last 6 hours vs 5 days ago, which is sharper?",
            ["The 5-day-old level", "The 6-hour-old level", "Same edge", "Depends on volume"], 1,
            "Recent levels have fresh order flow defending them. Old levels have been absorbed."),
          Q("s2-10", "Best confluence for Pivot Bounce?",
            ["Pivot + 50 EMA + round number", "Pivot + 200 SMA only", "Pivot + RSI extreme", "Pivot + Friday afternoon"], 0,
            "Multi-factor confluence makes pivot bounces ~15% higher win rate than pivot alone."),
        ]),
      },
      {
        slug: "trend-continuation",
        title: "Trend Continuation",
        intro:
          "Higher-probability than picking tops/bottoms. Wait for a healthy pullback in a clear trend, enter on the resumption.",
        keyPoints: [
          "Requires a CLEAR established trend (5+ higher-highs/lower-lows).",
          "Pullback should be controlled — not a violent reversal. Ideally 38-50% of the prior leg.",
          "Trigger: break of the pullback's micro structure (a higher high on the entry timeframe).",
          "Stop: below the pullback low. Target: 1.5× the prior leg.",
        ],
        commonMistakes: [
          "Calling a sharp counter-move a 'pullback' when it's actually a reversal.",
          "Entering before the resumption is confirmed — wait for the break.",
        ],
        takeaway:
          "Trend continuation works because you're riding the path of least resistance.",
        durationMin: 10,
        askAiPrompts: [
          "How do I distinguish a pullback from a reversal?",
          "What does the bot use to define 'clear trend'?",
          "Why is this setup my second-best by expectancy?",
        ],
        deepDive: [
          "Pullback vs reversal: a healthy pullback retraces 38-50% of the prior leg on lower-than-average volume, then resumes. A reversal retraces 61-100% on equal-or-higher volume — order flow is genuinely flipping. The volume read is the cleanest tell.",
          "Why 5+ HH/HL: a 'clear trend' isn't a single new high. It's a sustained pattern. Five higher highs and higher lows means the structure has held through enough variance to be statistically a trend, not random walk.",
          "Different from Slingshot: Slingshot triggers on the rejection AT the EMA. Trend Continuation triggers on the BREAK of micro structure AFTER the pullback. TC is later but more confirmed. Both have edge.",
        ],
        quiz: quiz([
          Q("s3-1", "What defines a 'clear trend' for the bot?",
            ["1 new high", "5+ HH/HL pattern", "Bullish moving averages only", "Price above 200 SMA"], 1,
            "Sustained HH/HL pattern is what separates trend from random walk."),
          Q("s3-2", "Healthy pullback retraces about what % of the prior leg?",
            ["10-20%", "38-50%", "61-78%", "Always 100%"], 1,
            "Fibonacci 38-50% retracement is the healthy zone; deeper than 61% suggests reversal."),
          Q("s3-3", "Trigger for Trend Continuation entry?",
            ["EMA touch and rejection", "Break of pullback's micro structure (higher high on entry TF)", "RSI crosses 70", "Volume below average"], 1,
            "Wait for the structure break to confirm trend resumption."),
          Q("s3-4", "Trend Continuation differs from Slingshot how?",
            ["Slingshot is for shorts only", "TC waits for structure break after the pullback; Slingshot enters on the rejection", "TC has tighter stops", "They are identical"], 1,
            "Different entry mechanics: TC = later, more confirmed; Slingshot = earlier, more aggressive."),
          Q("s3-5", "Which timeframe is best for confirming the higher-timeframe trend?",
            ["1m", "15m or 1h", "4h", "Daily"], 1,
            "Day-trade with 5m entries → confirm on 15m/1h HTF."),
          Q("s3-6", "Volume on a healthy pullback should be:",
            ["Above average", "Below average (lighter selling than the prior advance)", "Identical to the prior leg", "Volume doesn't matter here"], 1,
            "Lower volume on the pullback says it's profit-taking, not a real reversal."),
          Q("s3-7", "Stop on a long Trend Continuation goes:",
            ["At the entry bar's open", "Below the pullback low", "At the 200 EMA always", "At yesterday's high"], 1,
            "Below the pullback low — if that breaks, the trend is in question."),
          Q("s3-8", "Target for Trend Continuation?",
            ["Always 1R", "1.5× the prior leg's distance", "Closest pivot", "Always 100 ticks"], 1,
            "1.5R based on the prior leg gives the setup positive expectancy at its measured win rate."),
          Q("s3-9", "When is Trend Continuation MOST risky?",
            ["Mid-trend after multiple successful continuations", "First pullback in a brand-new trend", "After a 61%+ retracement", "All of the above"], 2,
            "Deep retracements signal possible reversal — the setup's premise no longer holds."),
          Q("s3-10", "If the higher timeframe is flat/sideways, Trend Continuation should be:",
            ["Taken with normal size", "Skipped — no trend to continue", "Taken with bigger size for the catch-up move", "Reversed (trade against)"], 1,
            "No trend, no continuation. Skip."),
        ]),
      },
      {
        slug: "ema-reclaim",
        title: "EMA Reclaim",
        intro:
          "Price broke a key EMA (often the 21 or 9) and is now reclaiming it from below. Indicates failed breakdown.",
        keyPoints: [
          "Setup: price closes below the EMA, then within 1-3 bars closes back above with conviction.",
          "Confirmation: the reclaim candle's volume is above average.",
          "Entry: at the close of the reclaim bar or next open.",
          "Stop: below the reclaim bar's low. Target: prior swing high.",
          "Works best mid-day when overnight gaps are getting filled.",
        ],
        commonMistakes: [
          "Entering on the FIRST close back above. Usually need 2 closes for conviction.",
          "Using on the 200 EMA — that's a much slower beast and reclaims are less reliable.",
        ],
        takeaway:
          "EMA reclaim signals weak hands were shaken out. Trade with the reclaim direction.",
        durationMin: 8,
        askAiPrompts: [
          "Does the bot prefer 9 EMA or 21 EMA reclaim?",
          "What's the failure rate on EMA reclaim?",
          "Is this setup viable on MGC or only MNQ?",
        ],
        deepDive: [
          "The psychological mechanism: when price breaks an EMA, weak-handed longs get stopped out — they sold at the break. When price reclaims, those sellers are now WRONG and the buyers who held are vindicated. The reclaim bar represents new buyers stepping in AND short-covering AND nothing to sell because weak hands already exited. Triple force.",
          "Why volume matters: a reclaim on flat volume is suspect — it might just be drift. A reclaim on above-average volume = real interest came back. Bot weights volume confirmation at 5-10% of total signal score.",
        ],
        quiz: quiz([
          Q("s4-1", "EMA Reclaim setup begins with:",
            ["Price holding above the EMA", "Price closing BELOW the EMA, then closing back above within 1-3 bars", "EMA crossing another EMA", "Volume spike at the EMA"], 1,
            "Failed breakdown + recovery = reclaim."),
          Q("s4-2", "What confirms the reclaim?",
            ["Above-average volume on the reclaim bar", "RSI > 70", "Pivot proximity", "Mag 7 bullish"], 0,
            "Volume confirms participation in the recovery move."),
          Q("s4-3", "Stop on a long EMA Reclaim?",
            ["Below the EMA", "Below the reclaim bar's low", "At the breakdown low", "At the prior pivot"], 1,
            "If the reclaim bar's low breaks, the reclaim is failing."),
          Q("s4-4", "Why is the 200 EMA NOT the best reclaim target?",
            ["It's too slow — reclaims are less reliable", "It's too fast", "It only works on weekly charts", "Bot can't see it"], 0,
            "Slow EMAs have higher inertia and unreliable reclaims."),
          Q("s4-5", "Best time of day for EMA Reclaim?",
            ["Mid-day when overnight gaps fill", "Pre-market", "Last hour", "Asia session"], 0,
            "Mid-day liquidity + gap-fill dynamics make reclaims more reliable."),
          Q("s4-6", "How many closes back above the EMA before considering entry?",
            ["1 close is enough", "2 closes is the conservative recommendation", "5 closes", "Doesn't matter"], 1,
            "1 close = potentially fake; 2 closes = real buyer interest."),
          Q("s4-7", "EMA Reclaim target?",
            ["Prior swing high", "Always 100 ticks", "VWAP only", "Next pivot"], 0,
            "Reclaim moves typically run to the prior swing high before resistance kicks in."),
          Q("s4-8", "Which EMAs are PREFERRED for reclaim setups?",
            ["9 or 21", "50 or 100", "200 or 400", "Whatever VWAP is"], 0,
            "Faster EMAs reclaim more reliably and on tighter timeframes."),
        ]),
      },
      {
        slug: "liquidity-sweep",
        title: "Liquidity Sweep Reversal",
        intro:
          "Smart money pushes price through obvious support/resistance to trigger stops, then immediately reverses. You catch the reversal.",
        keyPoints: [
          "Setup: price pokes BELOW an obvious support (or above resistance) by 5-15 ticks, then closes back inside the range strongly.",
          "Look for a long lower wick (bullish sweep) or upper wick (bearish sweep).",
          "Entry: at the close of the sweep bar or first pullback.",
          "Stop: beyond the sweep wick (where the real S/R is now).",
          "Target: prior swing in the opposite direction — often runs further than expected.",
        ],
        commonMistakes: [
          "Confusing a genuine breakdown with a sweep. Sweep = quick poke + sharp rejection. Breakdown = sustained close beyond.",
          "Late entry after the reversal is obvious — best entries are at the sweep close.",
        ],
        takeaway:
          "Liquidity sweeps have the highest dollar-target potential of any setup. Trade them with size + conviction.",
        durationMin: 10,
        askAiPrompts: [
          "How do I tell a sweep from a real breakdown in real time?",
          "What time of day are sweeps most common?",
          "What stop distance does the bot use for sweep entries?",
        ],
        deepDive: [
          "Liquidity hunt theory: stops cluster predictably below visible support and above visible resistance — every retail trader knows where the obvious level is. Institutions, when they want to fill a large order, push price into the stop cluster to trigger forced selling (or buying), giving them the volume they need to fill at a great average price. Then they reverse with the rest of their order — and you ride the wave.",
          "Visual signature of a sweep: a single bar (or 2 bars) that pokes through the obvious level with a long wick AND a strong close BACK INSIDE the prior range. The bar has high volume relative to recent bars (because all those stops just triggered). The next bar should NOT poke through again — if it does, it's a real breakdown not a sweep.",
          "Highest dollar potential: sweep reversals run far because they reset the directional thesis. Stops were just hunted on one side — now there's empty space in the opposite direction. Targets at 3R+ are realistic; trail aggressively past 1R.",
        ],
        quiz: quiz([
          Q("s5-1", "What's a liquidity sweep?",
            ["Volume spike on the open", "Price pokes through obvious S/R to trigger stops, then reverses", "Slow grind through a level", "An end-of-day rebalance"], 1,
            "Sweep = stop hunt + reversal. The 'sweep' is the wick through the level."),
          Q("s5-2", "Visual signature of a bullish sweep?",
            ["Long upper wick + bearish close", "Long lower wick + bullish close back inside range", "Doji at the level", "Three bars in a row through the level"], 1,
            "Bullish sweep = wick down + close back up. Bearish is the mirror image."),
          Q("s5-3", "Where does the stop go on a long sweep entry?",
            ["At the prior support", "Beyond the sweep wick (the new low)", "5 ticks below entry", "At the 21 EMA"], 1,
            "Beyond the wick — if a second sweep prints, the first wasn't a sweep."),
          Q("s5-4", "How do you distinguish a sweep from a real breakdown?",
            ["Sweep = poke + sharp rejection; breakdown = sustained close beyond", "Sweep always has more volume", "Sweep always happens at open", "You can't tell in real time"], 0,
            "The rejection back inside the range is the defining tell."),
          Q("s5-5", "Best entry timing on a sweep?",
            ["After 5 confirming bars", "At the close of the sweep bar or first pullback", "Wait for RSI > 70", "Next morning"], 1,
            "Later entries miss the best part of the move. Sweep close is the sweet spot."),
          Q("s5-6", "Target on a sweep reversal?",
            ["1R conservative", "Prior swing in opposite direction — often 3R+", "Half the recent range", "Round number"], 1,
            "Sweep reversals tend to run further than expected because the directional thesis has flipped."),
          Q("s5-7", "Why do liquidity sweeps work?",
            ["Random chance", "Institutions use them to fill large orders by triggering retail stops first", "TradingView pushes price intentionally", "EMAs cause them"], 1,
            "Order-flow mechanics: institutions need volume; stops provide it; they take the other side and reverse."),
          Q("s5-8", "When during the session are sweeps most common?",
            ["Asia overnight only", "Around session opens (NY 9:30, London) and at key economic releases", "Lunch hour", "Last 10 minutes"], 1,
            "High-liquidity moments are when institutions are most active — sweeps cluster there."),
          Q("s5-9", "Volume on a sweep bar relative to nearby bars?",
            ["Below average", "Above average — stops cascading triggered the volume", "Identical", "Volume doesn't matter"], 1,
            "Cascading stops create the volume spike that confirms the sweep."),
          Q("s5-10", "If a second bar pokes through the swept level after entry, what does that mean?",
            ["The sweep is working", "It wasn't a sweep — likely a real breakdown. Exit", "Add to the position", "Move stop tighter"], 1,
            "True sweeps don't get retested in the next bar. A retest = the setup is failing."),
        ]),
      },
      {
        slug: "vix-divergence",
        title: "VIX Divergence",
        intro:
          "Equities make new high but VIX doesn't make new low (or vice versa). Indicates the move lacks conviction.",
        keyPoints: [
          "Bearish divergence: ES makes new high, VIX makes new high too (instead of declining as it should).",
          "Bullish divergence: ES makes new low, VIX makes new low (instead of spiking).",
          "Confirms when the next bar closes against the equity trend.",
          "Best used at end of day — divergences in the last hour often resolve violently the next morning.",
        ],
        commonMistakes: [
          "Acting on a single bar of divergence — needs 3+ bars typically.",
          "Forgetting that VIX has its own cycle — small divergences in a low-vol regime are noise.",
        ],
        takeaway:
          "VIX divergence is a CONTEXT signal, not a primary trigger. Combine with structure.",
        durationMin: 8,
        askAiPrompts: [
          "What VIX symbol should I use for divergence analysis?",
          "How often do bullish VIX divergences resolve in the next session?",
          "Can VIX divergence work in pre-market?",
        ],
        deepDive: [
          "The VIX-S&P inverse relationship is one of the most reliable correlations in markets (~-0.85). When that correlation BREAKS DOWN, something's off. ES at new highs SHOULD mean fear is falling (VIX down). When fear refuses to fall, smart money is hedging — buying puts even as the rally continues. That's bearish divergence.",
          "EOD timing: divergences that form in the last hour often resolve overnight. Why? Because the close is when institutional risk managers run their reports — if hedging activity (VIX bid) doesn't match the index print, positions get adjusted before next session open.",
        ],
        quiz: quiz([
          Q("s6-1", "Bearish VIX divergence is when:",
            ["ES new high + VIX new high (instead of falling)", "ES new low + VIX falling", "Both fall together", "Both flat"], 0,
            "VIX should fall when equities rally. When it doesn't, hedging is signaling caution."),
          Q("s6-2", "Bullish VIX divergence is when:",
            ["ES new low + VIX makes new low (no fear spike)", "ES new high + VIX new low", "Both rise together", "VIX makes new high while ES falls"], 0,
            "If ES is dumping but VIX isn't spiking, the panic isn't there — the sell-off lacks conviction."),
          Q("s6-3", "VIX divergence is BEST used as:",
            ["A primary entry trigger by itself", "Context combined with structure", "Always a contrarian short", "An exit signal only"], 1,
            "Standalone divergences are noisy. Combine with S/R + trend structure."),
          Q("s6-4", "Why does the VIX inverse correlation usually hold?",
            ["VIX is computed from S&P options pricing — fear drives both", "Random", "Brokers manipulate both", "It doesn't hold"], 0,
            "VIX measures S&P implied vol — fear in equities IS what moves VIX up."),
          Q("s6-5", "Best time of day for VIX divergence signals?",
            ["Pre-market", "Mid-day", "End of day (last hour)", "Asia session"], 2,
            "EOD divergences often resolve overnight when risk managers rebalance."),
          Q("s6-6", "How many bars of divergence to consider valid?",
            ["1 bar is enough", "3+ bars typically", "10 bars", "Doesn't matter"], 1,
            "Single-bar divergences are noise. Sustained 3+ bar divergences carry signal."),
          Q("s6-7", "VIX divergence in a low-volatility regime (VIX 12) is:",
            ["More reliable than usual", "Less reliable — small VIX moves in low-vol regimes are noise", "Identical", "Always a reversal signal"], 1,
            "Low-vol regimes compress VIX moves — small divergences are noise."),
          Q("s6-8", "Typical hold time for VIX divergence trades?",
            ["Scalp 5-10 minutes", "Hours to overnight (the divergence resolves on a slower timeframe)", "Days to weeks", "1 minute"], 1,
            "Divergences resolve on the timeframe they formed on — typically hours to days."),
        ]),
      },
      {
        slug: "failed-breakout",
        title: "Failed Breakout",
        intro:
          "Price breaks above resistance (or below support), fails to hold, and reverses. Trade the reversal.",
        keyPoints: [
          "Setup: price breaks the level with a bar that initially looks like a breakout (close above resistance).",
          "Within 1-3 bars, price closes back BELOW the broken level.",
          "Entry: at the close of the failure bar.",
          "Stop: above the new high (or below the new low for a failed breakdown).",
          "Target: opposite side of the prior range.",
        ],
        commonMistakes: [
          "Entering too early — wait for the close back below.",
          "Trading failed breakouts in strong trends — they often resume after a brief failure.",
        ],
        takeaway:
          "Failed breakouts work best in ranges or at the end of an extended trend.",
        durationMin: 8,
        askAiPrompts: [
          "What's the failure rate of failed-breakout setups in trending vs ranging markets?",
          "How many bars should I wait for the close back inside?",
          "Why is this my lowest-expectancy setup?",
        ],
        deepDive: [
          "Why failed breakouts often outperform real ones: a real breakout requires sustained demand. A failed one means demand evaporated, and the wrong-footed traders who chased the break are now trapped. Their forced exit fuels the reversal.",
          "Context matters: in a CHOPPING range, failed breakouts are bread-and-butter — every breakout fails. In a STRONG TREND, failed breakouts are rare and often immediately re-attempted; trading them counter-trend loses money. Bot's setup-filter weights this — failed breakout signal score is reduced when trend cloud is aligned.",
        ],
        quiz: quiz([
          Q("s7-1", "What defines a failed breakout?",
            ["Price hits the level and stops", "Price closes above resistance, then closes back BELOW within 1-3 bars", "Volume spike on the breakout", "EMA crosses"], 1,
            "The 'failure' = closing back inside the range after appearing to break."),
          Q("s7-2", "Entry on a failed breakout?",
            ["The breakout bar's close (chase the breakout)", "Close of the failure bar (back inside range)", "Always at open of next day", "When RSI reverses"], 1,
            "Wait for the failure to confirm. Earlier entry = chasing breakouts that may be real."),
          Q("s7-3", "Failed Breakout works BEST in:",
            ["Strong trending markets", "Ranging / chopping markets", "Low-volume Asian session", "After NFP only"], 1,
            "Ranges generate failed breakouts constantly. Trends don't."),
          Q("s7-4", "Stop on a failed-breakout short (after price failed an upside break)?",
            ["Above the failed-breakout high", "At the broken resistance", "Below the entry", "Above prior swing high"], 0,
            "If price comes back and prints above the failed-breakout high, the failure failed."),
          Q("s7-5", "Target?",
            ["1 tick", "Opposite side of the prior range", "Closest pivot", "Doesn't matter"], 1,
            "Failed breakouts give back the entire range — target the opposite extreme."),
          Q("s7-6", "Why does the bot weight Failed Breakout LESS than Slingshot?",
            ["More setup invalidation in trending markets", "Higher win rate", "Lower data quality", "All of the above"], 0,
            "Failed breakouts have a regime dependency that drops win rate when trend is strong."),
          Q("s7-7", "How many bars to wait for the failure confirmation?",
            ["1 bar", "1-3 bars", "10 bars", "Until end of day"], 1,
            "1-3 bar window — beyond that the breakout is more likely real."),
          Q("s7-8", "Where do trapped traders' stops cluster after a failed breakout?",
            ["Above the failure (if shorting it)", "Below the failure", "At the EMA", "There are no stops"], 0,
            "Buyers who chased the break put stops just below their entry — they cluster above the breakdown level. As price reverses you'll often see a cascade."),
        ]),
      },
    ],
  },

  // ============ Module 4: Risk Management (full quizzes) ============
  {
    slug: "risk-management",
    title: "Risk Management",
    description: "The skill that keeps you alive long enough to be profitable. Stops, sizing, drawdown, and prop-firm rules.",
    icon: "risk",
    lessons: [
      {
        slug: "one-percent-rule",
        title: "The 1% Rule",
        intro:
          "Risk no more than 1% of your account on any single trade. This isn't a suggestion. It's the difference between blowing up and compounding.",
        keyPoints: [
          "1% of $50K = $500 max risk per trade.",
          "Math: with 1% risk, you'd need 100 consecutive losers to lose your entire account. Statistically nearly impossible.",
          "At 5% risk per trade, just 20 losers wipes you out. A losing streak of 8 isn't rare — 8 losses at 5% = 33% drawdown.",
          "Pro traders typically risk 0.5%–1.5%. Even Soros risked 2% max during his prime years.",
        ],
        takeaway:
          "1% is the line between trader and gambler. Cross it and the math is against you.",
        durationMin: 7,
        askAiPrompts: [
          "How does my position size change if my account drops 20%?",
          "Can I scale to 2% after I'm consistent?",
          "What's the math behind drawdown recovery?",
        ],
        deepDive: [
          "Drawdown recovery is asymmetric: a 20% drawdown requires a 25% gain to break even. A 50% drawdown requires 100% gain. A 75% drawdown requires 300%. Big losses compound. This is why 1% per trade matters so much — the worst case stays survivable.",
          "Geometric vs arithmetic returns: if you make 10% then lose 10%, you're at 99% of start (not 100%). Variance is your enemy when you're risking large fractions. Smaller per-trade risk = smoother equity curve = faster real compounding.",
        ],
        quiz: quiz([
          Q("r1-1", "Max risk per trade as a percent of account?",
            ["0.5%", "1%", "5%", "10%"], 1,
            "1% is the standard cap; pros run 0.5-1.5%."),
          Q("r1-2", "With $20K account and 1% rule, max dollar risk per trade?",
            ["$50", "$100", "$200", "$1,000"], 2,
            "1% × $20,000 = $200."),
          Q("r1-3", "Why is 5% risk per trade dangerous?",
            ["Compounding gains slower", "An 8-trade losing streak = 33% drawdown", "More taxes", "Brokers charge extra"], 1,
            "At 5% per trade, even modest losing streaks cause severe drawdown."),
          Q("r1-4", "After a 50% drawdown, what % gain is needed to break even?",
            ["50%", "75%", "100%", "200%"], 2,
            "Asymmetry: halved account needs 2x return to recover."),
          Q("r1-5", "Pro traders typically risk what % per trade?",
            ["0.5-1.5%", "5-10%", "0.05%", "25%"], 0,
            "Even legendary traders cap at 1-2%; consistency at small risk beats brilliance at big risk."),
          Q("r1-6", "If your account drops 20%, position size should:",
            ["Stay the same", "Go up to recover", "Go down — 1% of a smaller account is smaller", "Double"], 2,
            "Always size to current account, not starting account."),
          Q("r1-7", "How many consecutive losers does it take to lose 100% at 1% risk?",
            ["10", "20", "100", "It's mathematically impossible to lose 100% at 1% per trade"], 3,
            "Strictly, asymptotic — you'd halve the remainder each ~70 trades. Effectively impossible."),
          Q("r1-8", "Why don't institutional traders increase position size after losses?",
            ["They sometimes do (Martingale)", "Larger size on weakened mental state + smaller account = high blowup risk", "They never lose", "Regulations prohibit it"], 1,
            "Revenge sizing destroys accounts — bigger size when you're at your worst is the worst combination."),
          Q("r1-9", "What's the right reason to increase position size?",
            ["Recovery from a loss", "Demonstrated consistency over many trades", "Feeling confident", "Account size grew"], 1,
            "Performance-based scaling only. Never recovery, never emotion."),
          Q("r1-10", "If you find yourself wanting to risk 5% on 'a sure thing':",
            ["Take it — high-conviction trades deserve size", "Stop. Convictions feel certain; outcomes are random. Stick to 1%", "Risk 3% as a compromise", "Take it but with a tight stop"], 1,
            "Every blown account in history was 'a sure thing' to someone."),
        ]),
      },
      {
        slug: "stop-placement",
        title: "Stop Loss Placement",
        intro:
          "Where you put your stop determines two things: your risk per trade AND your win rate. Get it wrong and you'll be stopped on every trade.",
        keyPoints: [
          "Place stops BEYOND structure, not on it. Below the swing low + 5-10 ticks of breathing room.",
          "ATR-based stops adapt to volatility. Use 1.5× ATR(14) as a default.",
          "Mental stops fail. Always use a hard stop in the broker.",
          "Don't move stops further away from entry once placed. Ever.",
          "Trailing stops should activate only AFTER price moves favorably by 1× initial risk.",
        ],
        commonMistakes: [
          "Tight stops on volatile symbols — you'll be wicked out constantly.",
          "Stops on round numbers (everyone else's stop is there too).",
          "Moving stop closer 'to lock in profit' before price has moved enough.",
        ],
        takeaway:
          "Stop placement is structural, not emotional. Where would the setup be invalidated?",
        durationMin: 9,
        askAiPrompts: [
          "How does my bot's tick-based stop compare to ATR-based?",
          "Should I use mental stops on Paper Trading?",
          "What's the right stop for MNQ vs MGC?",
        ],
        deepDive: [
          "Stop placement = win rate floor: if you place a stop 5 ticks below entry on MNQ in a volatile session, you'll be stopped 70%+ of the time on noise alone. That's not a strategy problem, that's a stop-placement problem. Stops have to give the setup room to BE the setup.",
          "Why mental stops fail: when price approaches your mental stop level, you start negotiating — 'just one more bar', 'maybe it'll bounce'. By the time you act, the loss is 2-3x what you'd planned. Hard stops execute regardless of your emotional state. Always use them.",
        ],
        quiz: quiz([
          Q("r2-1", "Where should a stop be placed?",
            ["At the entry price", "Beyond structure (e.g. below swing low) with 5-10 ticks breathing room", "Tight on the entry bar", "At a round number"], 1,
            "Beyond structure + breathing room = robust stops."),
          Q("r2-2", "What's the issue with mental stops?",
            ["They don't exist", "When price approaches, you negotiate and the loss grows", "Brokers charge fees on them", "They only work overnight"], 1,
            "Mental stops fail because humans hesitate. Use hard stops in the broker."),
          Q("r2-3", "ATR-based stop default?",
            ["0.5× ATR(14)", "1.5× ATR(14)", "5× ATR(14)", "10× ATR(14)"], 1,
            "1.5× ATR(14) is a balanced default that adapts to current volatility."),
          Q("r2-4", "Once a stop is placed, you can:",
            ["Move it further away to give the trade room", "Move it closer to lock in profit (after sufficient favorable move)", "Both A and B", "Neither — never adjust stops"], 1,
            "NEVER move a stop further away. Move closer (trail) only after 1× initial risk in your favor."),
          Q("r2-5", "Why are stops on round numbers risky?",
            ["Brokers ignore them", "Everyone's stop is there — easy hunt target", "They're slower to execute", "They cost more"], 1,
            "Liquidity hunts target round numbers because stops cluster there."),
          Q("r2-6", "When should trailing stops activate?",
            ["Immediately on entry", "After price moves favorably by 1× initial risk", "Only at end of day", "Never use trailing stops"], 1,
            "Activate trailing after 1R favorable move so noise doesn't kick you out early."),
          Q("r2-7", "Tight stops on volatile symbols?",
            ["Good — limits loss", "Bad — you'll be wicked out by noise constantly", "Doesn't matter", "Only valid for shorts"], 1,
            "Volatile symbols need wider stops; tight stops produce death-by-noise."),
          Q("r2-8", "If your setup's invalidation level is 18 ticks away and your max risk is 25 ticks, you should:",
            ["Use 25 ticks for safety margin", "Place the stop at the 18-tick invalidation, reduce position size if needed", "Skip the trade", "Trade without a stop"], 1,
            "Stops are STRUCTURAL — placed where the setup is invalidated. Adjust size to fit risk."),
          Q("r2-9", "How does the bot's per-symbol tick stop compare to ATR-based?",
            ["Tick-based is faster but doesn't adapt to volatility regimes", "ATR is slower and worse", "They produce identical stops", "Tick-based is illegal"], 0,
            "Tick stops are simple but require manual adjustment in volatility regime changes. ATR adapts automatically."),
          Q("r2-10", "Best practice when in doubt about stop placement?",
            ["Skip the trade", "Use 1.5× ATR(14)", "Use the EMA distance", "Ask another trader"], 0,
            "If you can't define the invalidation level confidently, the setup isn't clear enough to take."),
        ]),
      },
      {
        slug: "position-sizing-futures",
        title: "Position Sizing for Futures",
        intro:
          "Futures position sizing is mechanical. Skip the math and you're guessing.",
        keyPoints: [
          "Formula: Contracts = floor(MaxRisk$ ÷ (StopTicks × TickValue))",
          "MNQ example: $500 risk ÷ (40 ticks × $0.50) = 25 contracts max. You almost never want max — use 1-3 contracts while learning.",
          "MGC example: $500 risk ÷ (40 ticks × $1.00) = 12 contracts max. Same logic.",
          "When stop is wider, contracts go down. When stop is tighter, contracts go up. ALWAYS maintain constant dollar risk.",
        ],
        takeaway:
          "Constant dollar risk means equity grows linearly while your contract count varies. That's the right shape.",
        durationMin: 10,
        askAiPrompts: [
          "Calculate position size for my account with a 30-tick stop on MNQ.",
          "Why isn't my contract count constant across trades?",
          "How does this differ for prop-firm accounts?",
        ],
        deepDive: [
          "Constant DOLLAR risk is the goal — not constant contract count. A trader who always trades 3 contracts is taking variable risk: a 20-tick MNQ stop is $30 risk, a 50-tick stop is $75 — the dollar exposure swings 2.5x. Equity curve is bumpy. With constant dollar risk, contract count varies but the equity curve smooths out.",
          "Math worked: $25K account, 1% = $250. Tomorrow's trade: MNQ 30-tick stop = $15 risk/contract → 16 contracts max. Day after: MNQ 60-tick stop = $30 risk/contract → 8 contracts. You're risking $240-$250 either way. The size adapts so the equity-impact doesn't.",
        ],
        quiz: quiz([
          Q("r3-1", "Position sizing formula?",
            ["Contracts = Account × 0.01", "Contracts = floor(MaxRisk$ ÷ (StopTicks × TickValue))", "Contracts = Account / Margin", "Contracts = StopTicks × 10"], 1,
            "The formula derives contract count from dollar risk and per-contract risk."),
          Q("r3-2", "$30K account, 30-tick MNQ stop, 1% risk. Max contracts?",
            ["10", "20", "40", "60"], 1,
            "$300 risk ÷ (30 × $0.50) = 20 contracts max."),
          Q("r3-3", "$30K account, 60-tick MGC stop, 1% risk. Max contracts?",
            ["3", "5", "10", "15"], 1,
            "$300 ÷ (60 × $1.00) = 5 contracts."),
          Q("r3-4", "When stop is WIDER, contract count should:",
            ["Go up", "Go down", "Stay same", "Doesn't matter"], 1,
            "Wider stop = more risk per contract = fewer contracts to maintain constant dollar risk."),
          Q("r3-5", "Constant DOLLAR risk means contract count is:",
            ["Always the same", "Variable based on stop distance", "Always 1", "Set by broker"], 1,
            "Contracts vary so risk stays constant."),
          Q("r3-6", "If MES tick value is $1.25 and stop is 40 ticks, dollar risk per contract is:",
            ["$25", "$50", "$100", "$200"], 1,
            "40 × $1.25 = $50."),
          Q("r3-7", "Why is constant contract count BAD?",
            ["Dollar risk swings with stop distance", "Brokers charge more", "It's not bad", "Slower execution"], 0,
            "Variable dollar risk = bumpy equity curve, harder to predict drawdowns."),
          Q("r3-8", "If you can only afford 1 contract worth of margin but the formula says 5:",
            ["Trade 5 anyway", "Trade 1 contract with the planned stop — your position size is capped by capital, not risk math", "Skip the trade", "Borrow margin"], 1,
            "Margin caps your max contracts. Use whichever is smaller: risk-math allowance OR margin allowance."),
          Q("r3-9", "Why are micros better for small accounts?",
            ["Lower tick value = finer position-size resolution", "Higher margins required", "More volatility", "Bigger profit potential"], 0,
            "On a small account, 1 contract of full-sized NQ is too much. MNQ's $0.50 tick lets you size precisely."),
          Q("r3-10", "Prop-firm accounts often have position-size LIMITS in addition to risk math. You should:",
            ["Ignore them — risk math is enough", "Use the smaller of (risk-math contracts, prop-firm cap)", "Always max out the prop-firm cap", "Trade twice as many"], 1,
            "Whichever constraint is tighter wins. Violating prop-firm caps kills the account."),
        ]),
      },
      {
        slug: "prop-firm-rules",
        title: "Prop Firm Rules & Drawdown",
        intro:
          "Prop firms (Apex, TopstepX) give you capital in exchange for following strict rules. Break them and you're done.",
        keyPoints: [
          "Trailing drawdown: your account is killed if drawdown exceeds (typically) $2.5K-$5K from peak balance.",
          "Daily loss limit: lose more than $1K (varies) in a day and your account is gone for the day OR forever depending on firm.",
          "Minimum trading days: usually 5-15 before payout eligible.",
          "Position size limits: enforced. Going over = automatic violation.",
          "No news trading windows: many firms ban trades within 2 minutes of major releases.",
        ],
        takeaway:
          "Prop accounts are easier to blow than personal accounts because of arbitrary rules. Read every rule before you take a trade.",
        durationMin: 10,
        askAiPrompts: [
          "What's the difference between Apex and TopstepX trailing drawdown?",
          "Can my bot violate prop-firm position limits?",
          "How do I read my trailing drawdown in real time?",
        ],
        deepDive: [
          "Trailing drawdown explained: imagine you start with $50K. As your account grows to $55K, the firm raises your floor to $52.5K (trailing $2.5K below peak). If your account drops back to $52.4K, you're out — even though you're still up $2.4K from start. Awareness of where your floor IS matters as much as P&L.",
          "Daily loss limit psychology: hitting your daily limit usually compounds — losing the day AND knowing you're locked out makes the next session tense. Set your PERSONAL daily limit at 70-80% of the firm's hard limit so you have margin and never test the actual cutoff.",
        ],
        quiz: quiz([
          Q("r4-1", "Trailing drawdown means:",
            ["Account closes if drawdown exceeds a fixed dollar threshold below the all-time-peak balance", "Drawdown is reset weekly", "Drawdown only counts overnight", "Drawdown doesn't exist"], 0,
            "The 'floor' rises as your account grows — you can't drop too far below the new peak."),
          Q("r4-2", "Typical prop-firm trailing drawdown for a $50K account?",
            ["$500", "$2.5K-$5K", "$10K", "$25K"], 1,
            "Most firms use $2.5K-$5K trailing drawdown on $50K accounts."),
          Q("r4-3", "Daily loss limit violation usually means:",
            ["Account paused for the day or revoked", "Just a warning", "Bigger position size next day", "Nothing happens"], 0,
            "Depending on firm, hitting the daily limit ends the day OR kills the account entirely."),
          Q("r4-4", "Best practice for daily loss limit?",
            ["Trade right up to it", "Set personal limit at 70-80% of firm's hard limit", "Ignore it", "Only watch the trailing drawdown"], 1,
            "Personal limit gives margin so you never test the actual cutoff."),
          Q("r4-5", "If your account grows from $50K to $55K with $2.5K trailing drawdown, your floor is:",
            ["$47.5K (original)", "$52.5K ($55K - $2.5K)", "$50K", "$55K"], 1,
            "Floor trails up with peak. New floor = new peak - trailing dollar amount."),
          Q("r4-6", "Minimum trading days requirement is typically:",
            ["1 day", "5-15 days before payout eligible", "30 days", "90 days"], 1,
            "Firms want to see consistency before payout, not a single lucky day."),
          Q("r4-7", "Position size limits in prop accounts are:",
            ["Suggestions", "Strictly enforced — going over = automatic violation", "Only enforced at month end", "Different for paper vs live"], 1,
            "Hard-coded limits. Bot or manual order over the cap = instant violation."),
          Q("r4-8", "Why do many prop firms ban news-trading windows?",
            ["News spikes routinely cause violations via slippage", "They don't like news", "Regulatory requirement", "Random"], 0,
            "News slippage can cause 5-10× normal loss in 30 seconds, blowing limits."),
          Q("r4-9", "Apex and TopstepX have:",
            ["Identical rules", "Similar but distinct trailing drawdown / daily limit / payout rules — read each firm's specific rules", "Apex is much stricter", "TopstepX is much stricter"], 1,
            "Always read the specific rules for the firm you're trading. They vary."),
          Q("r4-10", "Most common reason traders blow prop accounts?",
            ["Bad strategy", "Violating arbitrary firm rules (position size, daily loss, news windows) — not stop-out", "Slippage", "Power outage"], 1,
            "Arbitrary rule violations kill more prop accounts than market losses do."),
        ]),
      },
    ],
  },

  // ============ Module 5: Psychology (no quizzes yet) ============
  {
    slug: "psychology",
    title: "Trading Psychology",
    description: "The part most traders skip. The part that decides whether your edge actually compounds.",
    icon: "psychology",
    lessons: [
      {
        slug: "process-vs-outcome",
        title: "Process vs Outcome Thinking",
        intro:
          "A good trade can lose money. A bad trade can make money. Judge yourself on PROCESS, not outcomes.",
        keyPoints: [
          "Good process + lost trade = good trade. Bad process + winning trade = bad trade.",
          "Over thousands of trades, the trader with the better process wins. Single trades are noise.",
          "Review losers asking 'did I follow my plan?' not 'was I right?'",
          "A streak of losses while following your plan is statistically expected — not a sign to change.",
        ],
        takeaway:
          "Track adherence to your plan as a separate metric from P&L. Optimize the process.",
        durationMin: 6,
        askAiPrompts: [
          "How do I track process adherence?",
          "How do I know when a process IS broken vs just unlucky?",
          "What does Mark Douglas say about this?",
        ],
        deepDive: [
          "The casino mindset: a casino doesn't care if you win on any single hand of blackjack. They care that over a million hands their edge plays out. Same for traders. Your edge plays out over a hundreds-to-thousands-trade sample. Single-trade outcomes are noise around your true skill.",
          "Mark Douglas (Trading in the Zone): 'Anything can happen, you don't need to know what's going to happen next to make money, there is a random distribution of wins and losses for any given set of variables that define an edge.' Memorize this. Internalize it. The discipline comes from accepting variance.",
        ],
      },
      {
        slug: "tilt-management",
        title: "Tilt & Revenge Trading",
        intro:
          "Tilt is the silent killer. After a loss, you're emotionally compromised and likely to make worse decisions. Have a plan.",
        keyPoints: [
          "After 2 consecutive losses → take a 15-minute break.",
          "After 3 consecutive losses OR hitting daily loss limit → done for the day.",
          "After a big winner → also pause. Euphoria leads to over-sized trades.",
          "Revenge trading = trying to make back losses with bigger size. Always destroys the account.",
          "Physiological tells of tilt: tight breathing, leaning into the screen, gripping mouse hard. Notice them.",
        ],
        takeaway:
          "Your worst trades happen 5 minutes after your worst losses. Force a circuit-breaker.",
        durationMin: 6,
        askAiPrompts: [
          "What's a good cooldown protocol?",
          "How do I journal an emotional trade?",
          "What's the difference between tilt and FOMO?",
        ],
        deepDive: [
          "Tilt is biochemical: a loss triggers cortisol and adrenaline. These chemicals narrow your focus and bias you toward action. The same chemicals that helped your ancestors flee predators now make you click 'BUY' to feel productive. Recognize the chemistry, force a break, let it dissipate.",
          "The 5-minute rule: most revenge trades happen within 5 minutes of the loss. If you can force yourself to stand up and walk away for just 5 minutes, the chemical response decays enough to make rational decisions. Plenty of pros tape this rule to their monitor.",
        ],
      },
      {
        slug: "journaling",
        title: "Trade Journaling Discipline",
        intro:
          "Untracked trades teach you nothing. The journal is where your edge crystallizes.",
        keyPoints: [
          "Log every trade: setup, entry reason, exit reason, screenshot, emotional state, plan adherence (1-10).",
          "Review the journal WEEKLY, not daily. Patterns emerge over multiple days.",
          "Tag mistakes (FOMO, ignored plan, no stop, etc.) — count them over time to know your top leak.",
          "Best traders journal more than they trade.",
        ],
        takeaway:
          "Without a journal you'll repeat the same mistake for years. With one, you'll fix it in weeks.",
        durationMin: 7,
        askAiPrompts: [
          "Can you show me a journal entry template?",
          "What should I screenshot — entry, exit, or both?",
          "How long should journal review take per week?",
        ],
        deepDive: [
          "Journal templates work because they're consistent: the same fields every entry let you compare across trades, search by tag, and surface patterns. The Trader Templates section of the Academy has a complete journal template — use it.",
          "Weekly review > daily: a single trade tells you nothing. A week's worth of trades tagged the same way ('chased entry', 'ignored plan') reveals your actual leak. Daily reviews are too noisy to see the signal.",
        ],
      },
    ],
  },

  // ============ Module 6: Market Context (no quizzes yet) ============
  {
    slug: "market-context",
    title: "Market Context",
    description: "The macro layer — sessions, events, breadth, and regimes. Knowing this is what separates pros from gamblers.",
    icon: "context",
    lessons: [
      {
        slug: "sessions",
        title: "Sessions & Session Bias",
        intro:
          "Each session has its own personality. Trading the wrong session for your setup = unnecessary losses.",
        keyPoints: [
          "Asia (6 PM – 3 AM EST): low volume, range-bound, fakeouts common. Generally avoid.",
          "London (3 AM – 9 AM EST): higher volume, often sets the day's direction. Good for trend setups.",
          "NY Open (9:30–11 AM EST): highest volume of the day. Best window for almost every setup.",
          "Midday (11 AM – 1:30 PM EST): lunch chop. Avoid or trade with tighter filters.",
          "NY Close (3–4 PM EST): final push, often reverses overnight bias.",
        ],
        takeaway:
          "Trade the NY Open. Avoid lunch chop. Everything else is bonus.",
        durationMin: 7,
        askAiPrompts: [
          "Why is the NY Open my highest win-rate window?",
          "Should I ever trade Asia session?",
          "What's the personality of the 1:30-3pm window?",
        ],
        deepDive: [
          "Volume defines tradeability: NY Open accounts for ~35% of daily volume in 90 minutes. Asia session accounts for ~10% in 9 hours. Volume IS opportunity — when nobody else is trading, your edge collapses because there's no flow to ride.",
          "Lunch chop physiology: 11:30-1:30 EST is when NY institutional desks take lunch in stages. Order flow becomes erratic, false breakouts spike. Most pros either close down or shift to smaller size + tighter filters during this window.",
        ],
      },
      {
        slug: "economic-calendar",
        title: "Economic Calendar Awareness",
        intro:
          "Major economic events move markets unpredictably. Knowing what's coming is non-negotiable.",
        keyPoints: [
          "Tier 1 events (FOMC, CPI, NFP, GDP): pause trading 15 min before and 30 min after.",
          "Tier 2 (jobless claims, retail sales, ISM): tighten filters but can still trade.",
          "Tier 3 (most other releases): usually noise; can ignore.",
          "Earnings season warps individual stocks but Mag 7 earnings move whole indices.",
          "Check the News & AI Briefing every morning before market open.",
        ],
        takeaway:
          "Two minutes of calendar check per day saves you from being blindsided by news spikes.",
        durationMin: 6,
        askAiPrompts: [
          "What's the deal with FOMC days specifically?",
          "Which CPI reactions are biggest historically?",
          "Should I trade in the 30 minutes before NFP?",
        ],
        deepDive: [
          "Tier-1 events historical move sizes: FOMC ±20-50 NQ points in 30 min, CPI ±25-60 NQ points, NFP ±15-40. These are 3-10x normal volatility. Your stop sizing assumptions break, slippage triples, and the actual direction is random. Don't try to trade them.",
          "The 'reaction to the reaction' trade: experienced traders skip the news bar but trade the bar AFTER the news bar — once the initial spike is in, the market often retraces 30-50% and you can trade the retrace with normal logic. Even this is for advanced traders.",
        ],
      },
      {
        slug: "breadth-vix",
        title: "Breadth, VIX, and Risk-On/Off",
        intro:
          "Index futures don't move in isolation. Track breadth (Mag 7) and VIX to know which regime you're in.",
        keyPoints: [
          "VIX falling + Mag 7 strong = clean risk-on. Favor longs, avoid shorts.",
          "VIX rising + Mag 7 weak = risk-off. Favor shorts, tighten filters on longs.",
          "VIX rising + Mag 7 strong = divergence (chop or upcoming reversal).",
          "Always check VIX direction before taking a trade. It's the single most informative macro variable.",
        ],
        takeaway:
          "VIX direction tells you the regime; Mag 7 breadth tells you participation. Together they're 80% of the macro picture.",
        durationMin: 8,
        askAiPrompts: [
          "How does the bot use VIX direction?",
          "What's the Mag 7 cutoff for 'strong' breadth?",
          "Can VIX and Mag 7 agree and the market still chop?",
        ],
        deepDive: [
          "The Mag 7 (AAPL, MSFT, NVDA, AMZN, META, GOOGL, TSLA) make up ~30% of the S&P 500 market cap. When 6/7 are bullish, indices basically can't sell off — the heaviest weights are pulling up. When only 3-4 are bullish, the index's strength is suspect; one or two giants doing all the work isn't sustainable.",
          "VIX vs realized vol: VIX is a 30-day FORWARD-looking implied vol. It can be 'wrong' for days. When VIX is rising but realized vol is calm, market makers are paying up for puts — institutional hedging. That's a tell, not a price prediction. Use VIX as a regime signal, not a timing trigger.",
        ],
      },
    ],
  },

  // ============ Module 7: Working with the Bot (full quizzes) ============
  {
    slug: "working-with-bot",
    title: "Working with TitanEdge",
    description: "Understanding what your AI sees, when to trust it, and when to override.",
    icon: "bot",
    lessons: [
      {
        slug: "how-bot-thinks",
        title: "How TitanEdge Thinks",
        intro:
          "The bot doesn't have intuition. It executes a deterministic rule set with adaptive thresholds. Knowing the rules is knowing the bot.",
        keyPoints: [
          "Inputs: 21/50/200 EMA, RSI, MACD, pivot zones (3+ touches), VIX direction, Mag 7 breadth.",
          "Each input contributes to a confidence score (0-100). Trigger threshold defaults to 70.",
          "Same inputs → same output. The bot doesn't 'feel' the market.",
          "What the bot CAN'T see: news, breaking events, large hidden orders, your account drawdown.",
          "Your job is to provide context the bot can't see (Briefing page) and override when needed.",
        ],
        takeaway:
          "The bot is a pattern matcher. You are the context layer. Together you're better than either alone.",
        durationMin: 8,
        askAiPrompts: [
          "What input contributes most to my bot's score?",
          "Can the bot adapt to a regime change automatically?",
          "How is the confidence threshold tuned?",
        ],
        deepDive: [
          "Determinism is a feature: a deterministic bot is auditable and improvable. You can replay any past trade and ask: given these exact inputs, would I have changed any rule weights? Probabilistic / ML bots can't be reasoned about this way — they're black boxes.",
          "What 'adaptive thresholds' means: the bot's confidence threshold (default 70) can be tuned based on recent win rate. If last 20 trades had 75% win rate, threshold can drop to 65 to take more trades. If 40% win rate, threshold can rise to 80 to be pickier. This is rules-based adaptation, not ML.",
        ],
        quiz: quiz([
          Q("b1-1", "What does the bot use to decide entries?",
            ["Random chance", "A deterministic confidence score from EMAs/RSI/MACD/pivots/VIX/Mag7", "A trained ML model", "Twitter sentiment"], 1,
            "Rule-based confluence scoring. Same inputs → same output."),
          Q("b1-2", "Default confidence threshold for entry?",
            ["50", "70", "85", "100"], 1,
            "70/100 is the default. Higher = pickier; lower = more trades."),
          Q("b1-3", "What CAN'T the bot see?",
            ["EMA values", "Pivot levels", "News events and breaking headlines", "RSI"], 2,
            "The bot has no news feed — that's why you check the Briefing page."),
          Q("b1-4", "What's the bot's relationship to intuition?",
            ["High — it learns from your style", "None — it's purely rule-based", "Some — uses sentiment analysis", "Only on Mondays"], 1,
            "No ML, no intuition. Pure rule-following."),
          Q("b1-5", "Same inputs to the bot at different times produce:",
            ["Different outputs (adaptive)", "The same output (deterministic)", "Random outputs", "Outputs based on user mood"], 1,
            "Determinism makes the bot auditable and debuggable."),
          Q("b1-6", "If you raise the confidence threshold to 80, you'll:",
            ["See more signals", "See fewer but higher-quality signals", "See no signals", "Change the indicators"], 1,
            "Higher threshold = pickier filter = fewer but stronger signals."),
          Q("b1-7", "What does 'adaptive threshold' mean in this bot?",
            ["The bot learns via ML", "Threshold adjusts based on recent win rate (rules-based)", "Threshold is random", "Threshold is set by Anthropic"], 1,
            "Rules-based adaptation: recent performance shifts the threshold within bounds."),
          Q("b1-8", "When should YOU add value over the bot?",
            ["Always — override every trade", "Never — bot is perfect", "When you have context the bot can't see (news, structural breaks, etc.)", "Only on Fridays"], 2,
            "Bot + human context > bot alone. You're the news and context layer."),
        ]),
      },
      {
        slug: "reading-confidence",
        title: "Reading the Confidence Score",
        intro:
          "Confidence is a quality estimate, not a prediction. Higher score = more inputs aligned, not necessarily a winner.",
        keyPoints: [
          "Score 90+: rare, almost all filters aligned. Take with maximum size you're comfortable with.",
          "Score 70-89: standard entries. Default behavior — trade them.",
          "Score 60-69: marginal. The bot won't fire by default. Manual override only if you have strong context (e.g. macro news supports the trade).",
          "Score < 60: don't trade. Period.",
          "Win rate correlates with confidence but NOT linearly. 90+ ≈ 80% win rate; 70-79 ≈ 60% win rate (your data may vary).",
        ],
        takeaway:
          "Confidence is a quality ranking, not a probability. Use it to size and to filter, not to predict.",
        durationMin: 7,
        askAiPrompts: [
          "What's my actual win rate by confidence bucket?",
          "Should I scale position size with confidence?",
          "Why does confidence 95 sometimes lose?",
        ],
        deepDive: [
          "Confidence ≠ probability: a 90 confidence trade doesn't mean 90% chance of winning. It means 90% of the bot's quality filters aligned. Win rate at 90+ is empirically ~75-80% — high but not guaranteed. Markets are stochastic.",
          "Sizing by confidence: a common pro technique is to scale position size by score bucket: 90+ = 2x normal size, 70-89 = normal size, 60-69 = 0.5x (if you override). This concentrates risk where edge is best.",
        ],
        quiz: quiz([
          Q("b2-1", "Confidence score of 90+ means:",
            ["90% chance of winning", "Almost all bot filters aligned — high-quality setup, but not guaranteed", "Bot will hold for 90 minutes", "Bot is 90% sure of direction"], 1,
            "Confidence measures filter alignment, not win probability."),
          Q("b2-2", "Default threshold for bot to enter automatically?",
            ["50", "60", "70", "90"], 2,
            "70 is the default cutoff."),
          Q("b2-3", "Score of 65 with strong macro context supporting the trade. You should:",
            ["Skip — bot didn't fire", "Possibly override with reduced size and clear context note", "Override with full size", "Add the trade as Manual / Discretion"], 1,
            "Marginal scores with extra context can be valid overrides at reduced size."),
          Q("b2-4", "Score < 60 means:",
            ["Take with extra size to recover", "Don't trade", "Wait 5 minutes and recheck", "Use stop-limit only"], 1,
            "Below 60 the setup quality isn't there. Skip."),
          Q("b2-5", "Approximate win rate at 90+ confidence?",
            ["50%", "60%", "75-80%", "100%"], 2,
            "Empirically 75-80% — high but never guaranteed."),
          Q("b2-6", "Should you scale position size with confidence?",
            ["No — always trade the same size", "Yes — concentrate size where edge is strongest", "Only with FOMC days", "Only on shorts"], 1,
            "Common pro technique: 2x normal at 90+, normal at 70-89."),
          Q("b2-7", "Why does a 95-confidence trade sometimes lose?",
            ["Bot is buggy", "Markets are stochastic — even high-edge setups have variance", "Wrong symbol", "VIX malfunction"], 1,
            "Random variance is inherent. Edge plays out over many trades, not single ones."),
          Q("b2-8", "Confidence is best used to:",
            ["Predict exact direction", "Quality-rank setups for sizing + filtering", "Time the market open", "Replace your stop loss"], 1,
            "Confidence ranks quality, not certainty."),
        ]),
      },
      {
        slug: "when-to-override",
        title: "When to Override (and When Not To)",
        intro:
          "The bot is rule-bound. You can see context the bot can't. Knowing when to override is itself a skill.",
        keyPoints: [
          "Valid override TO PASS on a bot signal: imminent news event, structural break the bot didn't see, you're already at daily loss limit.",
          "Valid override TO TAKE a marginal signal: high-conviction macro context (e.g. Powell speaking dovish + bot scored 67 long).",
          "INVALID overrides: revenge trading, FOMO, 'feeling' the market.",
          "Track overrides separately. If your overrides have worse expectancy than the bot, stop overriding.",
        ],
        takeaway:
          "Override based on information the bot can't see. Never override based on emotion.",
        durationMin: 8,
        askAiPrompts: [
          "How do I track my override stats vs bot-only trades?",
          "When should I never override?",
          "What's the right protocol for sizing an override trade?",
        ],
        deepDive: [
          "The Override Test: before any override, ask 'what information do I have that the bot doesn't?' If you can name a specific data point (news headline, breaking event, structural break visible on chart), it's a valid override. If your answer is 'a feeling' or 'I think it'll work' — DON'T OVERRIDE.",
          "Track override expectancy separately from bot expectancy in your journal. If bot trades have +$80 expectancy and your overrides have -$20 expectancy, you're worse than the bot. Stop overriding. If overrides have +$120 expectancy, you're adding edge — keep doing it.",
        ],
        quiz: quiz([
          Q("b3-1", "Valid reason to override and PASS on a bot signal?",
            ["Bot just had two losers", "FOMC release in 5 minutes", "You don't like the symbol", "It's Friday"], 1,
            "Imminent news = data bot can't see. Valid pass."),
          Q("b3-2", "Valid reason to override and TAKE a marginal (sub-70) signal?",
            ["Gut feeling", "High-conviction macro context (e.g. Powell statement supports the trade)", "Wanting to make back a loss", "Random"], 1,
            "Context bot can't see + clearly aligned setup."),
          Q("b3-3", "INVALID override reason?",
            ["Imminent news event", "FOMO", "Structural break the bot didn't catch", "Daily loss limit reached"], 1,
            "FOMO is emotional. Never a valid override reason."),
          Q("b3-4", "If your override trades have worse expectancy than bot trades:",
            ["Override more often", "Stop overriding", "Increase override size", "Switch to a different bot"], 1,
            "Data says you're worse — defer to bot."),
          Q("b3-5", "How to size an override trade?",
            ["Same as a normal bot trade", "2x normal (high conviction)", "Reduced size (override carries extra uncertainty)", "Match the bot's score"], 2,
            "Overrides should typically be smaller because the bot's filters didn't pass."),
          Q("b3-6", "Override Test before pulling trigger?",
            ["Can I name SPECIFIC info the bot doesn't have?", "Am I feeling lucky?", "Is the chart pretty?", "Did I have coffee?"], 0,
            "Articulable, specific information advantage is the only valid override criterion."),
          Q("b3-7", "Track override stats:",
            ["In your head", "Separately from bot stats in the journal", "Don't track", "Only the wins"], 1,
            "Separate tracking lets you compare expectancy and decide if override skill is real."),
          Q("b3-8", "Most dangerous override scenario?",
            ["High-confidence bot signal you decide to skip for no specific reason", "Strong context override at reduced size", "Skipping during FOMC", "Skipping during lunch chop"], 0,
            "Skipping bot's best signals without articulable reason loses edge AND lowers trade volume."),
        ]),
      },
    ],
  },
];

// ===== Templates =====
export interface Template {
  slug: string;
  title: string;
  description: string;
  body: string;
}

export const templates: Template[] = [
  {
    slug: "pre-market-checklist",
    title: "Daily Pre-Market Checklist",
    description: "5-minute routine before the bell. Skip these and you're flying blind.",
    body: `□ Read TitanEdge Morning Briefing (News tab)
□ Note today's HIGH-impact economic events and times
□ Check overnight ES/NQ levels — any gap to fill?
□ Confirm Mag 7 breadth direction (>5 bullish = trend bias up)
□ Confirm VIX direction (declining = risk-on)
□ Review yesterday's trade journal for repeat mistakes
□ Confirm bot is active and connected to Paper Trading
□ Confirm webhook is firing (check /api/webhook status)
□ Set personal daily loss limit ($____)
□ Set position size for first trade (start small)
□ Define caution windows (lunch + news releases)
□ Take a deep breath. You're prepared.`,
  },
  {
    slug: "trade-plan",
    title: "Trade Plan Template",
    description: "Fill out at the start of each trading day. Anchors you to a plan.",
    body: `TRADE PLAN — [Date]
=====================
Market regime today: [TRENDING UP / TRENDING DOWN / RANGING / CHOP / HIGH VOL / LOW VOL]

Bias: [LONG / SHORT / NEUTRAL]

Key levels to watch:
- MNQ: [support] / [resistance]
- MGC: [support] / [resistance]
- ES:  [support] / [resistance]

Setups I will take today:
[ ] Slingshot
[ ] 3-Touch Pivot Bounce
[ ] Trend Continuation
[ ] EMA Reclaim
[ ] Liquidity Sweep
[ ] VIX Divergence
[ ] Failed Breakout

Setups I will NOT take today (and why):
- ___________________________________

Position size: [____] contracts MNQ, [____] contracts MGC
Max risk per trade: $[____]
Max daily loss: $[____]
Max trades: [____]

Caution windows (no trading):
- [ ] FOMC release: __:__ – __:__
- [ ] CPI/NFP: __:__ – __:__
- [ ] Lunch chop: 11:30 – 13:30 EST

Reminder to self: Trade the plan. The bot is the system. I am the context.`,
  },
  {
    slug: "trade-journal",
    title: "Trade Journal Entry",
    description: "One entry per trade. Wins AND losses.",
    body: `TRADE #[___] — [Date Time]
================================
Symbol: [MNQ / MGC / ES / other]
Side: [LONG / SHORT]
Setup: [Slingshot / Pivot Bounce / Trend Cont / EMA Reclaim / Sweep / VIX Div / Failed BO]
Confidence score at entry: [___]

Entry price: [______]
Stop price: [______]  (risk: [___] ticks, $[___])
Target price: [______]  (reward: [___] ticks, R:R [___])

Exit price: [______]
Exit reason: [stop / target / trail / manual / partial]
P&L: $[+/- ___]

Trade quality (1-10): [___]
Did I follow the plan? [Y / N]
Mistakes (tag): [FOMO / no stop / ignored plan / late entry / early exit / chasing / revenge / over-size / other]
Emotional state: [calm / anxious / excited / frustrated / tilted]

Lesson learned:
________________________________________________________

Screenshot link: [paste]`,
  },
  {
    slug: "end-of-day-review",
    title: "End-of-Day Review",
    description: "15 minutes after the close. Locks in lessons.",
    body: `EOD REVIEW — [Date]
==================
Total P&L: $[___]
Trades taken: [___]
Wins / Losses: [___] / [___]
Win rate: [___]%

Best trade (and why):
________________________________________________________

Worst trade (and why):
________________________________________________________

Mistakes I made today:
1. ___________________________________
2. ___________________________________

Did I follow my Trade Plan? [Y / N — if N, what changed]

What did the bot do well today?
________________________________________________________

What did I see that the bot missed?
________________________________________________________

ONE thing I will do differently tomorrow:
________________________________________________________`,
  },
  {
    slug: "risk-worksheet",
    title: "Risk Management Worksheet",
    description: "Fill in once. Reference daily. Update monthly.",
    body: `RISK WORKSHEET
==============
Current account size: $[______]

Max risk per trade (1%): $[______]
Max daily loss (3%): $[______]
Max weekly drawdown (5%): $[______]

Position sizing by symbol:
- MNQ (tick value $0.50): contracts at 40-tick stop = [___]
- MGC (tick value $1.00): contracts at 40-tick stop = [___]
- MES (tick value $1.25): contracts at 40-tick stop = [___]
- MCL (tick value $1.00): contracts at 40-tick stop = [___]

Hard rules I will NEVER break:
[ ] No trading after hitting daily loss limit
[ ] No re-entering a stopped-out trade in the same hour
[ ] No trading during FOMC/CPI release windows
[ ] No trading without a hard stop in place
[ ] No moving stop further from entry
[ ] No adding to a losing position

If I break one of the above:
- Stop trading for the day immediately
- Journal the violation
- Review on weekend before resuming

Account peak so far: $[______]
Max drawdown experienced: $[______]
Date of largest single loss: __________`,
  },
  {
    slug: "setup-checklist",
    title: "Setup-Specific Checklist (Slingshot example)",
    description: "Quick mental scan before pulling the trigger on a Slingshot entry.",
    body: `SLINGSHOT ENTRY CHECKLIST
==========================
[ ] Trend confirmed: close > 200 EMA, 21 EMA > 50 EMA (long) or inverse (short)
[ ] Pullback to 21 or 50 EMA (within 0.20% touch distance)
[ ] Rejection candle: closed in upper/lower half of range
[ ] RSI: > 50 (long) or < 50 (short)
[ ] MACD histogram: same direction as trade
[ ] Pivot zone confirmation: nearby level with 3+ touches
[ ] VIX direction: falling (long) or rising (short)
[ ] Mag 7 breadth: 5+ bullish (long) or 5+ bearish (short)
[ ] No major news event in next 30 minutes
[ ] Currently in active trading window (not lunch chop)
[ ] Confidence score: 70+
[ ] Position size set per Risk Worksheet
[ ] Hard stop placed before celebrating

If 11+ boxes checked → take the trade.
If 8-10 boxes checked → consider reducing size 50%.
If <8 boxes checked → skip this one.`,
  },
];
