# Riscov — Idea Summary

## What it is

Riscov (**Ris**k Dis**cov**ery) is an AI agent that never stops watching. It doesn't run a fixed checklist and compare numbers to cutoffs — it works the way a human risk analyst would: it goes and finds evidence about an asset or market (audit status, liquidity trends, team activity, real-world pricing), decides for itself what else is worth digging into based on what it's already found, and weighs everything together into one judgment: **Green, Yellow, or Red**, with a plain-English explanation of its reasoning.

A threshold can tell you a number crossed a line. Riscov can tell you *why that matters in context* — the same way a person would say "liquidity's thin, but that's normal for a token this new, so it's fine" instead of flagging every thin-liquidity token as equally dangerous. That contextual judgment — not the number itself — is the actual product.

Any app, market, or protocol on X Layer can plug into that judgment instead of hiring a human risk team or hard-coding rules that can't tell context from danger. Riscov doesn't hold anyone's money and doesn't run its own trading product — it sells the answer to one question: **"is this thing still safe, right now, and why?"**

The reason this matters: almost every risk check in crypto today happens *once*, at the start — someone reviews a token before listing it, and then nobody looks again. Riscov's whole pitch is that the reasoning never stops. The judgment updates the moment something changes, not the next time a human remembers to look.

## One concrete example

Say someone launches a new token called **$DEMO** and wants to create a trading market for it on X Layer, using the chain's new permissionless market-building tools. Nobody's told them how risky $DEMO actually is, so they plug in Riscov.

Riscov's agent starts pulling evidence: it checks $DEMO's contract — audited, clean. It checks liquidity — thin, but that's normal for a token three days old. On its own initiative, it goes further and checks the team's public activity, and finds they're posting regularly with no ownership changes on the contract. Weighing all of that together, Riscov judges $DEMO **Yellow** — not because one number crossed a line, but because "thin liquidity + young token + active team + clean audit" reads as normal early-stage risk, not danger. The market opens with moderate limits: 5x leverage, not 20x.

Three weeks later, $DEMO's liquidity provider quietly pulls 80% of the pool. Riscov is still watching — but this time, the same "thin liquidity" signal means something different: the token isn't new anymore, and a sudden large withdrawal right after a token gains traction matches a pattern Riscov has seen precede past rug pulls. It doesn't just re-check a number against a cutoff — it recognizes the shift in context and flips $DEMO to **Red**, writing out exactly why: "80% liquidity withdrawal in under a day, consistent with a coordinated pull rather than normal volatility for this token's age." The market's leverage cap drops automatically, before any trader gets overexposed.

That's the difference AI makes here: not just watching a number, but understanding what the number means given everything else it already knows — and reaching a different, correctly-reasoned conclusion from the same-looking signal depending on context.
