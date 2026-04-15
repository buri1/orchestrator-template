# Beren Millidge: "Scaffolded LLMs as Natural Language Computers" (2023) -- Deep Analysis

> Primary source: [beren.io/2023-04-11-Scaffolded-LLMs-natural-language-computers](https://www.beren.io/2023-04-11-Scaffolded-LLMs-natural-language-computers/)
> Cross-posted: [LessWrong](https://www.lesswrong.com/posts/43C3igfmMrE9Qoyfe/scaffolded-llms-as-natural-language-computers) (97 karma, 10 comments)
> HN discussion: [news.ycombinator.com/item?id=35544964](https://news.ycombinator.com/item?id=35544964) (118 points, 23 comments)
> Published: April 11-12, 2023

---

## 1. The Original Essay: Full Summary

### Context and Motivation

Millidge wrote this essay in April 2023, at the peak of the first AutoGPT wave. GPT-4 had just launched, and projects wrapping LLMs in agentic loops were proliferating. His core argument: everyone was building cool demos, but nobody was seeing the bigger picture. These scaffolded systems were not toys -- they were the embryonic form of a new kind of general-purpose computer.

### The Architecture of a Scaffolded LLM

Millidge points to the "generative agent" architecture from Park et al. (Stanford, 2023) as his motivating example. He observes that it contains: a central compute unit (the LLM) that receives instructions and executes natural language tasks; prompt templates specifying those tasks; a memory store much larger than can be fed into context; and read/write access between compute and memory. This, he argues, is structurally identical to the von Neumann architecture.

### The Central Thesis

The essay's most important sentence: what we have built is a computer -- but a very special sort of computer. It operates not on bits, but on text. It is a **natural language computer** that operates on units of natural language text to produce other, more processed, natural language texts. And like a digital computer, it is theoretically fully general: the operations of a Turing machine can be written as natural language.

The convergent evolution toward von Neumann architecture is, in Millidge's view, not surprising -- the von Neumann abstraction is a natural design pattern for computation systems. But the implications of recognizing the pattern are enormous.

### Component Mappings (Section-by-Section)

The essay proceeds systematically through every major subsystem of a digital computer and maps it to its scaffolded-LLM equivalent:

- **CPU --> LLM (the "NLPU")**: The LLM is where the fundamental computation occurs. But unlike a CPU whose natural type signature is `bits -> bits`, the NLPU's type signature is `strings -> strings`. The tokens in the context window are the equivalent of bits in registers.

- **RAM --> Prompt / Context Window**: The easily accessible memory that can be rapidly operated on by the CPU. The context window is the RAM of the natural language computer.

- **Disk / Memory Banks --> Vector Database**: The slow-access external storage. Vector databases (like FAISS) correspond to disk memory in digital computers. The heuristics for retrieval (e.g., vector search over embeddings) correspond to memory controller firmware.

- **Drivers / I/O --> Plugins and Tool Use**: Digital computers interact with the external world through drivers and special hardware/software modules. For scaffolded LLMs, plugins and equivalent mechanisms serve this role.

- **Programs --> Scaffolding Code**: The code surrounding the LLM core that implements protocols for chaining individual LLM calls -- ReAct loops, recursive summarizers, etc. These protocols are the "programs" that run on the natural language computer.

### Units of Performance

Millidge derives two core performance metrics for the natural language computer:

1. **Context Length as RAM**: GPT-4 had 8K context at the time, expanding to 32K. Millidge calls this "8kbit RAM" and places LLM computing at the equivalent of a Commodore 64 -- early 1980s in digital computer terms.

2. **NLOPs (Natural Language Operations)**: Each LLM call/generation performing a single computational task is one NLOP, roughly 100 tokens of generation from a prompt. GPT-4 delivered approximately 1 NLOP/sec. GPT-3.5 Turbo, being 10x faster, achieved about 10 NLOPs/sec. He acknowledges the comparison to billions of FLOPs/sec is unfair (a single NLOP is vastly more complex than a CPU instruction), but identifies speed as the critical bottleneck.

### Trajectory and Scaling

Millidge asks whether we should expect Moore's Law-like improvements. His observations:

- Context length had already 4x'd (2K to 8K) in just 3 years since GPT-3
- The power of the underlying LLM had at least 2x'd from GPT-3 to GPT-4
- This was driven by exponentially increasing training costs (GPT-4 estimated at $100M, with $1B runs expected within two years)

**Prediction**: Exponential improvements continue for at least a few years and likely beyond. Within 5-10 years, the cap on training run expenditure would be reached (~$10B), after which progress would shift to efficient utilization of parameters and data, plus underlying GPU hardware improvements.

### Programming Languages for the Natural Language Computer

Millidge identifies early primitives already emerging:

- **Assembly-level**: Chain of Thought, Selection-Inference, Self-Correction Loops, Reflection -- these are the `mov`, `leq`, and `goto` of natural language assembly.
- **Early compilers**: Libraries like LangChain and complex prompt templates -- extremely primitive, but the first compilers.
- **The unknown**: Higher-level abstractions remain entirely unexplored. Building non-leaky abstractions comes at a fundamental cost (overhead), and current NLOP limits prevent experimentation.
- **The frontier**: Entire worlds of natural language algorithms and data structures are completely unknown and lurking at the edge of possibility.

### Execution Model

A critical insight: the natural execution model of the NL computer is **not** the linear, serial execution of a classical CPU. Since you can call an LLM as many times as you like in parallel, the natural execution model is an expanding DAG (Directed Acyclic Graph) of parallel NLOPs, constrained only by the inherent seriality of the program, not by the hardware. Millidge notes: we have reinvented the **dataflow architecture**.

He also observes that LLM computation is naturally **homoiconic** -- there is no principled distinction between instruction and data in the prompt, just as CPU opcodes are bits like everything else. The introduction of system prompts in GPT-4 hints at the beginning of "protected memory regions."

### Memory Hierarchy

Current scaffolded LLMs have only two levels: cache/RAM (the context window) and disk (the vector database). Millidge predicts additional levels will develop:

- Internal cache layers within the LLM architecture (dense vs. sparse/locally attended context)
- External sub-call hierarchies where LLMs rank relevance of context before the main NLOP call
- Latency-vs-size tradeoffs from the cost/time of LLM ranking steps

### Foundation Models as "Cognitive Hardware"

One of the essay's most original contributions: foundation models have more properties of classical hardware than software. Millidge argues this is more than analogy -- it is structural:

- **Black-box nature**: Inscrutable, incredibly expensive, no versioning, essentially no tests
- **Slow iteration**: If you mess up a training run, it is a multi-month wait, not a push-to-GitHub fix
- **Fixed post-deployment**: Behavior is largely baked in at pretraining; fine-tuning offers limited control
- **High generality**: A single model runs a wide array of programs, like a CPU
- **Portability challenges**: Theoretically switching models is changing an API call; in practice, prompts and failsafes are hardcoded for specific LLMs -- like early programs written for specific hardware architectures. This is simply a symptom of insufficiently developed abstractions and programming too close to the metal.

**Prediction**: Once NL programs spread and become ubiquitous, the same dynamics between hardware and software will emerge. Producing NL programs will be much cheaper than producing the hardware. NL software will have faster iteration time and become the primary locus of distributed innovation.

### Fundamental Differences from Digital Computers

Millidge is careful to note where the analogy breaks down:

1. **Underspecification**: NLOPs like summarization are one-to-many mappings. There is no "optimal" summary. No truth tables.
2. **Unreliability**: Different LLMs, prompts, and even the same prompt at high temperature produce varying quality. LLMs are not even deterministic at zero temperature (due to nondeterministic CUDA optimizations).
3. **Non-determinism**: This is fundamentally unlike digital hardware with fixed, known I/O specifications.

**Critical implication**: Before powerful abstractions can be built, NLOP reliability must be significantly improved. Abstractions need a reliable base. Digital computers enable towers of abstraction precisely because of their reliability. Without it, you fight chaotic divergence. Millidge predicts we will need "semantic error correcting codes" analogous to hardware error correction.

4. **Flexibility as advantage**: Unlike a CPU with a fixed instruction set, an LLM can attempt any arbitrary natural language task. The set of op-codes is ever-growing -- like constantly discovering new logic gates.

5. **RISC vs. CISC**: LLMs intrinsically operate in a CISC regime. Millidge predicts a future debate isomorphic to RISC vs. CISC about whether to chain many simple prompts or use fewer complex ones.

### Theory Gap

Millidge identifies a profound absence: digital computers had decades of theory before they became practical (Turing, Godel, lambda calculus, boolean logic, algorithmic complexity). By contrast, there is almost no formal theory of NL computers. We lack:

- Bounds on a single NLOP's capabilities
- A minimal NL circuit (equivalent of a NAND gate)
- Programming language theory for NLOP composition
- Truth tables for correct behavior specification
- Any equivalent of computational complexity theory for NL programs

Only the most basic steps like Janus's "Simulators" framework (LessWrong, September 2022) had been published.

---

## 2. The Core Claim: "We Have Reinvented the Von Neumann Architecture"

Millidge's claim is not merely metaphorical. He argues the convergence is structural and inevitable:

1. **Any system** that has a central processing unit operating on instructions, working memory for immediate computation, long-term storage for persistent data, and I/O for external interaction **will converge** on something resembling the von Neumann architecture.

2. The fact that LLM scaffolding independently arrived at this pattern is evidence that the von Neumann abstraction is a **universal design pattern for computation**, not specific to digital electronics.

3. The recognition of this pattern is valuable because it imports decades of computer architecture knowledge -- memory hierarchies, execution models, instruction set design, hardware-software decoupling, programming language theory -- as a roadmap for LLM agent development.

The key nuance: Millidge does NOT claim LLMs are literally von Neumann machines. He claims the architectural pattern is isomorphic, and therefore the lessons from 80 years of computer architecture become applicable as design heuristics for scaffolded LLM systems.

---

## 3. The Component Mapping (Summary Table)

| Digital Computer       | Natural Language Computer      | Notes                                        |
|------------------------|-------------------------------|----------------------------------------------|
| CPU                    | LLM (NLPU)                   | `bits -> bits` vs. `strings -> strings`      |
| Registers              | Active token positions        | Immediate computation substrate              |
| RAM                    | Context window                | Fast, limited, directly operated on          |
| Disk / Memory banks    | Vector database (FAISS etc.)  | Large, slow, persistent                      |
| Memory controller      | Retrieval heuristics          | Vector search = firmware addressing logic    |
| Instruction set (ISA)  | Prompt templates / NLOPs      | Fixed vs. unbounded (CISC-like)              |
| Programs               | Scaffolding code              | ReAct loops, summarizers, agent protocols    |
| Drivers / I/O          | Plugins / tool use            | External world interaction                   |
| FLOP                   | NLOP                          | ~100 tokens of generation per operation      |
| FLOP/s                 | NLOP/s                        | GPT-4 ~1/sec, GPT-3.5T ~10/sec              |
| Op-codes               | Prompt primitives             | CoT, SI, reflection = mov, leq, goto        |
| Compilers              | LangChain, prompt templates   | Extremely primitive in 2023                  |
| System prompt          | Protected memory region       | Separation of instruction from data begins   |
| Error-correcting codes | (Needed) Semantic ECC         | Not yet developed as of 2023                 |
| Execution model        | Expanding DAG (dataflow)      | Naturally parallel, not serial               |
| Hardware               | Foundation model               | Expensive, slow iteration, general, black-box|
| Software               | NL programs / scaffolds       | Cheap, fast iteration, primary innovation    |

---

## 4. Millidge's Predictions: Scorecard (April 2023 --> April 2026)

### Prediction 1: Exponential improvements in context length and NLOPs continue
**Status: CONFIRMED.** Context windows went from 8K (GPT-4, March 2023) to 128K (GPT-4 Turbo, November 2023) to 200K (Claude 3, March 2024) to 1M (Gemini 1.5, February 2024) to 1M (Claude Opus 4, 2025). That is a ~125x increase in 2 years, faster than Millidge predicted. NLOP speed has also improved dramatically with faster inference, streaming, and parallel function calling.

### Prediction 2: Training cost ceiling of ~$10B within 5-10 years
**Status: IN PROGRESS / PARTIALLY CONFIRMED.** Frontier training runs by 2025 were estimated at $1-5B. The Stargate project announced $500B infrastructure investment. The $10B single-run threshold is being approached but the timeline is compressed vs. Millidge's estimate.

### Prediction 3: Progress shifts from scaling to efficiency
**Status: PARTIALLY CONFIRMED.** The rise of MoE architectures (Mixtral, DBRX, Grok), distillation (Phi, Gemma), quantization (GGUF, TurboQuant), and architectural innovations (Mamba, RWKV, Zyphra's own hybrid models) all confirm this trend. However, raw scaling has not stopped either.

### Prediction 4: Additional memory hierarchy levels will emerge
**Status: CONFIRMED.** MemGPT (Packer et al., October 2023) explicitly implemented OS-inspired virtual context management with main context (RAM) and external context (disk), plus page-in/page-out mechanisms. Multi-level caching is now standard in production agent systems. The paper "Multi-Agent Memory from a Computer Architecture Perspective" (Yu et al., March 2026) proposes a three-layer hierarchy (I/O, cache, memory) with cache-sharing protocols.

### Prediction 5: Hardware-software decoupling will increase (model portability)
**Status: PARTIALLY CONFIRMED.** Model-agnostic frameworks (LangChain, LlamaIndex, Vercel AI SDK) have improved portability. But prompt engineering remains highly model-specific. The abstraction layer is better but far from the hardware-software separation of mature digital computing.

### Prediction 6: RISC vs. CISC debate will emerge for prompt design
**Status: CONFIRMED (implicitly).** The industry has largely moved toward prompt chaining (RISC-like: many simple, modular calls) over monolithic complex prompts (CISC-like). Anthropic's own recommendations favor tool use + structured outputs over mega-prompts. This debate is alive and active, though not always framed in Millidge's RISC/CISC terminology.

### Prediction 7: NL software becomes cheap and dominant vs. expensive hardware
**Status: CONFIRMED.** The entire agent/harness ecosystem (CrewAI, AutoGen, Claude Code, Cursor, Devin, etc.) is software-layer innovation running on a small number of foundation model providers. The hardware (foundation models) remains prohibitively expensive to produce; the software iterates daily.

### Prediction 8: Programming language abstractions will mature
**Status: IN PROGRESS.** We have moved beyond raw prompt templates to structured agent frameworks, but we have not yet reached the equivalent of "C" for natural language computing. DSPy, LMQL, Guidance, and similar projects attempt this, but none has achieved the universality or abstraction power Millidge envisions.

### Prediction 9: Formal theory of NL computation remains absent
**Status: STILL TRUE (as of 2026).** There is no equivalent of computational complexity theory, formal verification, or type theory for natural language programs. The CoALA framework (Sumers et al., 2023) and various taxonomy papers have organized the space but have not produced formal theory. This remains the deepest gap.

### Prediction 10: Semantic error-correcting codes will be needed
**Status: PARTIALLY CONFIRMED.** Self-correction loops, reflection, and verification chains (e.g., constitutional AI, debate protocols, critic agents) serve as informal semantic ECC. But no formal framework for semantic error correction has been developed. The reliability problem Millidge identified remains the primary obstacle to deep abstraction stacking.

---

## 5. Reception and Influence

### Quantitative Reception
- **LessWrong**: 97 karma, 10 comments (strong for a technical post)
- **Hacker News**: 118 points, 23 comments (front page)
- **LinkedIn**: Multiple shares from ML practitioners (Arun Rao, Steve Brown, Darryn van Tonder)
- **Podcast**: Read on The Nonlinear Library (LessWrong audio)
- **Academic citation**: Difficult to measure precisely since it is a blog post, not a paper. Semantic Scholar does not index it with a formal citation count. However, it is referenced in multiple subsequent works.

### Community Response Themes

**On Hacker News:**
- Top comment challenged the premise that natural language is a good interface for specifying tasks, arguing it is "fantastically bad" for unambiguous, repeatable, reliable tasks
- Counterarguments cited GPT-4 as useful for iterative specification refinement (a "software architect" for collaborative clarification)
- Discussion of emerging constraint languages (LMQL, gpt-jargon) formalizing LLM interactions
- Developer concerns about obsolescence balanced by hope that high-level instruction composition remains valuable
- Reliability skepticism from AutoGPT crash experiences

**On LessWrong:**
- Debate over whether 1 token = 1 bit (information-theoretically, tokens carry 13-17 bits given vocabulary size)
- Discussion of whether context window maps more accurately to CPU registers than RAM
- One commenter described a vivid feeling of "using one of the earliest computers" when working with GPT-4
- Millidge engaged substantively with critiques

### Influence on Subsequent Work

The essay has had outsized intellectual influence despite being a blog post:

1. **Stephen Fowler's "Scaffolded LLMs: Less Obvious Concerns" (LessWrong, June 2023)** -- Explicitly builds on Millidge's S-LLM definition, extending it to multi-core systems and analyzing safety implications. Raises three concerns: open-source development creating evolutionary pressure toward dangerous agents, natural language's ambiguity being a safety risk rather than advantage, and modularity enabling self-modification.

2. **CoALA: Cognitive Architectures for Language Agents (Sumers, Yao, Narasimhan, Griffiths, September 2023)** -- The most academically rigorous framework for agent architecture. Published in TMLR. Draws from cognitive science rather than computer architecture, but addresses the same structural questions (memory, action space, decision-making). Whether it directly cites Millidge is unclear, but the intellectual lineage is obvious.

3. **MemGPT: Towards LLMs as Operating Systems (Packer et al., October 2023)** -- Directly implements Millidge's memory hierarchy prediction, applying OS virtual memory concepts to LLM context management. The paper's title ("LLMs as Operating Systems") echoes Millidge's framing.

4. **AIOS: LLM Agent Operating System (Mei et al., March 2024, COLM 2025)** -- Takes the OS analogy to its logical conclusion with scheduling, context management, memory management, storage management, and access control as kernel services. Achieves 2.1x speedup.

5. **Building LLM Agents by Incorporating Insights from Computer Systems (Mi et al., April 2025)** -- The most direct academic descendant of Millidge's framework. Explicitly advocates using von Neumann architecture as a design template. Proposes F=(P,C,M,T,A) framework mapping to perception, cognition, memory, tools, and action. Maps CPU to cognition module, memory hierarchy to agent memory, I/O to perception/action.

6. **Multi-Agent Memory from a Computer Architecture Perspective (Yu et al., March 2026)** -- Extends the computer architecture analogy to multi-agent systems, proposing cache-sharing protocols and memory consistency models drawn from multiprocessor architecture.

7. **Lilian Weng's "LLM Powered Autonomous Agents" (June 2023)** -- The most influential survey post on LLM agents (from OpenAI's Head of Safety Systems). Uses the "Agent = LLM + memory + planning + tool use" framing that echoes Millidge's component decomposition, though Weng draws more from cognitive science than computer architecture.

### The "Scaffolding Skepticism" Arc

Notably, Millidge himself partially walked back the enthusiasm for scaffolding in his May 2024 follow-up "Does Scaffolding Help Humans?" where he argued:

- Agent systems remain plagued by reliability issues and far from production use
- It is unclear that humans think via rigid loops (PERCEIVE, THINK, ACT)
- Expert performance relies on implicit, subconscious knowledge, not rigid system-following
- Direct environmental learning seems more promising than explicit cognitive loop architecture
- The key bottleneck is the underlying model's capabilities, not the scaffold

This represents a significant update: Millidge moved from "scaffolding is the substrate of a new general-purpose computer" (2023) to "scaffolding may not help much; the model itself is what matters" (2024). By his 2024 year-end review, he wrote that human-level AGI is already possible with existing frontier LLMs given sufficient scaffolding, augmentation, and further training -- suggesting the 2023 framework was directionally correct even if the emphasis on explicit scaffolding patterns was overstated.

---

## 6. About Beren Millidge

### Career Arc
- **Education**: PhD in Machine Learning and Computational Neuroscience, University of Edinburgh. Visiting scholar at University of Sussex (with Alexander Tschantz, Christopher Buckley, Anil Seth -- major figures in active inference / free energy principle research). Postdoc in Computational Neuroscience at University of Oxford with Rafal Bogacz.
- **Conjecture**: Head of Research. Helped start the Sparse Autoencoders (SAE) boom in interpretability research.
- **Apollo Research**: Brief co-founding stint (AI safety evaluations).
- **Zyphra**: Co-founder and Chief Scientist (current). Leads technical teams pretraining language, vision, and audio models. Focus on hybrid architectures (non-transformer alternatives), distributed training, and model efficiency. Based between Bay Area and London. ~50 employees as of late 2025.

### Research Profile
- Active on Google Scholar with extensive publications in computational neuroscience, active inference, predictive coding, and ML
- Prolific blogger at beren.io -- topics span AI, alignment, neuroscience, free energy principle, social dynamics, strategy
- Active on LessWrong (3,154 karma) and Alignment Forum
- TEDx Miami speaker ("AI, the Brain, and Our Future")
- NVIDIA Technical Blog contributor

### Intellectual Style
Millidge's distinctive strength is drawing structural analogies between neuroscience, computer science, and AI systems. The "Scaffolded LLMs" essay exemplifies this: he recognized a pattern from computer architecture in a domain where most practitioners were thinking in terms of ML engineering. His neuroscience background (free energy principle, predictive coding, active inference) gives him a unique lens on agent architectures -- one that treats computation, not statistics, as the primary frame.

### Notable Intellectual Evolution
His annual "Intellectual Progress" posts track a consistent arc:
- 2022: Free energy principle, active inference, computational neuroscience
- 2023: Scaffolded LLMs, natural language computers, the agent explosion
- 2024: Skepticism of scaffolding, architectures beyond transformers, RAG vindication, move toward Zyphra's hybrid model focus
- 2025: Zyphra scaling challenges, internal progress on AGI deconfusion, less public writing

---

## 7. Related Academic and Intellectual Work

### The Direct Lineage (Computer Architecture Analogies for LLM Agents)

| Year | Work | Key Contribution |
|------|------|-----------------|
| 2022 Sep | Janus, "Simulators" (LessWrong) | LLMs as simulators of processes, not agents. Foundational ontology. |
| 2023 Apr | **Millidge, "Scaffolded LLMs as Natural Language Computers"** | **The von Neumann mapping. NLOP, NLPU, memory hierarchy, execution model.** |
| 2023 Apr | Park et al., "Generative Agents" (Stanford) | The architecture Millidge pointed to as motivating example. Memory stream + reflection + planning. |
| 2023 Jun | Weng, "LLM Powered Autonomous Agents" (Lil'Log) | Canonical survey: Agent = LLM + memory + planning + tools. Cognitive science framing. |
| 2023 Jun | Fowler, "Scaffolded LLMs: Less Obvious Concerns" (LessWrong) | Safety analysis of S-LLMs building on Millidge's definitions. |
| 2023 Sep | Sumers et al., "CoALA" (arXiv, TMLR 2024) | Cognitive Architectures for Language Agents. Modular memory + action space + decision loop. |
| 2023 Oct | Packer et al., "MemGPT" (arXiv) | OS-inspired virtual context management. RAM/disk analogy implemented. |
| 2024 Mar | Mei et al., "AIOS" (arXiv, COLM 2025) | Full OS kernel for LLM agents: scheduling, context mgmt, memory mgmt, access control. |
| 2024 May | Millidge, "Does Scaffolding Help Humans?" | Self-revision: scaffolding may not be the key factor; model capability matters more. |
| 2025 Apr | Mi et al., "Building LLM Agents from Computer Systems" (arXiv) | Most direct academic extension: F=(P,C,M,T,A) framework from von Neumann. |
| 2026 Mar | Yu et al., "Multi-Agent Memory from Computer Architecture" (arXiv) | Cache sharing, memory consistency, three-layer hierarchy for multi-agent systems. |

### The Cognitive Science Branch

Separately from the computer architecture analogy, a parallel tradition draws from cognitive science:

- **ACT-R, SOAR, and classical cognitive architectures** (Newell, Anderson, Laird -- 1980s-2000s): The original cognitive architectures. CoALA explicitly positions itself as updating these for the LLM era.
- **"Applying Cognitive Design Patterns to General LLM Agents"** (arXiv, 2025): Maps recurring cognitive design patterns from pre-transformer AI architectures to modern LLM agents.
- **The "Language Model Cognitive Architecture" tag on LessWrong**: An entire sub-community has formed around this intersection.

### The Operating Systems Branch

A distinct thread takes the computer analogy beyond architecture into OS design:

- **MemGPT** (2023): Virtual memory management
- **AIOS** (2024): Full kernel with scheduling and resource management
- **"Memory OS of AI Agent"** (EMNLP 2025): OS-level memory abstractions
- **Agent runtimes** (Claude Code, Devin, OpenHands): Production systems that implement OS-like abstractions without theorizing about them

---

## 8. The Gap: What Millidge Did NOT Cover

### 8.1 Harvard Architecture (Separate Instruction and Data Memory)

Millidge focuses on von Neumann (shared instruction/data space). But the introduction of system prompts, which separate instructions from data, is actually a move toward **Harvard architecture** -- separate memory spaces for instructions and data. Modern LLM systems increasingly enforce this separation:

- System prompts (instruction memory) vs. user messages (data memory)
- Tool definitions (instruction ROM) vs. conversation context (data RAM)
- Agent persona files vs. working state

This is a significant architectural distinction Millidge did not explore. The security implications alone (prompt injection = code injection in a von Neumann machine; Harvard architecture is inherently more resistant) deserve deep analysis.

### 8.2 Dataflow Architecture (Mentioned but Not Developed)

Millidge briefly notes that the natural execution model is a DAG and that "we have reinvented the dataflow architecture." But he does not develop this. Modern agent orchestrators (CrewAI, LangGraph, our own tmux-based orchestrator) are fundamentally dataflow systems -- computation triggered by data availability, not sequential instruction fetch. This deserves a full treatment:

- Static dataflow vs. dynamic dataflow for agents
- Token-level dataflow (streaming) vs. task-level dataflow (orchestration)
- Tagged-token architectures for multi-agent parallelism

### 8.3 Distributed Systems and Multi-Processor Architecture

Millidge's essay is entirely about single-agent (single-processor) systems. The multi-agent case introduces:

- **Cache coherence**: How do agents share context without conflict? (Yu et al., 2026 begins addressing this)
- **Message passing vs. shared memory**: Agents communicating via text (message passing) vs. shared vector databases (shared memory)
- **Consistency models**: What consistency guarantees do multi-agent systems need?
- **Load balancing and scheduling**: How do you allocate NLOPs across multiple LLMs?

### 8.4 Interrupt Handling and Concurrency

Millidge does not discuss interrupts, exceptions, or concurrency control. Modern agent systems desperately need:

- **Interrupt mechanisms**: How does a running agent respond to new information or priority changes?
- **Context switching**: How do you save and restore agent state?
- **Deadlock and livelock detection**: Multi-agent systems can deadlock on shared resources
- **Preemptive vs. cooperative scheduling**: AIOS addresses this, but the theory is underdeveloped

### 8.5 Security Architecture

No discussion of:

- **Memory protection**: How do you prevent one agent from corrupting another's state?
- **Privilege levels**: Ring 0 (system) vs. Ring 3 (user) for agent permissions
- **Sandboxing**: Isolating agent execution environments
- **Prompt injection as buffer overflow**: The structural analogy between prompt injection and classic buffer overflow attacks (both exploit the lack of separation between code and data in a von Neumann architecture)

### 8.6 Compilation and Optimization

Millidge identifies early compilers (LangChain) but does not explore:

- **Compilation strategies**: Ahead-of-time (predefined workflows) vs. JIT (dynamic planning)
- **Optimization passes**: Prompt compression, redundancy elimination, caching of repeated computations
- **Linking**: Composing agent modules from different sources
- **Debugging and profiling**: How do you trace execution through an NL program?

### 8.7 The "Semiconductor" Layer

Millidge treats the LLM as an opaque CPU. But there is a layer below the LLM:

- **GPU architecture** powering inference
- **Quantization** as a form of voltage/precision tradeoff
- **KV-cache** as hardware-level memory optimization
- **Speculative decoding** as branch prediction
- **Mixture of Experts** as heterogeneous multi-core

### 8.8 Type Systems and Formal Verification

Millidge identifies the absence of theory but does not sketch what it might look like. Candidates:

- **Type systems for prompts**: Guaranteeing that a prompt produces output conforming to a schema (cf. Outlines, Instructor, structured outputs)
- **Formal verification of agent workflows**: Proving properties about multi-step agent plans
- **Contract-based design**: Pre/post-conditions for NLOPs
- **Model checking**: Exhaustive exploration of agent state spaces

---

## Summary Assessment

Beren Millidge's "Scaffolded LLMs as Natural Language Computers" is the single most important conceptual essay in the LLM agent architecture space. Written in April 2023 -- before the agent frameworks, before the OS papers, before the formal taxonomies -- it provided the intellectual scaffolding (appropriately enough) for understanding what was being built.

Its core contributions:

1. **Named the pattern**: Recognizing that scaffolded LLMs had convergently evolved toward the von Neumann architecture
2. **Provided the vocabulary**: NLPU, NLOP, natural language computer, cognitive hardware
3. **Mapped the components**: A systematic mapping that remains accurate three years later
4. **Identified the trajectory**: Nearly all predictions have been confirmed or are in progress
5. **Diagnosed the gaps**: The absence of formal theory, the reliability problem, the need for semantic error correction -- all remain the critical open problems

Its limitations:

1. **Single-agent focus**: Did not anticipate the multi-agent explosion
2. **Underdeveloped dataflow model**: Mentioned but not explored
3. **No security analysis**: Harvard architecture, memory protection, prompt injection not discussed
4. **Scaffolding skepticism**: Millidge himself partially retracted the emphasis on scaffolding by 2024

The essay's intellectual descendants -- CoALA, MemGPT, AIOS, Mi et al. 2025, Yu et al. 2026 -- collectively confirm that the computer architecture frame is productive and generative. The computer architecture analogy for LLM agents is not just a metaphor; it is a design methodology.

---

## Sources

- [Millidge, "Scaffolded LLMs as Natural Language Computers" (beren.io, April 2023)](https://www.beren.io/2023-04-11-Scaffolded-LLMs-natural-language-computers/)
- [LessWrong cross-post (97 karma, 10 comments)](https://www.lesswrong.com/posts/43C3igfmMrE9Qoyfe/scaffolded-llms-as-natural-language-computers)
- [Hacker News discussion (118 points, 23 comments)](https://news.ycombinator.com/item?id=35544964)
- [Millidge, "Does Scaffolding Help Humans?" (beren.io, May 2024)](https://www.beren.io/2024-05-05-Does-Scaffolding-Help-Humans/)
- [Millidge, "Intellectual Progress in 2024" (beren.io, January 2025)](https://www.beren.io/2025-01-04-Intellectual-Progress-in-2024/)
- [Millidge, "Intellectual Progress in 2025" (beren.io, January 2026)](https://www.beren.io/2026-01-01-Intellectual-Progress-in-2025/)
- [Millidge, About Me (beren.io)](https://www.beren.io/aboutme/)
- [Fowler, "Scaffolded LLMs: Less Obvious Concerns" (LessWrong, June 2023)](https://www.lesswrong.com/posts/mAwxebLw3nYbDivmt/scaffolded-llms-less-obvious-concerns)
- [Sumers et al., "Cognitive Architectures for Language Agents" (CoALA, arXiv 2309.02427, TMLR 2024)](https://arxiv.org/abs/2309.02427)
- [Park et al., "Generative Agents: Interactive Simulacra of Human Behavior" (arXiv 2304.03442, Stanford, 2023)](https://arxiv.org/abs/2304.03442)
- [Packer et al., "MemGPT: Towards LLMs as Operating Systems" (arXiv 2310.08560, 2023)](https://arxiv.org/abs/2310.08560)
- [Mei et al., "AIOS: LLM Agent Operating System" (arXiv 2403.16971, COLM 2025)](https://arxiv.org/abs/2403.16971)
- [Mi et al., "Building LLM Agents by Incorporating Insights from Computer Systems" (arXiv 2504.04485, 2025)](https://arxiv.org/abs/2504.04485)
- [Yu et al., "Multi-Agent Memory from a Computer Architecture Perspective" (arXiv 2603.10062, 2026)](https://arxiv.org/abs/2603.10062)
- [Weng, "LLM Powered Autonomous Agents" (Lil'Log, June 2023)](https://lilianweng.github.io/posts/2023-06-23-agent/)
- [Janus, "Simulators" (LessWrong, September 2022)](https://www.lesswrong.com/posts/vJFdjigzmcXMhNTsx/simulators)
