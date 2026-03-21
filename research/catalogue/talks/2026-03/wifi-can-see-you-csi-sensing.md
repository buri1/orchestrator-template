# Your WiFi Can See You. Here's How.

> **Bilawal Sidhu — Map the World (YouTube / Substack), 2026-03-17**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=0OdR8rRMz3I |
| Speaker | Bilawal Sidhu — creator (1.6M+ followers), TED Curator/Host, A16Z Scout, ex-Google PM for AR/VR & 3D Maps |
| Event | Map the World (YouTube channel + Substack newsletter) |
| Duration | ~15-20 min (estimated) |
| Date | 2026-03-17 |
| Topics | WiFi CSI, channel state information, wireless sensing, pose estimation, person identification, privacy, IEEE 802.11bf, physical-world sensing |

---

## Burak's Notes

> *THIS CAN BE THE FOUNDATION FOR CRAZY AGENT RELATED APPS CROSS DOMAIN INTEGRATION. This video is the explainer companion to the ESP-CSI toolkit already in our catalogue. The key insight is the capability progression: motion detection (already shipping in 30M+ homes) -> full body pose estimation through walls -> individual person identification at near 100% accuracy. The regulatory vacuum (IEEE 802.11bf explicitly excludes privacy, no jurisdiction has WiFi sensing-specific laws) means first movers define the market. For our agent vision: imagine orchestrating software agents that have physical-world awareness -- presence triggers, occupancy-aware workflow routing, health signal inputs -- all from $5 ESP32 nodes or existing consumer routers. The bridge between digital orchestration and physical sensing is here, the hardware is deployed, and nobody is building the agent integration layer yet.*

---

## Key Takeaways

1. **WiFi CSI sensing is a 3-step capability ladder, and Step 1 is already shipping** — Xfinity's "WiFi Motion" already uses CSI for presence detection in millions of homes. Step 2 (full skeletal pose estimation through walls, 92mm accuracy) and Step 3 (biometric person identification at near 100% across 197 subjects) are published research with open-source code.

2. **IEEE 802.11bf standardizes WiFi sensing, and every major chipmaker is implementing it** — Ratified September 2025, covering WiFi 6, WiFi 7, and 60 GHz bands. Qualcomm, Broadcom, MediaTek, and Intel are building standardized sensing APIs expected by 2027-2028. This makes CSI a universal infrastructure layer, not a niche hack.

3. **The privacy regulatory vacuum is total** — No jurisdiction has enacted WiFi sensing-specific laws. GDPR covers MAC tracking but not ambient sensing. The IEEE standard explicitly excludes privacy from its mandate. Radio waves cannot be encrypted. This creates both opportunity (first-mover in privacy-preserving solutions) and risk.

4. **LatentCSI maps WiFi signals directly into Stable Diffusion's latent space** — Generating 512x512 images showing person position, orientation, and pose from WiFi data alone, training 3x faster than GANs. This means WiFi can literally produce visual representations of what it "sees."

5. **The commercial ecosystem is already massive** — Origin Wireless (220+ patents, integrated into Verizon Fios), Cognitive Systems (160+ ISPs globally), ZaiNar ($1B valuation, 100 patents, $450M+ in contracts), and ABI Research projects 112 million WiFi sensing-compatible devices in North America by 2030 (51.6% CAGR).

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 6/10 | Not directly about agent orchestration, but opens the cross-domain integration Burak flagged: physical-world signals as agent inputs. The ESP32 + MQTT/HTTP path to our orchestrator is straightforward. Gov contract angle (DSGVO-friendly non-camera sensing) is strong. |
| **Actionable** | 4/10 | Requires hardware prototyping (ESP32 nodes, $5 each) and signal processing knowledge. Not actionable for current Phase 1-3 orchestration work. However, the regulatory vacuum and infrastructure maturity mean a Phase 4+ prototype is low-risk to start. The RuView open-source project provides a starting point. |

---

## Summary

Bilawal Sidhu's explainer walks through the progression of WiFi Channel State Information (CSI) from a signal optimization mechanism to a full-blown sensing platform capable of detecting movement, reconstructing body poses, and identifying specific individuals -- all through walls, without cameras, using existing router infrastructure.

The technical progression is structured in three steps. Step 1 (motion detection) is already commercial: Xfinity's "WiFi Motion" feature uses 5 GHz signal reflections for presence detection, deployed in millions of homes. Step 2 (pose estimation) has been demonstrated by CMU's DensePose from WiFi (2023), Person-in-WiFi 3D (2024, 92mm joint accuracy), and DT-Pose (2025, cross-domain). Step 3 (person identification) was achieved by WhoFi (La Sapienza, Transformer-based biometric matching) and most strikingly by Karlsruhe Institute of Technology (2025), which hit near-100% identification accuracy across 197 participants using only standard beamforming feedback -- no CSI-capable hardware required.

