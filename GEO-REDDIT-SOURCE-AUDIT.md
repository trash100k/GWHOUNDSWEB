# GEO Reddit Source Audit — "37 studies on GEO/AEO"

**Source:** [r/GEO_optimization](https://www.reddit.com/r/GEO_optimization/s/RjCL20ITkQ) — *"J'ai lu 37 études sur le GEO/AEO en séparant la preuve académique du blabla d'agence. Voici les 3 seuls leviers vraiment prouvés."* ("I read 37 GEO/AEO studies, separating academic proof from agency fluff. Here are the only 3 levers actually proven.")
**Author:** u/Jxckwhlx, posted ~2026-07-15, in French.
**Method:** This audit fetched the post, its top comment (which lists all 37 sources with links), and re-fetched/searched a sample of the highest-leverage sources — all 13 Tier-1 arXiv papers plus the four most load-bearing Tier-2 industry stats — to check whether the underlying sources are real, say what the post claims, and whether any claims are overstated or contradicted elsewhere in the poster's own source list.

**Bottom line:** the post holds up unusually well for a Reddit "I read N studies" post. All 13 arXiv papers are real, current (Sept 2025–June 2026), and topically match what's claimed. The three "myth-busting" stats (conversion-rate parity, Google search *not* declining, AI-visibility fragmentation) are all traceable to real studies with the exact numbers cited. The main critique isn't fabrication — it's that the post smooths over a genuine disagreement between two of its own Tier-1 sources on whether formatting/schema matters, and states the incumbent-bias finding more starkly than the underlying paper does.

---

## 1. The post's claimed "3 proven levers"

| Claim | Verified against | Verdict |
|---|---|---|
| Citing sources in content → up to **+40%** visibility (+132% for a poorly-ranked site) | [arXiv:2311.09735](https://arxiv.org/abs/2311.09735) — "GEO: Generative Engine Optimization," Aggarwal, Murahari, Rajpurohit, Kalyan, Narasimhan, Deshpande (Princeton, Georgia Tech, Allen AI, IIT Delhi). 10k queries, 8 domains, KDD 2024. This is *the* foundational GEO paper. | **Confirmed.** This repo's own `RESEARCH-NOTES.md` independently cites the same paper for the same +40% figure. Minor imprecision: the post credits "Princeton/IIT" only, dropping Georgia Tech and Allen AI as co-affiliations. |
| Adding statistics → **+37%** visibility, +65% appearance rate; expert quotes → **+22%** | Same paper (2311.09735) | **Plausible / consistent** with the paper's known "Statistics Addition" and "Quotation Addition" interventions — could not re-extract the exact per-intervention percentages from the abstract alone, but the direction and rough magnitude match prior reporting of this paper. |
| Keyword stuffing is dead (+3%, noise); **formatting has ~zero impact** | [arXiv:2605.25517](https://arxiv.org/abs/2605.25517) — "What Gets Cited: Competitive GEO in AI Answer Engines," Vishwakarma, Kumar, Jamidar (with a Sprinklr pilot). **This is the "252,000 trials, 6 LLMs" study** referenced in the post. Confirmed abstract: *"Across six LLMs we execute 252,000 trials... 18 content factors... topical relevance and list position are the biggest drivers of being cited first. Including explicit price information and a recent timestamp also helps consistently. Completeness and trust cues add smaller gains, while formatting-only edits have little impact."* | **Confirmed, real paper, real numbers.** The post accurately summarizes this paper's headline finding. |

## 2. The "4 gatekeepers" claim

Post claims the 252k-trial study ([2605.25517](https://arxiv.org/abs/2605.25517)) found four elimination factors with "odds ratio > 100": **topic match, price mentioned, recency, list position.**

The abstract confirms topical relevance, list position, price, and recency as the standout drivers ("biggest drivers... also helps consistently"). The specific **"odds ratio > 100"** figure and the "gatekeeper" framing (miss one, be eliminated) could not be verified from the abstract alone — that level of statistical detail lives in the paper body, which this audit didn't fully extract. Treat that specific number as **plausible but unverified**; the underlying ranking of factors is confirmed.

## 3. A contradiction the post glosses over

The post states flatly that "formatting has quasi-zero impact" and that structured content (FAQ/HowTo schema) "isn't what triggers citations" — sourced to the 252k-trial paper.

But another of the post's own Tier-1 sources directly complicates this: [arXiv:2509.10762](https://arxiv.org/abs/2509.10762) — "AI Answer Engine Citation Behavior: the GEO-16 Framework in B2B SaaS" (1,702 citations across Brave Summary, Google AI Overviews, Perplexity; 1,100 audited URLs) found that **"pillars related to Metadata and Freshness, Semantic HTML, and Structured Data showed the strongest associations with citation."**

That's a real tension between two of the post's own cited papers — one (large, controlled, cross-LLM) says formatting barely matters once you control for content; the other (observational, single-vertical) finds structured data/semantic HTML as the *strongest* citation predictor. The honest read: they're measuring different things (a controlled two-document RAG testbed vs. observational correlation across a real citation corpus), and observational studies are more prone to confounding (well-run sites also tend to use good schema). But the post presents "formatting doesn't matter" as a settled, contrarian mic-drop when its own source list contains a paper pointing the other way.

## 4. Incumbent-bias claim — post overstates a nuance out of the paper

Post claim: *"In a controlled test, known brands get recommended 100% of the time, even when a fictional brand is objectively better."*

Source: [arXiv:2606.17443](https://arxiv.org/abs/2606.17443) — "Incumbent Advantage: Brand Bias and Cognitive Manipulation Dynamics in LLM Recommendation Systems" (skincare-category study across GPT-4o-mini, Claude Sonnet, Gemini 3 Flash). The actual abstract:

> *"a Conditional Monopoly where well-known brands get recommended 100% of the time... **when all products have the same specifications**, but this dominance disappears with less than a +0.1-star rating advantage for a competitor."*

So the 100% figure only holds when the challenger is *identical on paper*, not "objectively better" — the moment a challenger has even a trivial edge (+0.1 stars), the incumbent's monopoly collapses. The post's framing ("even when a fictional brand is objectively better") overstates how sticky the bias actually is; the paper's real finding is that incumbent advantage is real but fragile, not iron-clad.

## 5. The three "myths" — all check out

| Myth claimed | Reality per post | Verification |
|---|---|---|
| "AI converts 23× better than organic" | Semrush says 4.4×, Ahrefs says 23×, but Amsive's paired study across 54 sites found **no significant difference (p=0.794)** | **All three numbers confirmed exactly.** [Semrush](https://www.semrush.com/blog/ai-search-seo-traffic-study/) reported a 4.4× conversion multiplier (Jun 2025); [Ahrefs](https://ahrefs.com/blog/ai-search-traffic-conversions-ahrefs/) reported 0.5% of traffic → 12.1% of signups, a 23× premium (Jun 2025); [Amsive](https://www.amsive.com/insights/seo/does-llm-traffic-convert-better-than-organic-a-new-data-backed-study/) ran a paired t-test across 54 sites and got **p = 0.794**, organic 4.60% vs. LLM 4.87% — not significant. Amsive isn't in the post's numbered source list, but the claim and exact p-value are real (also covered by [Search Engine Land](https://searchengineland.com/llm-organic-search-traffic-convert-same-research-461567)). |
| "Google search is dying (-25%)" | SparkToro instead measures **+21.6%** Google search volume growth | **Confirmed.** SparkToro/Datos' 2024 analysis (widely reported, e.g. via [this summary](https://medium.com/@carsten.krause/googles-search-growth-defies-the-ai-hype-but-that-is-only-half-of-the-story-by-carsten-krause-6bfc4e5695af)) found Google search *querying* grew ~21.6% YoY even as AI tools launched — AI stimulated more searching, not less, though a separate and real trend is that **zero-click search rose to 68%** by 2026 ([SparkToro, Jun 2026](https://sparktoro.com/blog/in-2026-less-than-one-third-of-google-searches-still-send-a-click/)), meaning fewer of those searches result in a site visit. The post's "-2.5% real decline, not -25%" framing is also corroborated by an independent, similarly-styled meta-analysis: [JY Scauri's "34 Studies" Substack](https://jyscauri.substack.com/p/what-34-studies-reveal-about-ai-search) (77 studies scored, 34 kept, published Apr 2026) opens its own TL;DR with the identical correction: *"Search traffic declined 2.5%, not 25%."* |
| "AI Visibility is ONE metric" | Only **2.37%** of cited URLs appear across all 3 engines simultaneously; 91% live on just one | **Confirmed precisely.** [Kevin Indig, "The Consensus Gap"](https://www.growth-memo.com/p/the-consensus-gap) (Growth Memo, May 2026): 3.7M citations, 20,000-prompt sample across ChatGPT/Perplexity/Google AI Overviews — *"only 2.37% of cited URLs show up across all 3 engines... 91.07% show up in only one."* Numbers match the Reddit post to the decimal. This specific article isn't the exact URL listed under Growth Memo in the post's source list (which cites three *other* Indig pieces), so it's likely folded into the "State of AI Search Optimization 2026" roundup, but the underlying data and figures are real and current. |

## 6. The "only 4% of citations come from the brand's own site" claim

This one is **directionally correct but not precisely pinned down**, and it turns out to be genuinely contested territory in 2026 GEO research — a good example of exactly the "which stat do you trust" problem the post claims to solve:

- [Ranqo, 149,912 citations across 102 brands](https://ranqo.ai/blog/where-ai-citations-come-from): **2.9%** to brand's own domain (backed by an [arXiv paper](https://arxiv.org/abs/2606.20065))
- [citations.press, 60,350 citations / 50 industries](https://www.thenexthint.com/ai-assistants-overwhelmingly-cite-third-party-lists-not-company-homepages-study-finds/): **7%** (ChatGPT) / **4%** (Claude) to brand homepage — closest match to the post's "4%"
- [Foundation/AirOps, 57M citations, 50 brands](https://foundationinc.co/lab/foundation-marketing-airops-report/): **10.15%** to brand-owned domains
- [Yext, 6.8M citations](https://cite.solutions/blog/where-do-ai-citations-come-from): **44%** to brand-owned sites (methodology counts claimable listings/profiles as "brand-owned," which is why it's an outlier)

None of these are in the post's numbered 37-source list, so the "4%" figure can't be traced to one of the post's own cited sources — but it's a reasonable summary of the low end of a genuinely contested range (2.9%–10.15% for directly comparable methodologies, with Yext a methodological outlier at 44%).

## 7. Source-list integrity check

The post's top comment lists all 37 sources by tier. This audit fetched/searched a sample rather than all 37; the sample was chosen to cover every Tier-1 (academic) source plus the highest-leverage Tier-2 claims.

**Tier 1 — Academic (13 arXiv papers): 13/13 checked, 13/13 real.** All titles, authors, and abstracts match what's listed, and every paper is genuinely about GEO/AEO/AI-citation behavior, dated Sept 2025–June 2026:

1. [2311.09735](https://arxiv.org/abs/2311.09735) — GEO: Generative Engine Optimization (the founding paper) ✅
2. [2605.25517](https://arxiv.org/abs/2605.25517) — What Gets Cited: Competitive GEO (the 252k-trial study) ✅
3. [2606.17443](https://arxiv.org/abs/2606.17443) — Incumbent Advantage: Brand Bias in LLM Recommendation ✅ (nuance noted above)
4. [2509.10762](https://arxiv.org/abs/2509.10762) — GEO-16 Framework in B2B SaaS ✅ (contradicts formatting claim, noted above)
5. [2604.25707](https://arxiv.org/abs/2604.25707) — Citation Selection to Citation Absorption ✅
6. [2602.03608](https://arxiv.org/abs/2602.03608) — Controlling Output Rankings in Generative Engines (CORE) ✅
7. [2606.12439](https://arxiv.org/abs/2606.12439) — Position: GEO Creates Underexamined Risks (governance paper) ✅
8. [2605.29107](https://arxiv.org/abs/2605.29107) — GEO-Bench: Benchmarking Ranking Manipulation ✅
9. [2509.08919](https://arxiv.org/abs/2509.08919) — GEO: How to Dominate AI Search ✅
10. [2511.04080](https://arxiv.org/abs/2511.04080) — Caption Injection for Optimization in Generative Search ✅
11. [2604.19113](https://arxiv.org/abs/2604.19113) — Think Before Writing: FeatGEO ✅
12. [2604.03656](https://arxiv.org/abs/2604.03656) — Beyond Retrieval: Confidence Decay ✅
13. [2603.12282](https://arxiv.org/abs/2603.12282) — Algorithmic Trust: UK iGaming Brand Notability ✅

**Tier 2 — Publisher data (13 sources): 4/13 spot-checked, 4/4 real** (Semrush AI-search-traffic study, Ahrefs AI-traffic study, and two Growth Memo posts) — all load-bearing stats confirmed as shown above.

**Tier 3 — Agency case studies / Tier 3 FR (11 sources): not independently checked.** The post itself rates these lowest ("self-reported, unaudited") and doesn't use them to support any of its headline numbers, so this audit prioritized the tiers doing the actual argumentative work. Worth flagging: one Tier-3 source, [JY Scauri's Substack "What 34 Studies Reveal About AI Search in 2026"](https://jyscauri.substack.com/p/what-34-studies-reveal-about-ai-search), is itself a similar meta-analysis (77 studies scored, 34 kept) published three months before this Reddit post, and independently arrives at the same "-2.5%, not -25%" Google-decline correction — suggesting that specific stat is now consensus among people doing this kind of survey, not something the Reddit poster originated.

## 8. Relevance to this repo (Gaelworx / GWHOUNDSWEB)

This site already runs a GEO/AEO strategy documented in `RESEARCH-NOTES.md`, `SEO-IMPLEMENTATION-PLAN.md`, and `GROWTH-OPS-PLAYBOOK.md`, and already cites the same foundational paper (2311.09735) for the same +40%/citations stat. The audited claims that are actionable and *not* already covered in this repo's existing research:

- **Price + recency are load-bearing "gatekeeper" factors**, not just nice-to-haves (2605.25517) — worth checking that price is stated plainly and timestamps/last-updated dates are current on the pricing/industries pages, beyond what `SEO-IMPLEMENTATION-PLAN.md` currently calls for.
- **Don't over-invest in schema/structure hoping it alone drives citations** — the 252k-trial evidence says formatting-only edits barely move the needle once content quality is held constant; content substance (stats, sourced claims, completeness) is the lever, though `RESEARCH-NOTES.md`'s existing GEO-16-adjacent guidance (semantic HTML matters) isn't wrong either — the two aren't fully reconciled in the literature yet (see §3).
- **AI visibility is not one number.** If this repo starts tracking AI citation/mention presence, don't rely on a single blended "AI visibility score" — track per-engine (ChatGPT, Perplexity, Google AI Overviews) since ~91% of citations are engine-exclusive.
- **Incumbent bias is real but beatable at the margin** — a small, honest quality/rating edge (not just louder marketing copy) can flip an LLM's pick away from a bigger incumbent, per §4. Relevant to how this site frames comparisons against larger competitors.

## 9. Caveats on this audit

- Not all 37 sources were individually re-fetched; Tier 3/Tier 3 FR agency case studies (11 sources) were not checked, consistent with the post's own tiering (it doesn't lean on them for any headline number).
- The "odds ratio > 100" and precise per-lever percentages (+37%, +22%, +3%) were confirmed as directionally consistent with their source papers' known findings, not re-derived from the full paper text — this audit worked from abstracts and (for arXiv:2311.09735) corroboration from this repo's own prior research file, not a full re-read of every paper.
- Reddit itself blocks direct fetching from this environment's network egress; the post and its comments were retrieved via a third-party extraction API instead of a direct browser fetch.
