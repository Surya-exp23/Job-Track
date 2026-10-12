import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

// Downloads the resume from Cloudinary and extracts plain text for the AI
const extractResumeText = async (resume) => {
  const response = await fetch(resume.fileUrl);

  if (!response.ok) {
    throw new Error("Could not download the resume file");
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (resume.fileType === "PDF") {
    const parser = new PDFParse({ data: buffer });
    try {
      const { text } = await parser.getText();
      return text;
    } finally {
      await parser.destroy?.();
    }
  }

  if (resume.fileType === "DOCX") {
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }

  throw new Error("Resume analysis supports PDF and DOCX files only");
};

export { extractResumeText };
