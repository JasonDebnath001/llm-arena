# Scope: LLM Arena

LLM Arena helps developers compare up to three free tier language models on the same prompt, vote on blind responses, and learn which model is genuinely useful from real measurements and votes. The first release is a private alpha for a small invited group.

**Build approach:** Tracer Bullet (each feature becomes a narrow working path through every real layer before the next feature begins).
**Workflow:** Prototype (each feature normally ends after `/develop` and its build time checks). Features that handle identity, private content, or vote integrity use a stricter tier.

_These steps are recommendations for keeping the build orderly. You may skip a step when the decision is already clear. You decide when a feature is done._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| A | Application scaffold | Existing | existing |
| 1 | Application architecture | Foundation | done |
| 2 | Comparison data model | Foundation | planned |
| 3 | Design system and interface foundation | Foundation | planned |
| 4 | Blind comparison and voting loop | Slice 1 | planned |
| 5 | Public leaderboard | Slice 2 | planned |
| 6 | Model catalog and details | Slice 3 | planned |
| 7 | Private comparison history | Slice 4 | planned |
| 8 | Product measurement and reliability | Alpha readiness | planned |
| 9 | Privacy controls and alpha readiness | Alpha readiness | planned |

## Existing

### A. Application scaffold · existing
A runnable App Router starter exists, with strict TypeScript and initial global styling. It does not yet contain LLM Arena product behavior. code in `app/`

## Foundations

### 1. Application architecture · done · Alpha
Decide the boundaries for model execution, parallel streaming, measurement, identity, storage, environment configuration, and safe provider failures. This creates one coherent path for every later slice.
**Done when:** the architecture records how one prompt reaches up to three models concurrently, streams independent results, measures each call, protects secrets, and turns provider failures into safe user states. (basis: the existing scaffold and the project rules in `CLAUDE.md`)
spec in [0001](../specs/0001-application-architecture.md)
- [x] Design it (spec): `/architect application architecture`

### 2. Comparison data model · needs a decision · Beta
Define the durable records for users, comparisons, selected models, responses, measurements, votes, and model metadata without exposing private prompt content.
**Done when:** the model supports anonymous comparisons, authenticated voting, one valid vote per comparison, blind identity reveal, private history, and aggregate rankings without a breaking redesign. (basis: private content and vote integrity are costly to correct after data exists)
- [ ] Design it (spec): `/architect comparison data model`

### 3. Design system and interface foundation · needs a decision · Alpha
Set the visual language and reusable interface patterns for the arena, leaderboard, and model pages before screen work begins.
**Done when:** the visual direction, color, type, spacing, responsive layout, streaming states, errors, focus states, and keyboard behavior are documented and reusable across all planned screens. (basis: `CLAUDE.md` and WCAG 2.2)
- [ ] Design it (spec): `/architect design system and interface foundation`

## Slice 1: Core comparison loop

### 4. Blind comparison and voting loop · needs a decision · Beta
Let anyone submit one prompt to as many as three models and watch their responses arrive independently. Require sign in only when the user votes, then reveal model identities.
**Done when:** a developer can choose models, submit a prompt, see live response and per call latency, token, and `$0.0000` cost measurements, recover from one model failing, sign in to cast one winner vote, and see identities only after that vote. (basis: completed comparison votes are the primary success metric, and identity masking reduces label induced evaluation bias)
- [ ] Design it (spec): `/architect blind comparison and voting loop`

## Slice 2: Rankings

### 5. Public leaderboard · needs a decision · Alpha
Turn authenticated votes and real call measurements into an honest ranking that developers can inspect without signing in.
**Done when:** the leaderboard ranks eligible models from recorded votes, shows vote volume and measured performance context, explains sparse data, and never leaks private prompts or responses. (basis: aggregate rankings are useful only when their sample size and measurement context are visible)
- [ ] Design it (spec): `/architect public leaderboard`

## Slice 3: Model exploration

