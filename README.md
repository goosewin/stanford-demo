## Stanford Voice AI Workshop – Student Setup Guide

Welcome! This guide was written specifically for Stanford GSB students who may have little or no prior programming experience. Follow each step in the order listed. Treat it like a cookbook—complete one step, check that it worked, and then move to the next.

---

## 1. What You Will Do

- Install a small tool (called **Bun**) that runs the project
- Download the workshop project to your computer
- Add two “keys” from the Vapi website so the voice assistant knows which account to use
- Start the demo and run a real-time voice AI conversation in your browser

Time estimate: 20–30 minutes if you proceed carefully.

---

## 2. Before You Begin

- **Computer:** Mac or Windows with a microphone and speakers or headphones
- **Internet connection:** required for downloads and the live call
- **Optional but recommended:** Create a free account at [https://vapi.ai](https://vapi.ai) so you can copy your API keys in advance. (You can still follow along during the workshop if you wait until then.)

---

## 3. Install Bun (Required Tool)

Bun is the tool we use to run the project. Install it once; you do not need to repeat this in future sessions.

### If You Use macOS
1. Press `Command (⌘) + Space` to open **Spotlight Search**.
2. Type `Terminal` and press **Enter**. A window with a black or white background appears—this is the Terminal.
3. Copy the command below, paste it into Terminal, and press **Enter**:

   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

4. When the installation completes, close the Terminal window.
5. Reopen Terminal (repeat steps 1–2). Type `bun --version` and press **Enter**. Seeing a version number means Bun is ready.

### If You Use Windows
1. Click the **Start** menu, type `PowerShell`, right-click **Windows PowerShell**, and choose **Run as administrator**.
2. Copy the command below, paste it into PowerShell, and press **Enter**:

   ```powershell
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```

3. Close PowerShell after the installation finishes.
4. Open a fresh PowerShell window (normal permissions). Type `bun --version` and press **Enter**. A version number means Bun is ready.

If you see an error, repeat the steps carefully. Still stuck? Ask the teaching staff during the session.

---

## 4. Download the Project Files

You do **not** need Git for this workshop. Download a ZIP file instead.

1. Visit the GitHub repository your instructor shared (for example, `https://github.com/YOUR-REPO/stanford-demo`).
2. Click the green **Code** button.
3. Select **Download ZIP**. The file will save to your computer.
4. Locate the downloaded ZIP (usually in **Downloads**).
5. Double-click the ZIP to unzip it. A folder named `stanford-demo-main` (or similar) appears.
6. Move that folder to a place that is easy to find, such as your **Desktop** or **Documents** folder.

Remember the location—you will navigate to it shortly.

---

## 5. Open a Terminal or PowerShell Window in the Project Folder

We need to run commands inside the project folder.

### macOS
1. Open **Terminal** (see Step 3).
2. Type `cd ` (letters `c` and `d`, followed by a space).
3. Drag the `stanford-demo-main` folder from Finder into the Terminal window. The folder path will appear automatically.
4. Press **Enter**. The prompt now shows you are in the project folder.

### Windows
1. Open **PowerShell** (search for “PowerShell” in the Start menu).
2. Type `cd ` (letters `c` and `d`, followed by a space).
3. Drag the `stanford-demo-main` folder from File Explorer into the PowerShell window. The path appears automatically.
4. Press **Enter**. You are now inside the project folder.

---

## 6. Install Project Dependencies

Dependencies are supporting pieces of software the project needs.

1. Confirm your Terminal/PowerShell prompt shows the project folder path.
2. Run this command and press **Enter**:

   ```bash
   bun install
   ```

3. Wait until the command finishes. It may take a couple of minutes the first time.

---

## 7. Create Your `.env.local` File (Adds Vapi Keys)

This file tells the project which Vapi account and assistant to use.

1. Log in to [https://vapi.ai](https://vapi.ai).
2. Copy your **Public Key** (starts with `pk_`).
3. Identify the assistant you want to use and copy its **Assistant ID** (starts with `asst_`).
4. On your computer, open the `stanford-demo-main` folder.
5. Create a file named `.env.local`:
   - **macOS:** Right-click → **New Document** (or use TextEdit) → name it `.env.local`. If asked to confirm the dot, choose “Use .env.local”.
   - **Windows:** Right-click → **New** → **Text Document** → name it `.env.local`. Accept the warning about the file extension.
6. Open `.env.local` in a simple text editor (TextEdit on Mac, Notepad on Windows). Paste the two lines below, replacing the example values with your real keys:

   ```
   NEXT_PUBLIC_VAPI_PUBLIC_KEY=pk_yourPublicKeyGoesHere
   NEXT_PUBLIC_VAPI_ASSISTANT_ID=asst_yourAssistantIdGoesHere
   ```

7. Save the file and close the editor.

If you do not yet have keys, leave the file blank for now. The app will display a reminder until you add them.

---

## 8. Start the Voice AI Demo

1. In the Terminal/PowerShell window that is inside the project folder, run:

   ```bash
   bun dev
   ```

2. Leave this window open. It will show live logs from the app.
3. When you see the message `ready - started server on http://localhost:3000`, open your web browser.
4. Visit [http://localhost:3000](http://localhost:3000). You should see the workshop dashboard with call controls, transcript, and setup tips.

---

## 9. Use the Demo During the Workshop

- Click **Start Call** to begin. Allow the browser to use your microphone when prompted.
- Speak naturally; the transcript will scroll automatically as the conversation progresses.
- Click **End Call** to finish the conversation.
- If the page shows “Missing Vapi credentials,” revisit Step 7 to verify your keys, then refresh the page.
- The volume slider reflects the assistant’s audio activity in real time.

Move at your own pace. If you fall behind, return to the latest step that worked and continue from there.

---

## 10. Common Issues & Fixes

| Problem | Likely Fix |
| --- | --- |
| `bun: command not found` | Bun was not installed. Repeat Step 3, then open a fresh Terminal/PowerShell window. |
| `bun dev` says “port 3000 already in use” | Another app is running on that port. Close other development servers and run `bun dev` again. |
| Browser blocks microphone access | Click the padlock icon near the address bar, allow microphone access, and reload the page. |
| Page still shows “Missing Vapi credentials” | Open `.env.local`, check for typos, save, and refresh the page. |
| Audio is silent | Confirm your computer volume, headphone connection, and the assistant’s voice settings in Vapi Studio. |

Write down any error messages and ask the teaching team if you need help.

---

## 11. After the Workshop

- To stop the server, return to the Terminal/PowerShell window running `bun dev` and press `Ctrl + C`.
- To restart on another day, repeat Steps 5 (open the folder) and 8 (run `bun dev`). Steps 6 and 7 only need to be repeated if you change dependencies or keys.
- Experiment with the UI or the Vapi configuration to explore new Voice AI ideas.

You now have a working Voice AI playground. Enjoy building on top of it, and reach out to the workshop instructor if you run into anything unexpected.
