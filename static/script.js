const API_BASE = "http://localhost:8000";

const chatBox = document.getElementById("chatBox");
const questionInput = document.getElementById("question");
const sendBtn = document.querySelector(".send-btn");


/* ==========================================================================
   1. PDF UPLOAD SYSTEM
   ========================================================================== */
async function uploadPDF() {
    const fileInput = document.getElementById("pdfUpload");

    // Clear previous logs to prevent clutter
    chatBox.innerHTML = "";

    if (!fileInput.files.length) {
        addMessage("Please select a PDF file first.", "msg-system");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    addMessage("Uploading and processing PDF...", "msg-system");

    try {
        const response = await fetch(`${API_BASE}/upload`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("Upload failed");

        addMessage("✅ PDF processed successfully! You can now ask questions.", "msg-system");

    } catch (error) {
        console.error("Upload error:", error);
        addMessage("✕ Error uploading PDF. Check backend server.", "msg-error");
    }
}

/* ==========================================================================
   2. INTERACTIVE CHAT TRANSMISSION
   ========================================================================== */
async function sendMessage() {
    const question = questionInput.value.trim();
    const level = document.getElementById("level").value;

    if (!question) return;

    // Separate user question cleanly using msg-user block
    addMessage(question, "msg-user");
    questionInput.value = "";

    setLoading(true);
    const typingIndicator = addTypingIndicator();

    try {
        const response = await fetch(`${API_BASE}/ask`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question, level })
        });

        if (!response.ok) throw new Error("Server error");

        const data = await response.json();
        removeTypingIndicator(typingIndicator);

        const answer = data.answer || {};
        let html = "";

        // Main Idea
        if (answer.main_idea) {
            html += `
                <div class="section" style="margin-bottom: 14px;">
                    <strong style="font-family: var(--font-serif); display: block; margin-bottom: 4px;">📌 Main Idea</strong>
                    <p>${answer.main_idea}</p>
                </div>
            `;
        }

        // Key Concepts
        if (answer.key_concepts && Array.isArray(answer.key_concepts)) {
            const conceptsHTML = answer.key_concepts.map(c => {
                if (typeof c === "string") {
                    return `<li style="margin-bottom: 4px;">${c}</li>`;
                } else {
                    return `<li style="margin-bottom: 4px;"><strong>${c.concept || c.term || "N/A"}:</strong> ${c.explanation || "Not available"}</li>`;
                }
            }).join("");
            html += `
                <div class="section" style="margin-bottom: 14px;">
                    <strong style="font-family: var(--font-serif); display: block; margin-bottom: 4px;">💡 Key Concepts</strong>
                    <ul style="padding-left: 20px;">${conceptsHTML}</ul>
                </div>
            `;
        }

        // Equations Explained
        if (answer.equations_explained) {
            html += `
                <div class="section" style="margin-bottom: 14px;">
                    <strong style="font-family: var(--font-serif); display: block; margin-bottom: 4px;">🧮 Equations Explained</strong>
                    <p>${answer.equations_explained}</p>
                </div>
            `;
        }

        // Real World Example
        if (answer.real_world_example) {
            html += `
                <div class="section" style="margin-bottom: 14px;">
                    <strong style="font-family: var(--font-serif); display: block; margin-bottom: 4px;">🌎 Real World Example</strong>
                    <p>${answer.real_world_example}</p>
                </div>
            `;
        }

        // Simple Summary
        if (answer.simple_summary) {
            html += `
                <div class="section">
                    <strong style="font-family: var(--font-serif); display: block; margin-bottom: 4px;">📝 Simple Summary</strong>
                    <p>${answer.simple_summary}</p>
                </div>
            `;
        }

        // Fallback layout block
        if (!html) {
            html = `<pre style="white-space: pre-wrap; font-family: monospace;">${answer.raw_response ? answer.raw_response : JSON.stringify(answer, null, 2)}</pre>`;
        }

        addMessage(html, "msg-system", true);

    } catch (error) {
        removeTypingIndicator(typingIndicator);
        addMessage("✕ Error getting response. Make sure backend is running.", "msg-error");
        console.error(error);
    }

    setLoading(false);
}

/* ==========================================================================
   3. CLEAN LOG APPENDER (Solves Text Clumping)
   ========================================================================== */
function addMessage(content, statusClass, isHTML = false) {
    const div = document.createElement("div");
    
    // Applies both the parent bubble definition block and specific styling type
    div.className = `msg-bubble ${statusClass}`;

    if (isHTML) {
        div.innerHTML = content;
    } else {
        div.innerText = content;
    }

    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;

    return div;
}

function addTypingIndicator() {
    const div = document.createElement("div");
    div.className = "msg-bubble msg-system typing";
    div.innerText = "Typing...";
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return div;
}

function removeTypingIndicator(element) {
    if (element) element.remove();
}


/* ==========================================================================
   4. INTERFACE HELPER EVENTS
   ========================================================================== */
function setLoading(isLoading) {
    sendBtn.disabled = isLoading;
    sendBtn.style.opacity = isLoading ? "0.4" : "1";
}

questionInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }
});