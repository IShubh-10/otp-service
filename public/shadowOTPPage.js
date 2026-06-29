(function () {

    const API = "https://web-otp-service.onrender.com";

    // Create host element
    const host = document.createElement("div");
    host.id = "we-otp-shadow-host";
    document.body.appendChild(host);

    // Create Shadow Root
    const shadow = host.attachShadow({
        mode: "open"
    });

    // Inject HTML + CSS
    shadow.innerHTML = `
<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
}

.overlay {
    position: fixed;
    inset: 0;
    z-index: 999999;
    display: flex;
    justify-content: center;
    align-items: center;
    // background: #fff;
    backdrop-filter: blur(3px);
    padding: 20px;
}

.card {
    width: 1020px;
    max-width: 100%;
    height: 580px;
    background: #ffffff;
    border-radius: 20px;
    overflow: hidden;
    display: flex;
    box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.25);
    position: relative;
}

.left {
    width: 48%;
    background: #ffffff;
    padding: 50px 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.right {
    width: 52%;
    background: #0d111d;
    color: #ffffff;
    position: relative;
    padding: 60px 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.logo-block {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
}

.logo-block svg {
    width: 34px;
    height: 34px;
}

.logo-block span {
    font-size: 25px;
    font-weight: 800;
    color: #1e293b;
    letter-spacing: -0.01em;
}

.title {
    font-size: 34px;
    font-weight: 800;
    color: #1e293b;
    letter-spacing: -0.025em;
    line-height: 1.2;
    margin-bottom: 8px;
}

.subtitle {
    color: #64748b;
    margin-bottom: 32px;
    font-size: 14px;
    line-height: 1.5;
}

.field {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.field label {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
}

input {
    width: 100%;
    height: 48px;
    border: 1px solid #cbd5e1;
    outline: none;
    background: #f8fafc;
    border-radius: 10px;
    padding: 0 16px;
    font-size: 14px;
    color: #0f172a;
    transition: all 0.2s ease;
}

input::placeholder {
    color: #94a3b8;
}

input:focus {
    border-color: #5b21b6;
    box-shadow: 0 0 0 3px rgba(91, 33, 182, 0.15);
}

button {
    width: 100%;
    height: 48px;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.primary-btn {
    background: #5b21b6;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(91, 33, 182, 0.2);
}

.primary-btn:hover {
    background: #4c1d95;
    box-shadow: 0 6px 16px rgba(91, 33, 182, 0.3);
}

.verified-success {
    background: #10b981 !important;
    color: #ffffff !important;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2) !important;
    pointer-events: none;
}

#credentialsSection {
    display: block;
}

#otpSection {
    display: none;
}

.right-tag {
    font-size: 11px;
    color: #94a3b8;
    background: #1a2035;
    padding: 4px 12px;
    border-radius: 20px;
    display: inline-block;
    align-self: flex-start;
    margin-bottom: 20px;
    font-weight: 600;
}

.right-title {
    font-size: 30px;
    font-weight: 800;
    line-height: 1.25;
    margin-bottom: 12px;
}

.right-subtitle {
    color: #94a3b8;
    font-size: 13.5px;
    line-height: 1.6;
    margin-bottom: 36px;
}

.perf-card {
    background: #151a29;
    border: 1px solid #222a3a;
    border-radius: 16px;
    padding: 24px;
    width: 100%;
}

.perf-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.perf-card-header span {
    font-size: 15px;
    font-weight: 700;
}

.live-badge {
    background: rgba(91, 33, 182, 0.2);
    color: #a78bfa;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 8px;
    text-transform: uppercase;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 20px;
}

.stat-item span {
    font-size: 11px;
    color: #94a3b8;
    display: block;
    margin-bottom: 4px;
}

.stat-item b {
    font-size: 24px;
    font-weight: 800;
    color: #ffffff;
}

.progress-block span {
    font-size: 11px;
    color: #94a3b8;
    margin-bottom: 6px;
    display: block;
}

.progress-bar {
    width: 100%;
    height: 6px;
    background: #222a3a;
    border-radius: 3px;
    overflow: hidden;
}

.progress-bar-fill {
    height: 100%;
    background: #5b21b6;
    width: 78%;
    border-radius: 3px;
}

.message {
    margin-top: 14px;
    text-align: center;
    font-size: 13px;
    min-height: 20px;
    font-weight: 500;
}

.success { color: #10b981; }
.error { color: #ef4444; }

#loader {
    display: none;
    text-align: center;
    margin-top: 14px;
    color: #64748b;
    font-size: 13px;
}

.spinner {
    width: 20px;
    height: 20px;
    margin: 0 auto 6px auto;
    border-radius: 50%;
    border: 2px solid #f1f5f9;
    border-top: 2px solid #5b21b6;
    animation: spin .6s linear infinite;
}

#resend {
    display: none;
    margin-top: 12px;
    text-align: center;
    color: #5b21b6;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
}

#resend:hover {
    text-decoration: underline;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.shake { animation: shake .35s; }
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    50% { transform: translateX(6px); }
    75% { transform: translateX(-4px); }
}

button.loading {
    pointer-events: none;
    opacity: .8;
}
button.loading:after {
    content: "...";
    animation: dots 1s infinite;
}

@keyframes dots {
    0% { content: "."; }
    33% { content: ".."; }
    66% { content: "..."; }
    100% { content: "."; }
}

@media(max-width: 900px) {
    .card {
        flex-direction: column;
        height: auto;
        max-height: 90vh;
        overflow-y: auto;
    }
    .left, .right {
        width: 100%;
        padding: 32px 24px;
    }
}
</style>

<div class="overlay">
    <div class="card">
        
        <div class="left">
            <div class="logo-block">
                <img width="40" src="https://res.cloudinary.com/djoqxegkb/image/upload/v1780386730/mxdccfpslyc7bmxi2vag.jpg">
                <span>Sign in to continue</span>
            </div>

            <!--  <div class="title">Sign in to continue</div> -->
            <div class="subtitle" id="formSubtitle">Access campaigns, templates, analytics, and engagement workflows from your centralized dashboard.</div>

            <div id="credentialsSection">
                <div class="field">
                    <label for="email">Business Email</label>
                    <input id="email" type="email" placeholder="name@company.com" />
                </div>

                <div class="field">
                    <label for="mobile">Mobile Number</label>
                    <input id="mobile" maxlength="10" placeholder="Enter 10-digit number" />
                </div>

                <button id="sendBtn" class="primary-btn">Send Verification OTP</button>
            </div>

            <div id="otpSection">
                <div class="field">
                    <label for="otp">Enter One-Time Password</label>
                    <input id="otp" maxlength="6" placeholder="Enter 6-digit code" />
                </div>
                <button id="verifyBtn" class="primary-btn">Verify & Authenticate</button>
                <div id="resend"></div>
            </div>

            <div id="loader"></div>
            <div id="message" class="message"></div>
        </div>

        <div class="right">
            <div class="right-tag">• WebEngage Intelligence Suite</div>
            <div class="right-title">Build meaningful customer engagement campaigns</div>
            <div class="right-subtitle">Manage campaigns, automate workflows, and monitor engagement performance from a unified platform.</div>
            
            <div class="perf-card">
                <div class="perf-card-header">
                    <span>Campaign Performance</span>
                    <div class="live-badge">Live</div>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-item">
                        <span>Active Campaigns</span>
                        <b>128</b>
                    </div>
                    <div class="stat-item">
                        <span>Engagement Rate</span>
                        <b>92%</b>
                    </div>
                    <div class="stat-item">
                        <span>Notifications</span>
                        <b>1.2M</b>
                    </div>
                </div>
                
                <div class="progress-block">
                    <span>Campaign Delivery Performance</span>
                    <div class="progress-bar">
                        <div class="progress-bar-fill"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`;

    let mobile = "";
    let email = "";
    let timer;
    let remaining = 30;

    const $ = id => shadow.getElementById(id);

    function showLoader(show) {
        $("loader").style.display = show ? "block" : "none";
        if(show){
            $("loader").innerHTML = `
            <div class="spinner"></div>
            <div style="margin-top:4px">Processing request...</div>
            `;
        }
    }

    function showMessage(msg, type) {
        $("message").className = "message " + (type || "");
        if(type === "success"){
            $("message").innerHTML = "✓ " + msg;
        } else if(type === "error"){
            $("message").innerHTML = "✕ " + msg;
        } else {
            $("message").innerHTML = msg;
        }
    }

    async function sendOTP() {
        email = $("email").value.trim();
        mobile = $("mobile").value.trim();

        if (!email) {
            return showMessage("Please enter your email address", "error");
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return showMessage("Please enter a valid email address", "error");
        }

        if (!/^\d{10}$/.test(mobile)) {
            return showMessage("Please enter a valid 10-digit mobile number", "error");
        }

        showLoader(true);
        $("sendBtn").classList.add("loading");

        try {
            const response = await fetch(API + "/generate-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    mobile
                })
            });

            const data = await response.json();
            showLoader(false);
            $("sendBtn").classList.remove("loading");

            if (!response.ok)
                throw new Error(data.message);

            // Hide credentials view on success
            $("credentialsSection").style.display = "none";
            $("formSubtitle").innerHTML = "We have sent a security verification code to your mobile device.";

            // Show OTP section
            $("otpSection").style.display = "block";
            $("otpSection").animate([
                { opacity: 0, transform: "translateY(12px)" },
                { opacity: 1, transform: "translateY(0)" }
            ], {
                duration: 300,
                easing: "cubic-bezier(0.16, 1, 0.3, 1)",
                fill: "forwards"
            });

            showMessage(data.message, "success");
            startTimer();

        } catch (e) {
            showLoader(false);
            $("sendBtn").classList.remove("loading");
            showMessage(e.message, "error");
        }
    }

    async function verifyOTP() {
        const otp = $("otp").value.trim();

        if (!/^\d{6}$/.test(otp))
            return showMessage("Please enter a valid 6-digit OTP", "error");

        showLoader(true);
        $("verifyBtn").classList.add("loading");

        try {
            const response = await fetch(API + "/validate-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    mobile,
                    otp
                })
            });

            const data = await response.json();
            showLoader(false);
            $("verifyBtn").classList.remove("loading");

            if (!response.ok)
                throw new Error(data.message);

            // Turn verify button green and label it verified
            showMessage("", "");
            $("verifyBtn").innerHTML = "Verified ✓";
            $("verifyBtn").classList.add("verified-success");

            console.log({ email, mobile });
            
            setTimeout(() => {
                host.remove();
            }, 1200);

        } catch (e) {
            showLoader(false);
            $("verifyBtn").classList.remove("loading");
            $("otp").classList.add("shake");
            setTimeout(function(){
                $("otp").classList.remove("shake");
            }, 400);
            showMessage(e.message, "error");
        }
    }

    function startTimer() {
        clearInterval(timer);
        remaining = 30;
        $("resend").style.display = "block";
        $("resend").style.pointerEvents = "none";
        updateTimer();

        timer = setInterval(() => {
            remaining--;
            updateTimer();

            if (remaining <= 0) {
                clearInterval(timer);
                $("resend").innerHTML = "Resend OTP";
                $("resend").style.pointerEvents = "auto";
            }
        }, 1000);
    }

    function updateTimer() {
        $("resend").innerHTML = "Resend verification code in " + remaining + "s";
    }

    $("sendBtn").onclick = sendOTP;
    $("verifyBtn").onclick = verifyOTP;
    
    $("mobile").addEventListener("keypress", function(e){
        if(e.key === "Enter") sendOTP();
    });
    
    $("otp").addEventListener("keypress", function(e){
        if(e.key === "Enter") verifyOTP();
    });

    $("resend").onclick = function () {
        if (remaining <= 0) sendOTP();
    };

})();