The infrastructure foundation is hardening rapidly. IEEE 802.11bf, ratified September 2025, standardizes WiFi sensing natively. Every major chipmaker (Qualcomm, Broadcom, MediaTek, Intel) is implementing the standard. ABI Research projects 112 million compatible devices in North America by 2030. The commercial ecosystem spans Origin Wireless (220+ patents, in Verizon Fios), Cognitive Systems (160+ ISPs), and the stealth-mode ZaiNar ($1B valuation, 100 patents, sub-nanosecond synchronization for sub-meter positioning).

The privacy implications are severe and unaddressed. Radio waves cannot be encrypted. University of Chicago researchers demonstrated "silent surveillance attacks" requiring no signal transmission and leaving no trace. WiKI-Eve achieved 88.9% keystroke identification and 65.8% password inference. The ACLU's Daniel Kahn Gillmor calls WiFi sensing "more concerning than cameras, because it can be completely invisible." Yet no jurisdiction has enacted WiFi sensing-specific laws, IEEE 802.11bf explicitly excludes privacy from its mandate, and ISPs can activate sensing features remotely on existing hardware.

The connection to our agent architecture is the cross-domain bridge: WiFi CSI provides a privacy-preserving (no images), low-cost ($5/node), through-wall sensing layer that can feed physical-world events (presence, activity, identity) into software agent pipelines via standard protocols (MQTT, HTTP, WebSocket). The ESP-CSI toolkit already in our catalogue provides the hardware implementation; this talk provides the capability roadmap and commercial context.

---

## Notable Quotes

> "Radio waves cannot be encrypted" — explaining why WiFi sensing is fundamentally different from camera surveillance: there is no physical countermeasure.

> "Wi-Fi sensing is more concerning than cameras, because it can be completely invisible. You can spot a nanny cam if you know what to look for. But if you are not the person in charge of the router, there is no way to know if someone's smart lightbulbs are monitoring you." — Daniel Kahn Gillmor, ACLU

> "Once it's everywhere, we don't get to un-deploy it." — on the infrastructure permanence of WiFi sensing capabilities

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/ruvnet/RuView | WiFi DensePose open-source implementation; 37K+ stars; signal processing + presence detection + pose estimation | `/tool-catalogue` |
| https://github.com/euaziel/WiFi-CSI-Human-Pose-Detection | Human pose estimation using WiFi CSI and deep learning; camera-free sensing through walls | `/tool-catalogue` |
| https://arxiv.org/abs/2401.17417 | Through-Wall Imaging based on WiFi CSI — academic paper with technical depth | `/ingest-article` |
| https://coffee.link/your-wifi-can-see-you/ | Comprehensive companion article with LatentCSI details, WiKI-Eve attack analysis, full regulatory landscape | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| ESP-CSI (Espressif) | ESP32 hardware platform for WiFi CSI sensing; the implementation layer for all capabilities discussed | Yes — [esp-csi](../../infrastructure/esp-csi.md) |
| RuView | Open-source WiFi DensePose; 37K+ stars; signal processing + presence detection | No — consider `/tool-catalogue` |
| ESPectre | CSI + Home Assistant integration for smart home | Mentioned in [esp-csi](../../infrastructure/esp-csi.md) |
| LatentCSI | Maps WiFi signals into Stable Diffusion latent space for 512x512 image generation | No — research project |
| WiKI-Eve | Keystroke inference attack via WiFi (88.9% accuracy) | No — research project |
| WhoFi | Transformer-based biometric person identification from WiFi signals | No — research project |
| Person-in-WiFi 3D | Multi-person 3D pose estimation (92mm accuracy) | No — research project |
| DensePose from WiFi (CMU) | Full body pose reconstruction through walls | No — research project |
| WiFlexFormer | 98.4% HAR accuracy with 50K parameters, 10ms inference | No — research project |
| Origin Wireless | 220+ patents, integrated into Verizon Fios routers | No — commercial |
| Cognitive Systems | WiFi Motion deployed through 160+ ISPs globally | No — commercial |
| ZaiNar | $1B valuation, sub-nanosecond WiFi/5G synchronization, 100 patents | No — commercial |
| Anduril (Pulsar) | AI-powered electromagnetic warfare; passive RF sensing + autonomous electronic attacks | No — defense/commercial |
| HawkEye 360 | 30+ satellites detecting/geolocating RF emitters globally | No — defense/commercial |

---

## Action Items

- [ ] Cross-reference with existing [ESP-CSI catalogue entry](../../infrastructure/esp-csi.md) — update with IEEE 802.11bf standardization info and commercial ecosystem data
- [ ] Evaluate RuView (37K+ stars) as a higher-level starting point vs raw ESP-CSI for prototyping
- [ ] Research ZaiNar's sub-nanosecond synchronization approach for potential positioning applications
- [ ] Track IEEE 802.11bf chipmaker implementations (Qualcomm, Broadcom, MediaTek, Intel) — standardized APIs expected 2027-2028
- [ ] Phase 4+ prototype: ESP32 presence detection -> MQTT -> orchestrator event pipeline (physical-world agent triggers)
- [ ] Investigate privacy-preserving sensing as a DSGVO-compliant offering for gov contracts (non-camera alternative)
