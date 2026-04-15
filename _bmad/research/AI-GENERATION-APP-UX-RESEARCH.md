# AI Generation App UX Research -- April 2026

Deep research into the UX patterns, interface designs, and features of the top AI image/video generation platforms. Goal: inform the design of a custom interface for non-technical users to explore and compare AI generation models.

---

## Table of Contents

1. [Platform Deep Dives](#platform-deep-dives)
2. [Side-by-Side Comparison Tools](#side-by-side-comparison-tools)
3. [Cross-Platform UX Pattern Analysis](#cross-platform-ux-pattern-analysis)
4. [Recommendations for Custom Interface](#recommendations-for-custom-interface)

---

## Platform Deep Dives

### 1. Freepik AI Suite

**URL**: freepik.com/ai

**Interface Layout**: Two-panel design. Left sidebar contains prompt input + all generation controls. Right panel shows the generated image preview/results.

**Prompt Input**:
- Text field in the left sidebar
- "AI Prompt" button lets the AI refine/expand the description automatically
- Custom seed option for reproducibility

**Model Selection**:
- 30+ AI image generation models available (as of March 2026)
- Model selector in the settings panel next to the prompt field
- Browse by provider or search by model name
- Models include: Mystic (2.5, 2.5 Flexible, 1.0), Ideogram, Google Imagen 3, Flux (1.0, 1.0 Fast, 1.0 Realism, 1.1), Recraft, Seedream 3.0, Nano Banana, plus Runway and Kling for video
- Each model has different strengths clearly labeled (speed, realism, artistic, etc.)

**Parameter Controls**:
- Style presets: Pre-made visual presets accessible via star icon. Premium styles marked with yellow crown icons
- Effects: Color, camera angles, lighting adjustments (note: UI closes the Effects window after every selection -- a UX friction point)
- Characters/Objects: Reusable figures and items for consistency
- Colors: Predefined palettes
- Aspect ratio: Multiple options from 1:2 to 2:1
- Number of images: 1-12 per generation

**Results & History**:
- Images appear in seconds in the right preview panel
- Options per image: download, edit, publish to profile, create variations, convert to video
- All generated images saved automatically
- Accessible via "Recent creations" on AI Suite homepage or "History" tab inside the Image Generator

**Post-Generation Editing**:
- Upscaler (up to 10K resolution)
- "Reimagine" for variations
- "Expand" for outpainting
- AI Assistant chat editor for command-based modifications (remove objects, adjust colors)
- Figma Plugin for direct insertion into design files

**What Makes It Good for Non-Technical Users**:
- Style presets eliminate need to write complex prompts
- AI prompt enhancement does the hard work for the user
- Smooth onboarding with no aggressive upgrade pop-ups
- 20 free daily generations to explore without commitment
- Integrated editing tools mean no app-switching

---

### 2. Runway ML (Gen-4 / Gen-4.5)

**URL**: runwayml.com

**Interface Layout**: Dashboard-centric design with a Session-based workflow. Dark mode available. Four generation entry points within a Session:
1. **Tool** -- Granular control over the generative process
2. **App** -- Use-case specific generation methods
3. **Chat** -- Collaborative creation experience for iterating
4. **Workflow** -- Node-based custom pipelines (no coding required)

**Dashboard Navigation**:
- Sessions button reveals previous sessions, allows creating new ones
- Library/Assets section for organizing generated content, Custom Elements, and Video Editor Projects
- Assets tab: everything generated and uploaded, with folder organization
- Chronological organization: latest generations at the bottom, oldest at top

**Prompt Input & Controls**:
- Text prompt or reference image upload
- Motion Brush 3.0: "paint" areas to direct movement with vector controls for speed and direction
- Director Mode: Node-based interface for controlling camera angles (zoom, pan, tilt, truck) and lighting dynamically
- Motion bucket parameter: controls movement intensity (1-255 range)
- ControlNet-style guides, Gen-4 References, Layout Sketch

**Generation Progress**:
- Queue times: 0-60 seconds during peak hours (US evenings)
- Priority queue on Unlimited plan bypasses wait
- Status indicators: PROCESSING -> SUCCEEDED

**Results Display**:
- Complete timeline-based video editor with traditional cutting, color grading, effects
- AI tools integrated within the timeline (background removal, upscaling, generation)
- Resembles Adobe Premiere / Final Cut Pro layout

**Model Selection**:
- Gen-3 Alpha, Gen-4, Gen-4.5 (latest)
- Gen-4.5 supports text-to-video and image-to-video
- Duration options: 2-10 seconds per generation

**What Makes It Good for Non-Technical Users**:
- Chat mode makes generation feel conversational
- App mode provides use-case-specific shortcuts
- Familiar timeline editor paradigm from traditional video editing
- Workflows can be shared as Apps, removing complexity

---

### 3. Kling AI (by Kuaishou)

**URL**: klingai.com / app.klingai.com

**Interface Layout**: Clean generation interface with mode switching between Text-to-Video and Image-to-Video.

**Prompt Input**:
- Text field for natural language video description
- Image uploader (button or drag-and-drop) for Image-to-Video mode
- Structured prompt format: Subject + Action + Context + Style + Camera move

**Parameter Controls**:
- Aspect ratio dropdown (widescreen for YouTube, vertical for TikTok)
- Video duration control
- Motion intensity settings
- Video quality toggle (up to 1080p at 30 fps, 4K HDR on higher tiers)
- CFG Scale, Negative Prompts (advanced)
- Camera tags for specific camera movements

**Advanced Features (Kling 3.0)**:
- Multi-shot sequences: Up to 6 camera cuts in a single generation
- AI Director: Automatically determines shot composition, angles, transitions
- Elements feature: Combine up to 4 reference images for character consistency
- Native audio synthesis with lip-sync matching, voiceover generation, environmental SFX
- Motion control and performance copying (Kling 2.6)

**Models Available**:
- Kling 1.6 (simplified prompts)
- Kling 2.5 Turbo (40% faster, up to 3-minute videos)
- Kling 2.6 (5-7 elements, motion control)
- Kling 3.0 (latest, multi-shot + audio)
- Kling O1 (unified multimodal, interprets all input types)

**Results**:
- Videos generated at 1080p, 30 fps
- Up to 2-minute length per generation
- Extended videos up to 3 minutes with Turbo

**What Makes It Good for Non-Technical Users**:
- AI Director handles shot composition automatically
- Multi-shot feature removes need for video editing skills
- Native audio means users get a complete video, not just visuals
- Character consistency via Elements feature is easy to use

---

### 4. Pika Labs (Pika 2.5)

**URL**: pika.art

**Interface Layout**: Evolution from simple prompt-to-clip into a timeline + layer-based editor (Pika 2.5 Studio). Browser-based, no install required.

**Prompt Input**:
- Text field for video description
- Image upload for Image-to-Video
- Pikaframes: Upload first and last frames, Pika generates the transition video between them

**Parameter Controls**:
- Duration control
- Aspect ratio (9:16 for TikTok/Reels, etc.)
- Resolution: 720p or 1080p
- Style presets
- Seed control
- Camera movement commands: "Bullet Time," "Dolly Shots," "Dash Camera"

**Timeline & Layer Editor (2.5 Studio)**:
- Timeline-based editing with layer management
- Effect stacking
- Minimal but learnable controls
- Feels like a compact motion design app rather than a single-use generator
- Expectation: users assemble final sequences in traditional editors (Premiere, Resolve, CapCut)

**Unique Features**:
- Pikaswaps: Object/element replacement in video
- Pikaffects: Visual effects and transformations
- Pikaframes: Keyframe-to-keyframe video generation
- Fast rendering: ~42-second renders

**What Makes It Good for Non-Technical Users**:
- "Type and see" simplicity -- learnable in a single sitting
- Clear interface with integrated guides
- Templates available for common use cases
- Speed of generation (fast feedback loop)
- Camera movement presets remove technical cinematography knowledge

---

### 5. Luma Dream Machine (Ray2 / Ray3)

**URL**: lumalabs.ai/dream-machine

**Interface Layout**: Chat-like experience. Central text box serves as the command center. One fluid space for creative exploration. Available on web, iOS, and Android.

**Main Interface Tabs**:
1. **Describe** -- Text-based generation. Toggle between image or video output. Configure aspect ratio (9:16 to 21:9), resolution, quantity, model selection (Ray3, Image V2)
2. **Keyframe** -- Animate still images or transition between two images. Auto-adopts aspect ratio of uploaded media. Video-specific: duration, dynamic range (SDR, HDR, HDR+EXR)
3. **Reference** -- Upload visual guide for generating similar images (image only, not video)
4. **Modify** -- Alter existing videos or images

**Controls Above Prompt Box**:
- Quick tab switching shortcuts
- Loop mode toggle (infinity icon for seamless video playback)
- Camera Tags (on compatible models)
- Draft Mode (cost-effective Ray3 generation)
- Suggestions feature: helps construct prompts through element mixing

**Generation Options**:
- Clip length: 5 seconds or 10 seconds
- Extend feature: stretch to 1 minute
- Resolution: 540p, 720p, 1080p (upscale to 4K)

**Organization**:
- Artboard, Storyboard, and Moodboard options
- "A board for every idea"
- Project boards for organizing work

**What Makes It Good for Non-Technical Users**:
- Chat-like interaction reduces cognitive load
- Iterative refinement feels like a conversation
- Tab-based organization is clear and discoverable
- Suggestions feature helps users who do not know how to prompt
- Board metaphors (Artboard, Storyboard, Moodboard) are intuitive for creative users

---

### 6. MiniMax / Hailuo AI

**URL**: minimax.io / hailuoai.video

**Interface Layout**: Breaks from traditional node-based workflows. Uses LLM-powered tool invocation -- users describe what they want in natural language and the agent handles the rest.

**Core Modes**:
- Text-to-Image
- Text-to-Video
- Image-to-Video

**Video Agent / Media Agent**:
- Stage 1: Prebuilt video Agent templates. User inputs text or images, clicks once, gets a polished video
- Stage 2 (upcoming): Semi-customizable. Users can edit any part of the creation process -- script, visuals, voiceover
- Transparent reasoning: Users see the Agent's step-by-step thought process in real time
- Intuitive entry points for custom edits at each step

**Output Specs**:
- Up to 6 seconds per clip (standard)
- 1080p resolution
- Industry-leading portrait animation and facial micro-expressions
- Hailuo 2.3: improved physical actions, stylization, motion commands

**Available on**: Website, mobile app (iOS/Android), API

**What Makes It Good for Non-Technical Users**:
- Most opinionated/automated of all platforms -- "zero-touch" video creation
- Natural language is the primary interface -- no technical controls needed
- Transparent reasoning builds trust by showing what the AI is doing and why
- Template-based approach means users do not need to understand filmmaking concepts

---

### 7. Leonardo.ai

**URL**: leonardo.ai

**Interface Layout**: Dashboard-based creative platform combining image generation, editing, upscaling, video generation, and video editing. Two-panel layout with control panel on the right.

**Model Selection**:
- First-party: Phoenix 1.0, Kino XL, Lucid Origin, Lucid Realism
- Third-party: Veo 3, Sora 2, Kling, Seedance
- Omni Models: FLUX.1 Kontext, FLUX.2 Pro, GPT Image-1.5, Nano Banana
- Custom model training (10-20 images)
- Known UX issue: "enough models and modes that a new user can waste a lot of time just deciding what to click"

**Generation Controls (Control Panel, right side)**:
- Model selector
- Number of images
- Image dimensions (width/height)
- Guidance scale
- Step count
- Tiling toggle
- Prompt input field
- Negative prompts
- Seed control
- Alchemy enhancement layer toggle

**Canvas Editor**:
- Unified Canvas for inpainting/outpainting
- Region-specific regeneration
- Composite editing
- Distinguishes Leonardo from competitors

**Omni Editor (Inline Editing)**:
- Appears as a prompt bar below the generated image in the image viewer
- No separate tool or mode -- it is contextual and inline
- Controls: prompt box, Add Image button (up to 6 reference images), model selector menu, generation count button
- Models switchable from dropdown: FLUX.1 Kontext, FLUX.2 Pro, GPT Image-1.5, Nano Banana
- Natural language editing instructions (e.g., "change the background to a forest")

**History & Community**:
- Personal Feed with generation history
- Community gallery of images from other users
- Click any community image to copy its settings/prompt as a starting point
- Bulk Actions for batch management

**What Makes It Good for Non-Technical Users**:
- Omni Editor's inline editing is the standout: edit right where you view, no context switching
- Community gallery with copyable prompts/settings teaches by example
- Alchemy toggle is a one-click quality boost
- BUT model overload is a real UX problem for beginners

---

### 8. Midjourney

**URL**: midjourney.com

**Interface Layout**: Web interface with six main sections: Explore, Create, Organize, Personalize, Chat, Tasks. Standalone web app (evolved from Discord-only origins). Also available as PWA and native iOS/Android apps.

**Create Page -- The Imagine Bar**:
- Prompt input field at top of workspace
- Painting icon button for reference image uploads (drag-and-drop)
- Lock and delete buttons manage references across future generations
- Adjacent buttons: Personalization toggle, Draft Mode, Conversational Mode, search, folders

**Settings Panel (8 controls)**:
- Image dimensions: portrait, square, landscape with adjustable sizing
- Creation mode: Standard or Raw (photorealistic)
- Model version: dropdown selector (V6, V7, V8)
- Stylization slider: "how artistic the images are"
- Weirdness slider: "more unpredictable and unique results"
- Variety slider: diversity of outputs
- Speed control
- Aspect ratio

**Image Display**:
- Each prompt produces 4 variants simultaneously in a 2x2 grid
- Hover reveals "Vary Subtle" and "Vary Strong" buttons
- U1-U4 to upscale individual results
- V1-V4 to generate variations
- Permutation syntax {option1, option2} enables batch operations from single prompts

**Editor**:
- Generative editor like Photoshop's generative fill
- Erase portions of images and regenerate with new prompts
- Paint over areas, change aspect ratios, modify specific elements without changing the whole image

**Personalization**:
- V7 introduced personalization profiles: model learns individual aesthetic preferences
- Style Creator: build custom styles
- Style Codes: personalized fine-tuned checkpoints
- Scrollable past generations to build aesthetic profiles

**Gallery & Organization**:
- Full image gallery with chronological ordering
- Text search, filtering, folder organization, favorites
- Lightbox viewing for detailed inspection

**What Makes It Good for Non-Technical Users**:
- Imagine bar is dead simple: type and press Enter
- 4-variant grid makes every generation feel productive
- Vary Subtle/Strong removes need to re-prompt -- just click for iterations
- Style presets and Personalization mean the AI learns what you like over time
- Explore page shows what others have created, providing inspiration and learning

---

## Side-by-Side Comparison Tools

### Artificial Analysis Image Lab
**URL**: artificialanalysis.ai/image-lab

The most comprehensive comparison tool available.

- **Compare up to 25 models at once** with a single prompt
- Up to 20 images per model in a single run
- Progressive grid display: results appear as each model finishes (no waiting for slowest model)
- Models ranked by ELO ratings from the Artificial Analysis Image Arena
- Customizable aspect ratios and resolutions across models simultaneously
- Image editing comparison: upload a reference image + edit prompt, test across models
- History tracking, favorites, batch download
- **Workflow**: Enter prompt -> Select models -> Configure parameters -> Submit -> View progressive grid

### Cutout.pro Model Comparison Arena
**URL**: cutout.pro/model-comparison/image-generation

- Input a prompt once, simultaneously view outputs from multiple models
- Models include: Flux Krea, Imagen 4.0, Nano Banana, Seedream 4.0-5.0, Wan2.7
- Select All / Deselect All buttons for model management
- Random Prompt button for inspiration
- Aspect ratio selection: 1:1, 4:3, 3:4, 16:9, 9:16
- Side-by-side display to "capture the personality and strengths of different models"

### Arena.ai
**URL**: arena.ai/image/side-by-side

- Compare two image generation models side by side
- Same prompt, evaluate quality, speed, and accuracy
- Instant comparison format

### Char-Gen.com
**URL**: char-gen.com/model-comparison

- Compare up to 4 AI models side-by-side with the same prompt
- Focused on character/fantasy image generation

### JAI Portal
**URL**: jaiportal.com/model-comparison

- Compare up to 6 AI models simultaneously with a single prompt
- See how different models interpret the same creative direction

### Prompting Pixels
**URL**: promptingpixels.com/ai-image-model-comparison

- Compare FLUX, Stable Diffusion 3.5, Ideogram, Recraft, Google Imagen
- Side-by-side across different styles and subjects

### Melies
**URL**: melies.co/compare/ai-image-models

- Up to 14 reference images for visual consistency
- Switch models with one click, compare results side by side

### For Text/Chat LLMs (not image, but pattern reference):
- **OverallGPT** (overallgpt.com): Compare text AI model answers side-by-side
- **AiZolo** (aizolo.com): Send same prompt to ChatGPT, Claude, Gemini, Grok at once
- **Model Faceoff** (modelfaceoff.com): Split-view with simultaneous streaming responses
- **Poe** (poe.com): Multi-model access including image, video, audio generation models

---

## Cross-Platform UX Pattern Analysis

### Pattern 1: Prompt Input Design

| Approach | Used By | Description |
|----------|---------|-------------|
| Simple text field | All platforms | The baseline -- a text box for natural language |
| AI prompt enhancement | Freepik, Luma | AI refines/expands the user's description automatically |
| Structured format hints | Kling, Luma | Suggested structure: Subject + Action + Context + Style |
| Prompt chips/suggestions | Luma | Element mixing through clickable suggestions |
| Conversational mode | Midjourney, Luma, Runway | Chat-like back-and-forth refinement |
| Permutation syntax | Midjourney | {option1, option2} to batch-generate variants |
| Random prompt button | Cutout.pro | Inspiration for users who do not know where to start |

**Best for non-technical users**: AI prompt enhancement (Freepik style) combined with suggestions/chips (Luma style). Users type something rough, the AI makes it better.

### Pattern 2: Parameter Controls

| Approach | Used By | Description |
|----------|---------|-------------|
| Progressive disclosure | Best practice | Basic controls visible, advanced hidden behind "More" |
| Sliders with labels | Midjourney | Stylization, Weirdness, Variety -- human-readable names |
| Dropdowns | Kling, Luma | Aspect ratio, duration, resolution |
| Style presets | Freepik, Pika | Click a style instead of describing it |
| Toggle switches | Leonardo | Alchemy on/off, Tiling on/off |
| Camera movement presets | Pika, Kling, Luma | Named camera moves instead of technical parameters |
| One-click quality boost | Leonardo (Alchemy) | Single toggle for "make it better" |

**Best for non-technical users**: Style presets + progressive disclosure. Show aspect ratio and style on the main screen, hide CFG scale and seed behind an "Advanced" toggle.

### Pattern 3: Generation Progress

| Approach | Used By | Description |
|----------|---------|-------------|
| Time/cost hints upfront | Best practice | "10-20 seconds" or "1 credit" before generating |
| Queue position indicator | Runway | Shows queue times (0-60s during peak) |
| Progressive loading | Artificial Analysis | Results appear as each model finishes |
| Status states | Runway API | PROCESSING -> SUCCEEDED |
| Transparent reasoning | MiniMax/Hailuo | Show step-by-step AI thought process |

**Best for non-technical users**: Time estimate upfront + progressive loading. Users should never stare at a blank screen wondering if it is working.

### Pattern 4: Results Display

| Approach | Used By | Description |
|----------|---------|-------------|
| 2x2 grid (4 variants) | Midjourney | Every generation produces 4 options |
| Single image preview | Freepik | One image in the right panel |
| Progressive grid | Artificial Analysis | Up to 25 model results, appearing as ready |
| Timeline editor | Runway, Pika | Video results in a familiar editing timeline |
| Side-by-side comparison | Cutout.pro, Arena.ai | Same prompt, different models, laid out horizontally |
| Chronological feed | Runway | Latest at bottom, oldest at top |

**Best for non-technical users**: 2x2 or 2x3 grid of variants (Midjourney pattern). Gives users choices without overwhelming them. For model comparison, a progressive grid (Artificial Analysis pattern).

### Pattern 5: Iteration & Refinement

| Approach | Used By | Description |
|----------|---------|-------------|
| Vary Subtle / Vary Strong | Midjourney | One-click variation with intensity control |
| Inline editing | Leonardo (Omni) | Edit right where you view, no context switch |
| Reimagine | Freepik | Generate variations of existing results |
| Pikaframes | Pika | Define start/end frames, generate the middle |
| Generative fill/inpaint | Midjourney, Leonardo | Erase and regenerate specific regions |
| Chat-based refinement | Luma, Runway | Describe changes in conversation |
| Extend | Luma | Stretch 5-second clip to 1 minute |

**Best for non-technical users**: Vary Subtle/Strong buttons (no re-prompting needed) + inline editing (Leonardo Omni pattern). The user sees something close, clicks a button, gets closer.

### Pattern 6: History & Organization

| Approach | Used By | Description |
|----------|---------|-------------|
| Auto-save all generations | Freepik, Leonardo | Nothing is lost, access via History tab |
| Session-based organization | Runway | Group generations by session/project |
| Boards (Artboard, Storyboard, Moodboard) | Luma | Creative project organization |
| Folders + search + favorites | Midjourney | Full gallery management |
| Community gallery with copyable settings | Leonardo | Learn from others' work, copy their setup |
| Personal feed | Leonardo | Chronological history of all generations |

**Best for non-technical users**: Auto-save everything (never lose work) + simple folder/favorites system. Community gallery with copyable prompts is a powerful learning mechanism.

### Pattern 7: Model Selection

| Approach | Used By | Description |
|----------|---------|-------------|
| Searchable model browser | Freepik | Browse by provider, search by name, 30+ models |
| Dropdown with version labels | Midjourney, Runway | Simple version selector (V7, V8, Gen-4, Gen-4.5) |
| Right-panel control selector | Leonardo | Model choice in the generation control panel |
| Model per tab/mode | Luma | Select model within Description Mode |
| Simultaneous multi-model | Artificial Analysis | Select multiple models, generate across all at once |
| Model with strength labels | Freepik | Each model tagged with what it is best at |

**Best for non-technical users**: Model cards with clear labels explaining strengths (Freepik style) + ability to compare across models simultaneously (Artificial Analysis pattern). Users should not need to know model architectures -- they should see "Best for: photorealism" or "Best for: illustration."

---

## Recommendations for Custom Interface

Based on the research, here are the patterns to adopt for a non-technical user-facing AI generation explorer/benchmark tool:

### Must-Have Features

1. **Single prompt, multi-model comparison** (Artificial Analysis Image Lab pattern)
   - Enter one prompt, select 2-6 models, see results side by side
   - Progressive grid loading (results appear as each model finishes)
   - This is the killer feature for a benchmark/exploration tool

2. **Model cards with human-readable labels**
   - Each model shows: name, provider, strengths ("Best for: portraits"), speed indicator, sample outputs
   - Star/favorite models for quick access
   - Filter by capability: photorealism, illustration, video, speed

3. **AI prompt enhancement**
   - User types rough idea, AI improves it before sending to models
   - Show both original and enhanced prompt so user learns

4. **Variant grid display** (Midjourney 2x2 pattern)
   - Show 2-4 results per model in a grid
   - Hover for quick actions: save, vary, compare, download

5. **Progressive disclosure for parameters**
   - Main screen: prompt, model selector, aspect ratio, style preset
   - "Advanced" toggle reveals: seed, CFG scale, negative prompt, steps

6. **Generation progress with time estimates**
   - Show expected time before generating
   - Progress indicator per model in the comparison grid
   - Credit/cost display per generation

7. **Auto-save history with search**
   - Every generation saved automatically with prompt, model, parameters, results
   - Search by prompt text, model, date
   - Favorites and folders

### Nice-to-Have Features

8. **Style presets library** (Freepik pattern)
   - Click a style thumbnail instead of describing it
   - Categories: photorealistic, illustration, anime, vintage, etc.

9. **One-click variations** (Midjourney Vary Subtle/Strong)
   - No re-prompting needed for iterations
   - "More like this" and "Different from this" buttons

10. **Inline editing** (Leonardo Omni pattern)
    - Click a generated image, type a modification in natural language
    - "Remove the car" or "Make the sky more dramatic"

11. **Community/shared gallery**
    - See what others generated with copyable prompts and settings
    - Voting/ranking system for quality discovery

12. **Comparison annotations**
    - Side-by-side view with ability to annotate which model "won" for which criteria
    - Build a personal preference profile over time

### Interface Layout Recommendation

```
+------------------------------------------------------------------+
|  [Logo]  Models  History  Explore  Settings          [Credits: 42]|
+------------------------------------------------------------------+
|                                                                    |
|  +------------------------------+  +---------------------------+  |
|  | Prompt Input                 |  | Model Selector            |  |
|  | [AI Enhance] [Random]        |  | [ ] FLUX 1.1              |  |
|  |                              |  | [ ] Imagen 4              |  |
|  | Style: [Photo] [Art] [Anime] |  | [ ] Midjourney V8         |  |
|  | Ratio: [1:1] [16:9] [9:16]   |  | [ ] DALL-E 4              |  |
|  |                              |  | [Select All] [Clear]      |  |
|  | [Advanced v]                 |  |                           |  |
|  |                              |  | [Generate Comparison]     |  |
|  +------------------------------+  +---------------------------+  |
|                                                                    |
|  Results Grid (progressive loading)                                |
|  +-------------+  +-------------+  +-------------+                |
|  | FLUX 1.1    |  | Imagen 4    |  | MJ V8       |                |
|  | [image]     |  | [image]     |  | [image]     |                |
|  | [image]     |  | [loading...]|  | [image]     |                |
|  | 1.2s | 1cr  |  | ...         |  | 2.1s | 2cr  |                |
|  | [Save][Vary]|  |             |  | [Save][Vary] |               |
|  +-------------+  +-------------+  +-------------+                |
|                                                                    |
+------------------------------------------------------------------+
```

### Key Design Principles (from research)

1. **Refinement UX is where products win** -- Generative outputs are drafts. Make iteration effortless.
2. **Show what is happening** -- Transparent progress, not a spinner. Time estimates, credit costs, step-by-step.
3. **Translate model behavior into clear controls** -- No "CFG Scale 7.5" on the main screen. Use "Creativity: Low / Medium / High."
4. **Input scope preview** -- Show what the AI will use: "Using: your prompt + Photo style + 16:9 ratio"
5. **Error explanation** -- When generation fails, explain what happened neutrally. Never "Error 500."
6. **Automatic versioning** -- Every generation is a version. Users can always go back.
7. **Human stays in control** -- User versus AI contributions should be visually distinct.

---

## Sources

### Platform-Specific
- [Freepik AI Image Generator](https://www.freepik.com/ai/image-generator)
- [Freepik AI Docs - Image Models](https://www.freepik.com/ai/docs/image-ai-models)
- [Freepik AI Suite Review (Photutorial)](https://photutorial.com/freepik-ai-suite-review/)
- [Freepik AI Deep Dive (eesel.ai)](https://www.eesel.ai/blog/freepik-ai)
- [Runway Gen-4 Guide 2026](https://aitoolsdevpro.com/ai-tools/runway-guide/)
- [RunwayML Review 2025 (Skywork)](https://skywork.ai/blog/runwayml-review-2025-ai-video-controls-cost-comparison/)
- [Runway Academy Dashboard Guide](https://academy.runwayml.com/getting-started/dashboard-overview)
- [Runway Navigating Dashboard](https://help.runwayml.com/hc/en-us/articles/24298206897043-Navigating-Runway)
- [Kling AI 3.0 Review (Cybernews)](https://cybernews.com/ai-tools/kling-ai-review/)
- [Kling 3.0 Complete Guide](https://kling3.org/blog/kling-3-0-ai-video-generator-complete-guide)
- [Kling AI Beginner Guide (eesel.ai)](https://www.eesel.ai/blog/kling-ai)
- [Pika 2.5 Review](https://pikartai.com/pika-2-5/)
- [Pika 2.5 Democratizing AI Video](https://bonega.ai/en/blog/pika-2-5-ai-video-democratization-2025)
- [Luma Dream Machine](https://lumalabs.ai/dream-machine)
- [Luma Settings Guide](https://lumaai-help.freshdesk.com/support/solutions/articles/151000214865)
- [Luma Ray2 FAQ](https://lumalabs.ai/learning-hub/dream-machine-guide-ray2)
- [MiniMax Hailuo Video Agent](https://www.minimax.io/news/video-agent)
- [MiniMax Hailuo 2.3](https://www.minimax.io/news/minimax-hailuo-23)
- [Leonardo AI Guide 2026](https://aitoolsdevpro.com/ai-tools/leonardo-ai-guide/)
- [Leonardo Omni Editing](https://leonardo.ai/news/introducing-omni-editing/)
- [Leonardo Omni Models Help](https://intercom.help/leonardo-ai/en/articles/11483692-using-omni-models-and-the-inline-editor)
- [Midjourney Guide 2026](https://aitoolsdevpro.com/ai-tools/midjourney-guide/)
- [Midjourney Review 2026 (Revoyant)](https://www.revoyant.com/blog/midjourney-review)
- [How to Use Midjourney 2026 (Whop)](https://whop.com/blog/use-midjourney/)
- [Midjourney Web Guide (Flowith)](https://flowith.io/blog/how-to-use-midjourney-alpha-web-guide/)

### Comparison & Benchmark Tools
- [Artificial Analysis Image Lab](https://artificialanalysis.ai/image-lab)
- [Artificial Analysis Image Explorer](https://artificialanalysis.ai/image/explore)
- [Cutout.pro Model Comparison](https://www.cutout.pro/model-comparison/image-generation)
- [Arena.ai Side-by-Side](https://arena.ai/image/side-by-side)
- [FriendliAI Multimodal Comparison](https://friendli.ai/blog/compare-multimodal-ai-models)
- [Prompting Pixels Model Comparison](https://www.promptingpixels.com/ai-image-model-comparison)
- [Melies AI Image Models Comparison](https://melies.co/compare/ai-image-models)

### UX Design Patterns
- [TheFinch Design - UI/UX Strategies for Generative AI](https://thefinch.design/designing-for-creation-ui-ux-strategies-for-generative-ai-applications/)
- [The Shape of AI - UX Patterns](https://www.shapeof.ai)
- [AI UX Patterns](https://www.aiuxpatterns.com/)
- [AI Design Patterns (Training)](https://ai-design-patterns.com/)
