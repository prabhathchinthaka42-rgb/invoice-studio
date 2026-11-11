import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from "remotion";

export const MyComposition = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0f172a", fontFamily: "sans-serif" }}>
      {/* Scene 1: Intro Title (Frames 0 - 120) */}
      <Sequence from={0} durationInFrames={120}>
        <IntroScene />
      </Sequence>

      {/* Scene 2: App UI - Adding a Client (Frames 120 - 450) */}
      <Sequence from={120} durationInFrames={330}>
        <AppScene phase="client" />
      </Sequence>

      {/* Scene 3: App UI - Adding a Service & Downloading (Frames 450 - 780) */}
      <Sequence from={450} durationInFrames={330}>
        <AppScene phase="service" />
      </Sequence>

      {/* Scene 4: Outro (Frames 780 - 900) */}
      <Sequence from={780} durationInFrames={120}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};

// ============================================
// SCENE 1: INTRO
// ============================================
const IntroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 14 } });
  const opacity = interpolate(frame, [0, 20], [0, 1]);

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white" }}>
      <div style={{ opacity, transform: `scale(${scale})`, textAlign: "center" }}>
        <h1 style={{ fontSize: 100, margin: 0, fontWeight: "bold", background: "linear-gradient(to right, #60a5fa, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Invoice Studio
        </h1>
        <p style={{ fontSize: 40, color: "#94a3b8", marginTop: 20 }}>Set up once. Generate in seconds.</p>
      </div>
    </AbsoluteFill>
  );
};

