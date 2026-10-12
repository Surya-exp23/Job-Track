import Groq from "groq-sdk";

const DEFAULT_MODEL = "openai/gpt-oss-120b";


const getClient = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

const getModel = () => process.env.GROQ_MODEL || DEFAULT_MODEL;

const clampScore = (n) => {
  const num = Math.round(Number(n));
  if (Number.isNaN(num)) return 0;
  return Math.min(100, Math.max(0, num));
};

const toStringArray = (arr, limit = 8) =>
  Array.isArray(arr)
    ? arr.map(String).map((s) => s.trim()).filter(Boolean).slice(0, limit)
    : [];

const buildPrompt = (resumeText, job) => {
  const jobSection = job
    ? `Score the resume's match against this job posting:
    Title: ${job.title}
    Description: ${job.description}
    Required skills: ${(job.skills || []).join(", ") || "not listed"}
    Experience level: ${job.experienceLevel || "not listed"}
    Employment type: ${job.employmentType || "not listed"}
    Location: ${job.location || "not listed"}`
        : `No specific job was given, so review the resume on its own merits.`;

    return `You are an expert resume reviewer and hiring manager. Analyze the resume below and return ONLY valid JSON (no markdown, no commentary) with exactly this shape:
    {
    "overallScore": <integer 0-100>,
    "scores": {
        "skillsMatch": <integer 0-100>,
        "experienceMatch": <integer 0-100>,
        "keywordMatch": <integer 0-100>,
        "formatting": <integer 0-100>
    },
    "strengths": ["...", "..."],
    "weaknesses": ["...", "..."],
    "suggestions": ["...", "..."]
    }
    ${jobSection}

    Resume text:
    """${resumeText}"""`;
};

const analyzeResume = async (resumeText, job = null) => {
  const model = getModel();

  const completion = await getClient().chat.completions.create({
    model,
    messages: [{ role: "user", content: buildPrompt(resumeText, job) }],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const parsed = JSON.parse(completion.choices[0].message.content);

  return {
    overallScore: clampScore(parsed.overallScore),
    scores: {
      skillsMatch: clampScore(parsed.scores?.skillsMatch),
      experienceMatch: clampScore(parsed.scores?.experienceMatch),
      keywordMatch: clampScore(parsed.scores?.keywordMatch),
      formatting: clampScore(parsed.scores?.formatting),
    },
    strengths: toStringArray(parsed.strengths),
    weaknesses: toStringArray(parsed.weaknesses),
    suggestions: toStringArray(parsed.suggestions),
    model,
  };
};

export { analyzeResume };