### 6. Model catalog and details · needs a decision
Help developers understand which free tier models are available and how each performs beyond a single rank.
**Done when:** users can browse supported models and open a model detail view with its capabilities, availability, aggregate win record, latency, token usage, and zero dollar cost measurements. (basis: developers choosing an LLM need both quality and operational context)
- [ ] Design it (spec): `/architect model catalog and details`

## Slice 4: Personal records

### 7. Private comparison history · needs a decision · Beta
Give signed in users access to their own retained prompts, responses, measurements, and votes while keeping every record private by default.
**Done when:** a user can browse and reopen only their comparisons, distinguish voted and unfinished runs, and delete a retained comparison without affecting valid aggregate vote counts incorrectly. (basis: the chosen private by default policy and privacy risk management across the data lifecycle)
- [ ] Design it (spec): `/architect private comparison history`

## Alpha readiness

### 8. Product measurement and reliability · needs a decision · Alpha
Measure the core loop and make failures diagnosable during the private alpha without exposing prompt or response content in telemetry.
**Done when:** completed comparison votes, comparison completion, model failures, and essential performance signals are measurable, operational errors are visible to maintainers, and telemetry excludes private content. (basis: completed comparison votes are the chosen success metric)
- [ ] Design it (spec): `/architect product measurement and reliability`

### 9. Privacy controls and alpha readiness · needs a decision · Beta
Give invited testers clear expectations and control over retained private content before the alpha is treated as ready.
**Done when:** users can understand what is stored and why, request or perform deletion of their retained content and account, use every core screen with keyboard and visible focus, and complete the core loop without a raw provider or application error appearing. (basis: NIST privacy lifecycle guidance, WCAG 2.2, and `CLAUDE.md`)
- [ ] Design it (spec): `/architect privacy controls and alpha readiness`

## Deferred

These capabilities stay outside the private alpha so the first build can validate completed comparison votes.

- **Public launch and search discovery:** marketing pages, search metadata, social cards, sitemap, public terms, and consent needs
- **Payments and plans:** subscriptions, billing, and paid usage
- **Public comparison sharing:** an explicit way to publish a redacted comparison
- **Team evaluation:** shared workspaces, evaluation sets, and team reports
- **Advanced discovery:** search, filters, tags, and saved model shortlists
- **Administration:** an interface for model availability, moderation, and operational controls
- **Internationalization:** locales beyond the initial English interface

## Legend

**Next step:** the first unticked box in a feature is the recommended next action.

**Needs a decision:** `/architect` records a load bearing choice before implementation. Once the design is captured, it replaces the single box with the build milestones and any verification steps.

**Status:** `planned` means it has not started. `in-progress` means design or implementation has begun. `done` means this workflow built and verified it. `existing` means it predates this scope. `dropped` preserves something removed from the active plan.

**Workflow:** Prototype normally ends after `/develop`. Alpha adds real app verification. Beta adds verification and a dedicated test pass. The project rules still require the app to run, typecheck, lint, build, and receive real manual verification after every change.

## References

### Project sources

- `CLAUDE.md`, product intent, engineering rules, accessibility baseline, measurement requirements, safe errors, and verification expectations
- `AGENTS.md`, current framework guidance for the existing scaffold
- Existing code in `app/`, current scaffold status

### Practices and standards

- Tracer Bullet sequencing, prove a narrow real path through every layer before adding breadth
- Privacy across the data lifecycle, minimize exposure of retained prompts and responses from collection through deletion
- Blind evaluation, hide model identity until voting to reduce label induced bias

### Verified links

- [Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/), the accessibility baseline for perceivable, operable, understandable, and robust interfaces
- [NIST Privacy Framework, Getting Started](https://www.nist.gov/privacy-framework/getting-started-0), guidance for managing privacy risk throughout the data lifecycle
- [Quantifying Label Induced Bias in Large Language Model Self and Cross Evaluations](https://arxiv.org/abs/2508.21164), evidence that identity labels can distort model evaluation
- [Next.js App Router documentation](https://nextjs.org/docs/app), the official reference for the scaffold already present in this repository
