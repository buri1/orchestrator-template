# WiFi Can See You — WiFi CSI Sensing for Smart Home

> **Source**: https://www.youtube.com/watch?v=0OdR8rRMz3I
> **Bookmarked**: 2026-04 (from Chrome LLM-INGEST)
> **Category**: IoT

## What Is This

A video explaining WiFi Channel State Information (CSI) sensing technology. WiFi routers constantly emit radio waves that bounce off everything in a room -- walls, furniture, and human bodies. By analyzing how these signals are distorted (the CSI data), software can detect motion, track people, estimate poses, and even identify individuals through biometric signatures like height, gait, and body mass -- all without cameras, through walls, in the dark. Xfinity already ships this as "WiFi Motion" to customers. The cheapest way to experiment is with an ESP32 microcontroller using Espressif's official `esp-csi` toolkit on GitHub.

Original bookmark note: "THIS CAN BE USED FOR SMART HOME"

## Why It Was Skipped

Not directly related to AI agent orchestration research. Filed under general interest.

## Potential Connections

- WiFi CSI sensing could serve as an IoT data source feeding into agent systems for ambient home intelligence (presence detection, occupancy, activity recognition)
- ESP32-based CSI sensors are cheap enough to deploy as edge data collectors in an agent-managed smart home
- The privacy implications (seeing through walls without consent) are relevant to agent ethics and data governance discussions
