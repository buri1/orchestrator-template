# ESP-CSI

> **Applications based on Wi-Fi CSI (Channel State Information), such as indoor positioning, human detection, and non-contact intelligent sensing on ESP32 hardware.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Repository | [espressif/esp-csi](https://github.com/espressif/esp-csi) |
| GitHub Stars | 1,141 (as of 2026-03-14) |
| Publisher | Espressif Systems — bigtech (NASDAQ-listed IoT chipmaker, creators of ESP32) |
| License | Apache-2.0 |
| Tech Stack | C (ESP-IDF), Shell (tooling), Python (analysis scripts) |
| Maturity | 🟢 Production (maintained since Feb 2021, active updates, full ESP32 series support) |
| Last Analyzed | 2026-03-14 |

---

## Burak's Notes

> *THIS CAN BE THE FOUNDATION FOR CRAZY AGENT RELATED APPS CROSS DOMAIN INTEGRATION. WiFi CSI = passive sensing of physical environments (motion detection, breathing detection, indoor positioning) using nothing but commodity ESP32 chips and existing WiFi routers. Imagine an agent that orchestrates both digital tasks AND has awareness of the physical environment — presence detection to trigger workflows, occupancy-aware office automation, health monitoring as agent input signals. The hardware is $3-5 per node. This is the bridge between software agents and physical world sensing without cameras or wearables.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Not directly related to code orchestration, but opens an entirely new dimension: physical-world awareness as agent input. Cross-domain integration potential is high for IoT/smart environment business lines. |
| **Novelty** | 9/10 | Nothing else in our catalogue touches physical-world sensing. WiFi CSI is a fundamentally different signal source — non-contact, privacy-preserving (no cameras), works through walls. |
| **Actionable** | 3/10 | Requires hardware (ESP32 boards), embedded C development, and signal processing expertise. Not actionable for current orchestration work, but low barrier to prototype ($5 per node). |

---

## Overview

ESP-CSI is Espressif's official toolkit for building applications on WiFi Channel State Information — a technique that extracts fine-grained signal characteristics (amplitude, phase, delay) from standard WiFi transmissions to detect physical changes in the environment. Unlike RSSI (simple signal strength), CSI provides per-subcarrier channel response data that can detect not just large movements (walking, running) but subtle actions like breathing and chewing in a static environment.

The library supports the full ESP32 family (ESP32, ESP32-S2, ESP32-C3, ESP32-S3, ESP32-C5, ESP32-C6, ESP32-C61) and provides three deployment topologies: router-based (single ESP32 + existing router), device-to-device (two ESP32s communicating via router), and broadcast-based (dedicated sender + multiple receivers for highest accuracy). The ESP32's dual-core 240MHz CPU with AI instruction sets enables on-device machine learning and neural network inference on the CSI data.

Key capabilities include indoor positioning, human activity detection (walking, sitting, falling), presence/absence detection, gesture recognition, and environmental monitoring. The toolkit provides get-started examples, an esp-radar application with RainMaker cloud integration, and Python analysis scripts. Community projects like ESPectre have already integrated CSI with Home Assistant for smart home scenarios.

---

## Technical Architecture

### Three Deployment Topologies

```
1. Router CSI:      ESP32 ←→ Router (Ping/Reply)
   - Simplest: 1 ESP32 + existing router
   - Depends on router location/protocol

2. Device CSI:      ESP32-A ←→ Router ←→ ESP32-B
   - Supplements topology 1
   - Independent of router position

3. Broadcast CSI:   Sender → ESP32-A, ESP32-B, ESP32-C
   - Highest accuracy (dedicated packet sender)
   - Best for multi-device cluster positioning
   - Minimal network interference
```

### Signal Processing Pipeline

```
WiFi Packets → CSI Extraction (per-subcarrier) →
  Signal Processing (filtering, calibration) →
    Feature Extraction (amplitude, phase, delay) →
      ML/Neural Network (on-device, 240MHz dual-core) →
        Application Output (presence, position, activity)
```

### Hardware Capabilities
- **CPU**: Dual-core 240MHz with AI instruction sets
- **Connectivity**: WiFi + BLE (BLE assists detection via device scanning)
- **CSI Data**: RSSI, RF noise floor, reception time, antenna rx_ctrl field
- **OTA**: Existing deployments upgradable via software without hardware changes
- **Antenna**: External IPEX antenna recommended over PCB for better directional coverage

---

## Publisher Background

**Espressif Systems** is a publicly traded (Shanghai Stock Exchange) semiconductor company headquartered in Shanghai, China. They are the global leader in WiFi MCU chips, with the ESP32 family being the dominant platform for IoT development worldwide. ESP-IDF (their development framework) has a massive developer ecosystem. They maintain the CSI toolkit as part of their strategy to expand ESP32 use cases beyond traditional IoT connectivity into intelligent sensing applications.

---

## What's Valuable for Us

1. **Physical-World Agent Inputs**: CSI data could serve as a real-time signal source for agents that need awareness of the physical environment. Use cases: auto-pausing agent workflows when the user leaves the room, triggering review workflows when someone approaches the workstation, presence-based security (lock agents when unoccupied).

2. **Cross-Domain Integration Pattern**: The ESP32 can connect to any backend via WiFi/MQTT/HTTP. An agent could subscribe to CSI-derived events (occupancy changes, activity classifications) as just another data source alongside GitHub webhooks, Slack messages, etc.

3. **Privacy-Preserving Sensing**: Unlike cameras, CSI detects presence and activity through radio waves — no images captured. This is significant for DSGVO compliance in gov/enterprise contexts where camera-based monitoring faces strict restrictions.

4. **Low-Cost Deployment**: ESP32 dev boards cost $3-5. A multi-node mesh for an entire office could be deployed for under $50, making it accessible for prototyping cross-domain agent scenarios.

5. **On-Device ML**: The ESP32's AI instruction sets mean classification can happen locally without sending raw CSI data to a cloud service, further strengthening the privacy story.

---

## What's NOT Relevant

1. **Embedded C Development**: The ESP-IDF ecosystem is C-based, which is completely outside our TypeScript/Shell orchestration stack. Integration would require either a dedicated embedded developer or using community projects that expose CSI data via APIs.

2. **Hardware Dependency**: Requires physical ESP32 boards, which adds logistics and maintenance overhead. Our current architecture is purely software.

3. **Signal Processing Expertise**: Raw CSI data requires domain knowledge in signal processing and wireless channel theory to extract meaningful features. The provided Python scripts help but are basic.

4. **No Direct Orchestration Relevance**: This does not help with code generation, agent coordination, or any of our Phase 1-3 priorities. It's a Phase 4+ exploration.

---

## Future Use Cases

- **Phase 1-3 (Days 1-90)**: No action. Focus remains on software orchestration.
- **Phase 4 (Days 90+)**: Prototype a "physical awareness" extension for the orchestrator — ESP32 nodes detect office occupancy and feed events into the agent pipeline. Use cases: auto-lock agents when user leaves, ambient status display (LED strips showing agent health), meeting room detection for auto-scheduling.
- **SaaS Factory**: Smart office/smart home products built on ESP-CSI could be a rapid SaaS factory launch candidate. The sensing capabilities (presence, activity, positioning) map to high-value verticals: elderly care monitoring, retail analytics, workplace optimization.
- **Gov Contracts**: Non-camera presence detection for government buildings (BSI-compliant, DSGVO-friendly). CSI-based occupancy monitoring as a compliance-friendly alternative to camera surveillance.

---

## Key Takeaway

> **ESP-CSI turns $5 WiFi chips into non-contact environmental sensors (presence, motion, breathing, positioning) that could give software agents physical-world awareness — a genuinely novel cross-domain integration opportunity for Phase 4+, especially in DSGVO-sensitive gov contexts where camera alternatives are needed.**
