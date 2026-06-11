# AudioMesh

AudioMesh is a hardware-agnostic audio-networking application that turns nearby computers, smartphones, and tablets into a synchronized, unified speaker system using local Wi-Fi and Bluetooth protocols.

## Monorepo Structure

- `apps/desktop/`: Electron desktop application wrapper.
- `apps/mobile/`: Tauri mobile application wrapper for iOS and Android.
- `apps/web/`: Web landing page and documentation viewer.
- `apps/server/`: Local gateway daemon (written in Rust) managing network routing, audio buffer queues, and peer-to-device synchronization.
- `shared/common/`: Common presentation components, SVGs, and locale assets.
- `shared/client-common/`: Shared client store (Zustand), providers, and views.

## Getting Started

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Run development servers:
   ```bash
   yarn dev
   ```

3. Run test suites:
   ```bash
   yarn test:all
   ```
