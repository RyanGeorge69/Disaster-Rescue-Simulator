Disaster Rescue Simulator 🚨
A web-based, 3D interactive educational simulator built with A-Frame (WebXR) and vanilla JavaScript. Players navigate through three high-stakes emergency scenarios—an Earthquake, a Flood, and a Building Fire—to practice search-and-rescue protocols, gather emergency equipment, navigate environmental hazards, and make critical real-life safety decisions.

Deployment
https://ryangeorge69.github.io/Disaster-Rescue-Simulator/

Features
•	3 Immersive Stages:
      •	Earthquake Rescue: Navigate collapsed structures, falling rubble, and electrical hazards.
      •	Flood Rescue: Operate a rescue boat over rising floodwaters and avoid swift currents.
      •	Building Fire: Evacuate smoke-filled hallways, navigate around active flames, and find alternate exits.
•	Interactive Gameplay:
      •	Use first-person controls (WASD + Mouse Look) to search for survivors, collect emergency gear (First Aid Kits, Life Jackets, Radios), and reach designated evacuation zones.
•	Real-Life Safety Decisions:
      •	Interactive scenario prompts test proper disaster protocols (e.g., Drop, Cover, and Hold On vs. running outside).
•	Dynamic Scoring & HUD:
      •	Real-time tracking of time remaining, score modifiers, equipment collected, hazards avoided, and safety ratings.
•	Built-in Safety Guide:
      •	Comprehensive reference modal detailing actual emergency best practices for earthquakes, floods, and building fires.


Tech Stack
      •	HTML5 / CSS3: Responsive HUD, styled menus, modal overlays, and crosshair UI.
      •	JavaScript (ES6+): Core game loops, distance math, state handlers, and stage controllers.
      •	A-Frame (v1.8.0): WebXR framework powering the 3D world, camera rigs, lighting, and primitive geometry rendering.


Getting Started
No complex build steps or package managers (like npm/yarn) are required!
1.	Clone or download this repository to your local machine.
2.	Ensure all project files are in the same directory:
    • index.html (Main markup, A-Frame scene, styles, and core game scripts)
    • script.js (Stage management and game logic loops)
    • style.css (UI styling layers)
3.	Open index.html directly in any modern web browser (Chrome, Firefox, Edge, Safari), or serve it via a local static server (e.g., Live Server extension in VS Code).
    Controls


Action	Control Key / Input
Move	              W, A, S, D
Look                Around MOUSE (Click to lock pointer)
Rescue / Collect	  Press E or Click RESCUE button when nearby
Safety Guide	      Click 📘 REAL-LIFE SAFETY GUIDE button