// ============================================
// SCENE 2 & 3: APP DEMO
// ============================================
const AppScene = ({ phase }: { phase: "client" | "service" }) => {
  const frame = useCurrentFrame();
  
  // Cursor positions
  let cursorX = 0;
  let cursorY = 0;

  if (phase === "client") {
    // Move to client name, type, then move to save button
    if (frame < 60) {
      cursorX = interpolate(frame, [0, 60], [800, 300]); 
      cursorY = interpolate(frame, [0, 60], [500, 250]);
    } else if (frame < 180) {
      cursorX = 300; cursorY = 250; // Typing
    } else {
      cursorX = interpolate(frame, [180, 240], [300, 450]);
      cursorY = interpolate(frame, [180, 240], [250, 420]); // Click Save Client
    }
  } else {
    // Move to Add Item, select service, then move to Download PDF
    if (frame < 60) {
      cursorX = interpolate(frame, [0, 60], [800, 400]); 
      cursorY = interpolate(frame, [0, 60], [500, 300]);
    } else if (frame < 180) {
      cursorX = 400; cursorY = 300; // Click Service
    } else {
      cursorX = interpolate(frame, [180, 240], [400, 850]);
      cursorY = interpolate(frame, [180, 240], [300, 150]); // Click Download PDF
    }
  }

  // Typing effect for Client Name
  const clientName = phase === "client" && frame > 60 ? "John Doe".substring(0, Math.floor((frame - 60) / 5)) : (phase === "service" ? "John Doe" : "");
  const clientAddress = phase === "client" && frame > 100 ? "123 Main St".substring(0, Math.floor((frame - 100) / 5)) : (phase === "service" ? "123 Main St" : "");

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
       {/* App Window */}
      <div style={{ 
          width: 1100, height: 650, backgroundColor: "#1e293b", borderRadius: 20, border: "1px solid #334155",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", display: "flex", overflow: "hidden", position: "relative"
        }}>
          
          {/* Left Side: Form */}
          <div style={{ width: "50%", padding: 40, borderRight: "1px solid #334155", position: "relative" }}>
            <h2 style={{ fontSize: 24, color: "white", marginBottom: 20 }}>Invoice Details</h2>
            
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>Client Name</div>
              <div style={{ height: 45, backgroundColor: "#0f172a", borderRadius: 8, border: "1px solid #334155", paddingLeft: 15, display: "flex", alignItems: "center", color: "white" }}>
                {clientName}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>Client Address</div>
              <div style={{ height: 45, backgroundColor: "#0f172a", borderRadius: 8, border: "1px solid #334155", paddingLeft: 15, display: "flex", alignItems: "center", color: "white" }}>
                {clientAddress}
              </div>
            </div>

            {/* Save Button */}
            <div style={{ 
              height: 45, width: 160, 
              backgroundColor: phase === "client" && frame > 200 ? "#22c55e" : "#2563eb", 
              borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold",
              transition: "background-color 0.3s"
            }}>
              {phase === "client" && frame > 200 ? "Saved!" : "Save Client"}
            </div>

            {/* Line Items Dropdown (Service Phase) */}
            {phase === "service" && (
              <div style={{ marginTop: 30 }}>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>Line Items</div>
                <div style={{ height: 45, backgroundColor: "#0f172a", borderRadius: 8, border: frame > 60 && frame < 180 ? "2px solid #3b82f6" : "1px solid #334155", paddingLeft: 15, display: "flex", alignItems: "center", color: "white", justifyContent: "space-between", paddingRight: 15 }}>
                  {frame > 180 ? "Web Design Service" : "Add Item..."}
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Preview */}
          <div style={{ width: "50%", backgroundColor: "#f8fafc", padding: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
              <div style={{ fontSize: 24, fontWeight: "bold", color: "#0f172a" }}>Your Company</div>
              <div style={{ fontSize: 28, fontWeight: "bold", color: "#2563eb" }}>INVOICE</div>
            </div>
            
            <div style={{ fontSize: 14, fontWeight: "bold", color: "#64748b", marginBottom: 10 }}>BILL TO</div>
            <div style={{ fontSize: 18, fontWeight: "bold", color: "#0f172a", height: 25 }}>{clientName}</div>
            <div style={{ fontSize: 14, color: "#64748b", height: 20 }}>{clientAddress}</div>

            {phase === "service" && frame > 180 && (
              <div style={{ marginTop: 30 }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #cbd5e1", paddingBottom: 10, color: "#64748b", fontSize: 14, fontWeight: "bold" }}>
                  <span>Description</span><span>Amount</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#334155", fontSize: 16, marginTop: 10 }}>
                  <span>Web Design Service</span><span>$500.00</span>
                </div>
              </div>
            )}
          </div>

          {/* Dropdown Overlay for Service */}
          {phase === "service" && frame > 40 && frame < 180 && (
            <div style={{ position: "absolute", top: 310, left: 40, width: "45%", backgroundColor: "white", borderRadius: 8, boxShadow: "0 10px 15px rgba(0,0,0,0.1)", zIndex: 20 }}>
              <div style={{ padding: 15, backgroundColor: "#eff6ff", color: "#1e3a8a", fontWeight: "bold" }}>Web Design Service ($500)</div>
              <div style={{ padding: 15, color: "#64748b" }}>SEO Audit ($200)</div>
            </div>
          )}

          {/* Animated Cursor */}
          <div style={{ position: "absolute", left: cursorX, top: cursorY, width: 28, height: 28, backgroundColor: "white", borderRadius: "50%", boxShadow: "0 4px 10px rgba(0,0,0,0.5)", zIndex: 30, border: "2px solid #333" }} />
      </div>
    </AbsoluteFill>
  );
};

// ============================================
// SCENE 4: OUTRO
// ============================================
const OutroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 14 } });
  const opacity = interpolate(frame, [0, 20], [0, 1]);

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white" }}>
      <div style={{ opacity, transform: `scale(${scale})`, textAlign: "center" }}>
        <h2 style={{ fontSize: 70, margin: 0, fontWeight: "bold" }}>Start generating invoices.</h2>
        <p style={{ fontSize: 40, color: "#60a5fa", marginTop: 20 }}>invoice-studio.app</p>
      </div>
    </AbsoluteFill>
  );
};