# ⌨️ TypeFree — Type Anything

> A modern, Monkeytype-inspired typing experience where **you type whatever you want** — and the system judges you.

No predefined words.
No boring scripts.
Just raw typing + real-time analysis.

---

## ✨ Features

### 🧠 Free Typing Engine

* Type literally **anything**
* No forced word lists
* Natural typing experience

---

### 📚 Smart Dictionary Validation

* Uses a **~370,000 word English dictionary**
* Automatically detects:

  * ✅ Real words
  * ❌ Gibberish
* Supports:

  * contractions (`don't`, `it's`)
  * possessives (`john's`)
  * modern/tech terms (`api`, `frontend`, `docker`)

---

### ⚡ Real-Time Stats

* **WPM (Words Per Minute)**
* **Accuracy (%)**
* **Word count**
* **Valid / Invalid words**
* **Character count**

All updated live as you type.

---

### 🎯 Intelligent WPM Calculation

```
WPM = (valid characters / 5) / minutes
```

✔ Only **valid words count**
✔ Optional: ignores repeated words
✔ More realistic measurement

---

### 🎨 Visual Word Feedback

Each word is styled dynamically:

| State           | Meaning      |
| --------------- | ------------ |
| Bright          | Current word |
| Normal          | Valid word   |
| Red + underline | Invalid word |

---

### ⏱️ Timer Modes

* ∞ Free mode
* 30 seconds
* 60 seconds
* 120 seconds

Auto-stops and shows results.

---

### 📊 WPM Graph

* Real-time WPM tracking
* Smooth canvas-based rendering
* Peak WPM display

---

### 🧾 Session Results Screen

After finishing:

* Final WPM
* Accuracy
* Time
* Total words
* Valid vs Invalid

---

### 🧩 Whitelist System

Add custom words like:

```
bruh, lol, fwiw
```

These will always be treated as **valid**.

---

### ⚙️ Elite Settings Panel

A full UI customization system:

* 🎨 Colors (accent, background, etc.)
* 🔤 Fonts
* 🔊 Sound presets
* 🎛 UI tuning

---

## 🏗️ How It Works

### 1. Dictionary Loading

```js
loadDictionary()
```

* Fetches word list from GitHub
* Streams it progressively
* Shows loading progress bar
* Falls back to a smaller built-in dictionary if offline

---

### 2. Input Handling

```js
typeInput.addEventListener('input', onInput)
```

* Starts session automatically
* Processes text in real time
* Updates UI instantly

---

### 3. Word Parsing

```js
const tokens = raw.match(/\S+|\s+/g)
```

* Splits input into:

  * words
  * spaces
* Keeps spacing intact for accurate rendering

---

### 4. Word Validation

```js
isValidWord(word)
```

Checks:

* Dictionary match
* Contractions
* Possessives
* Whitelist

---

### 5. Rendering System

```js
renderWords()
```

* Converts typed text into styled HTML
* Applies classes:

  * `.valid`
  * `.invalid`
  * `.current`

---

### 6. WPM Calculation

```js
calcWPM()
```

* Counts only **completed valid words**
* Converts chars → words
* Divides by elapsed time

---

### 7. Accuracy Calculation

```js
accuracy = valid_words / total_words
```

* Ignores incomplete words
* Updates live

---

### 8. Timer System

```js
setInterval(...)
```

* Updates:

  * time
  * WPM
  * graph
* Stops automatically if timer is set

---

### 9. Graph Rendering

```js
canvas.getContext('2d')
```

* Draws WPM over time
* Lightweight & smooth
* No external libraries

---

### 10. Session Control

```js
startSession()
stopSession()
resetSession()
```

Handles:

* lifecycle
* UI transitions
* result calculations

---

## 🎨 UI Design Philosophy

* Dark, minimal aesthetic
* Soft neon accent
* Mono + modern font pairing
* Zero distractions

---

## 📁 Project Structure

```
typefree.html
├── HTML (structure)
├── CSS (styling + animations)
└── JS (logic engine)
```

Single-file architecture for simplicity.

---

## 🚀 Why This Exists

Most typing sites:

* force predefined words
* measure memorization, not typing

**TypeFree flips that:**

> “Type what you actually think — and get judged for it.”

---

## 🛠️ Future Ideas

* Multiplayer typing
* Save history / stats
* AI-based grammar scoring
* Custom dictionaries
* Export results

---

## ❤️ Credits

Made with AI energy by
**Prantik**

---

## ⚠️ Disclaimer

This tool judges your typing based on:

* dictionary validity

Not grammar or context.

So yeah…
You *can* type nonsense — it just won’t like you for it 😭

---

## ⭐ If You Like This

Drop a star on GitHub.
Or don’t. I’ll still judge your typing.
