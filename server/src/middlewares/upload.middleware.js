import multer from "multer";
import path from "path";

const EXT_TO_TYPE = {
  ".pdf": "PDF",
  ".doc": "DOC",
  ".docx": "DOCX",
};


const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (EXT_TO_TYPE[path.extname(file.originalname).toLowerCase()]) cb(null, true);
  else cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});


const uploadResumeFile = (req, res, next) => {
  upload.single("resume")(req, res, (err) => {
    if (err) {
      const message = err.code === "LIMIT_FILE_SIZE" ? "Resume must be under 5MB" : err.message;
      return res.status(400).json({ success: false, message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Resume file is required" });
    }
    next();
  });
};

export { uploadResumeFile, EXT_TO_TYPE };
