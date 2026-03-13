# Starlight - Complete Electron implementation Guide

This documentation covers the full lifecycle of the Starlight Electron application, from environment setup to production builds.

---

## 1. Environment Setup

### Prerequisites
* **Node.js**: Ensure the latest LTS version is installed.
* **Terminal**: Use PowerShell or Command Prompt within the project root.

### Initializing the Project
If you don't already have electron and electron builder installed, you will need that first.

```powershell
npm install electron --save-dev
npm install electron-builder --save-dev
```
### Building the project
To create an installer executable, run `npm run dist`

To create the project folder without the installer, run `npm run build`

To start Starlight without a project folder, run `npm start`