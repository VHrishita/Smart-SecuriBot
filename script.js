const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function appendMessage(message, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add(sender === "bot" ? "bot-msg" : "user-msg");
  msgDiv.innerHTML = message;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator() {
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("bot-msg");
  typingDiv.id = "typing";
  typingDiv.textContent = "Bot is typing...";
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
  const typingDiv = document.getElementById("typing");
  if (typingDiv) typingDiv.remove();
}

function botTypeMessage(message) {
  return new Promise((resolve) => {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("bot-msg");
    msgDiv.innerHTML = message;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    resolve();
  });
}

function simulateDFA(password) {
  let states = { upper: false, lower: false, digit: false, special: false };
  let transitions = [];

  for (let ch of password) {
    if (/[A-Z]/.test(ch) && !states.upper) {
      states.upper = true;
      transitions.push("→ q1 (uppercase found)");
    } else if (/[a-z]/.test(ch) && !states.lower) {
      states.lower = true;
      transitions.push("→ q2 (lowercase found)");
    } else if (/[0-9]/.test(ch) && !states.digit) {
      states.digit = true;
      transitions.push("→ q3 (digit found)");
    } else if (/[@$!%*?&]/.test(ch) && !states.special) {
      states.special = true;
      transitions.push("→ q4 (special found)");
    }
  }

  const allGood = Object.values(states).every((v) => v);
  transitions.push(
    allGood ? "✅ q_final (accepting state reached)" : "❌ Did not reach q_final"
  );

  return { transitions, accepted: allGood };
}

function checkStrength(password) {
  const regex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (password.length < 8) return "Password too short (min 8 chars)";
  if (!/[A-Z]/.test(password)) return "Add at least one uppercase letter";
  if (!/[a-z]/.test(password)) return "Add at least one lowercase letter";
  if (!/[0-9]/.test(password)) return "Add at least one number";
  if (!/[@$!%*?&]/.test(password)) return "Add a special character (@$!%*?&)";
  if (!regex.test(password)) return "Needs better structure.";
  return "Strong password!";
}

let reassuranceIndex = 0;
const reassuranceMessages = [
  "🛡️ Totally safe! I don’t store or send your password anywhere — everything runs right here in your browser.",
  "🔒 You’re all good! No data ever leaves your device. It’s just between you and me 🤫",
  "✅ 100% private! This tool works locally — your info never touches the internet."
];

const greetings = [
  "Hey there 👋! I’m your Security Assistant. Want me to check a password for you?",
  "Hiya 😄! Ready to test your password strength?",
  "Hello friend 🤖! Let’s see how strong your password is today!"
];

const farewells = [
  "Goodbye! Stay safe and use strong passwords 💪",
  "See you later! Keep your credentials secure 🔐",
  "Bye 👋 — may your passwords always be uncrackable 🧠"
];

async function sendMessage() {
  const msg = userInput.value.trim();
  if (!msg) return;

  appendMessage(msg, "user");
  userInput.value = "";

  const lowerMsg = msg.toLowerCase();

  if (["hello", "hey"].some((w) => lowerMsg.includes(w))) {
    showTypingIndicator();
    await new Promise((r) => setTimeout(r, 700));
    removeTypingIndicator();
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    await botTypeMessage(randomGreeting);
    return;
  }

  if (["bye", "thank you", "goodbye", "see you", "later"].some((w) => lowerMsg.includes(w))) {
    showTypingIndicator();
    await new Promise((r) => setTimeout(r, 700));
    removeTypingIndicator();
    const randomFarewell = farewells[Math.floor(Math.random() * farewells.length)];
    await botTypeMessage(randomFarewell);
    return;
  }

  if (
    lowerMsg.includes("safe") ||
    lowerMsg.includes("save") ||
    lowerMsg.includes("private") ||
    lowerMsg.includes("secure") ||
    lowerMsg.includes("hack") ||
    lowerMsg.includes("password")
  ) {
    showTypingIndicator();
    await new Promise((r) => setTimeout(r, 1000));
    removeTypingIndicator();

    await botTypeMessage(reassuranceMessages[reassuranceIndex]);
    reassuranceIndex = (reassuranceIndex + 1) % reassuranceMessages.length;
    return;
  }

  showTypingIndicator();
  await new Promise((r) => setTimeout(r, 800));
  removeTypingIndicator();

  await botTypeMessage("Let me scan through automata states... 🔍");

  const { transitions, accepted } = simulateDFA(msg);

  for (const t of transitions) {
    await new Promise((r) => setTimeout(r, 350));
    await botTypeMessage(t);
  }

  const result = checkStrength(msg);
  await botTypeMessage((accepted ? "✅ " : "❌ ") + result);

  if (accepted)
    await botTypeMessage(
      "All states passed! You’re officially a cybersecurity ninja 😁"
    );
  else await botTypeMessage("Hmmm… my DFA says no! Try again 💪");
}
