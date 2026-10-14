import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import faceImg from "../assets/chatbot-face.webp";
import faceHiImg from "../assets/chatbot-face-hi.webp";

const LIMIT = 5;
const COUNT_KEY = "jt_guest_chat_count";

const brain = (q) => {
  const s = q.toLowerCase();
  if (/(^|\W)(hi|hello|hey|namaste)(\W|$)/.test(s))
    return "Hey there! Ask me about finding jobs, resumes, applications or interviews — anything on your mind?";
  if (s.includes("job") || s.includes("role") || s.includes("find") || s.includes("vacancy") || s.includes("hiring"))
    return "You can browse hundreds of open roles on our Jobs page — filter by remote, salary, and experience level. Creating a free account lets you apply in one click and track everything.";
  if (s.includes("resume") || s.includes("cv"))
    return "Upload your resume under My Resumes and our AI scores it against real job descriptions, then tells you exactly what to fix. Members get unlimited analyses.";
  if (s.includes("appl"))
    return "To apply: open any job, pick a resume, hit Apply. Your dashboard then tracks every stage — applied, screening, shortlisted, interview — so nothing slips through.";
  if (s.includes("salar"))
    return "Salaries on JobTrack are shown in ₹LPA with min–max ranges, and you can filter jobs by minimum salary. Recruiters post verified ranges, no more guessing.";
  if (s.includes("interview"))
    return "When a recruiter moves you to interview, you get notified instantly and it shows on your dashboard timeline. Pro tip: keep your profile complete — it doubles your shortlist odds.";
  if (s.includes("login") || s.includes("sign") || s.includes("account") || s.includes("register"))
    return "Accounts are free — one signup gives you applications tracking, resume AI scoring, saved jobs and instant alerts. Takes about 30 seconds.";
  if (s.includes("thank"))
    return "You're welcome! Anything else about your job hunt I can help with?";
  if (s.includes("who are you") || s.includes("your name"))
    return "I'm the JobTrack assistant — here to answer quick questions about jobs, resumes and applications.";
  return "I can help with jobs, resumes, applications, salaries and interviews. Try asking something like “how do I apply for a job?”";
};

const TypingDots = () => (
  <span className="inline-flex gap-1 px-1 py-1">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="h-[7px] w-[7px] animate-bounce rounded-full bg-slate-400"
        style={{ animationDelay: `${i * 0.2}s`, animationDuration: "1.2s" }}
      />
    ))}
  </span>
);

const GuestChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [used, setUsed] = useState(() => {
    const n = parseInt(localStorage.getItem(COUNT_KEY) || "0", 10);
    return isNaN(n) ? 0 : n;
  });
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef(null);
  const idRef = useRef(0);

  const locked = used >= LIMIT;

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  const pushBot = (text, wall = false, delay = 700) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      idRef.current += 1;
      setMessages((m) => [...m, { id: idRef.current, who: "bot", text, wall }]);
    }, delay);
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && messages.length === 0) {
      pushBot("Hi! I'm the JobTrack assistant. Ask me anything about finding jobs, resumes or applications.");
    }
  };

  const send = () => {
    const text = input.trim();
    if (!text || typing) return;
    idRef.current += 1;
    setMessages((m) => [...m, { id: idRef.current, who: "user", text }]);
    setInput("");

    if (used >= LIMIT) {
      pushBot("", true);
      return;
    }

    const next = used + 1;
    setUsed(next);
    localStorage.setItem(COUNT_KEY, String(next));

    const reply = brain(text);
    setTimeout(() => {
      pushBot(reply);
      if (next >= LIMIT) setTimeout(() => pushBot("", true), 1400);
    }, 150);
  };

  return (
    <>
      <button
        onClick={toggle}
        aria-label={open ? "Close chat" : "Open chat"}
        className="group fixed bottom-6 right-6 z-[60] h-14 w-14 rounded-full border-2 border-slate-200 bg-white shadow-[0_12px_28px_-6px_rgba(37,99,235,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-6px_rgba(37,99,235,0.45)] max-sm:bottom-4 max-sm:right-4 cursor-pointer"
      >
        {open ? (
          <svg className="m-auto text-slate-500" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <>
            <span className="relative block h-full w-full">
                <img src={faceImg} alt="JobTrack assistant" className="absolute inset-0 h-full w-full rounded-full object-cover transition-opacity duration-200 group-hover:opacity-0 p-1.5" />
                <img src={faceHiImg} alt="" className="absolute inset-0 h-full w-full rounded-full object-cover opacity-0 transition-opacity duration-200 group-hover:opacity-100 p-1.5" />
            </span>

            <span className="pointer-events-none absolute bottom-2 right-[72px] whitespace-nowrap rounded-[14px] border border-slate-200 bg-white px-[15px] py-[10px] text-[13px] font-semibold text-slate-900 opacity-0 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.18)] transition-all duration-200 translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 max-sm:hidden">
              Can I help you with anything?
              <span className="absolute -right-[6px] bottom-[14px] h-[11px] w-[11px] rotate-45 border-r border-t border-slate-200 bg-white" />
            </span>
          </>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-[60] flex  max-h-[calc(100vh-140px)] w-[372px] max-w-[calc(100vw-32px)] animate-[chat-pop_0.18s_ease] flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-2xl max-sm:bottom-[100px] max-sm:left-4 max-sm:right-4 max-sm:w-auto">
          <div className="flex items-center gap-2.5 bg-blue-600 p-3.5 text-white">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20">
              <img src={faceHiImg} alt="" className="h-full w-full object-cover" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold">JobTrack Assistant</p>
              <span className="flex items-center gap-1.5 text-xs opacity-85">
                <span className="inline-block h-[7px] w-[7px] rounded-full bg-green-400" />
                Online
              </span>
            </div>
          </div>

          <div ref={listRef} className="flex max-h-[360px] min-h-[120px] flex-col gap-2.5 overflow-y-auto bg-slate-50 px-3.5 py-4">

            {messages.map((m) =>
              m.who === "user" ? (
                <div key={m.id} className="max-w-[82%] self-end rounded-2xl rounded-br-md bg-blue-600 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-white">
                  {m.text}
                </div>
              ) : m.wall ? (
                <div key={m.id} className="max-w-[82%] self-start rounded-2xl rounded-bl-md border border-red-200 bg-white px-3.5 py-2.5 text-[13.5px] leading-relaxed text-slate-900">
                  You&apos;ve used your free questions. Log in to keep chatting — it&apos;s free, and your applications, resume scores and alerts all live in one place.
                  <br />
                  <Link to="/login" className="mt-2.5 inline-block rounded-[10px] bg-blue-600 px-[18px] py-2 text-[13px] font-bold text-white">
                    Log in / Sign up
                  </Link>
                </div>
              ) : (
                <div key={m.id} className="max-w-[82%] self-start rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2.5 text-[13.5px] leading-relaxed text-slate-900">
                  {m.text}
                </div>
              )
            )}
            {typing && (
              <div className="max-w-[82%] self-start rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2.5">
                <TypingDots />
              </div>
            )}
          </div>

          <div className="flex gap-2 border-t border-slate-200 bg-white p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={locked ? "Log in to keep chatting" : "Ask about jobs, resumes…"}
              disabled={locked}
              autoComplete="off"
              className="h-[42px] flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-400"
            />
            <button
              onClick={send}
              disabled={locked}
              aria-label="Send"
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:brightness-110 disabled:bg-slate-300"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GuestChatbot;
