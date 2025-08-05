// import express from "express";
// import upload from "../middlewares/upload.js";
// import { analyzeResume, getResumeReports } from "../controllers/resume.controller.js";
// import { userAuth } from "../middlewares/auth.middleware.js";


// const resumeReportRouter = express.Router();
// resumeReportRouter.post("/analyze", userAuth, upload.single("resume"), analyzeResume);

// resumeReportRouter.get("/history", userAuth, getResumeReports);


// export default resumeReportRouter;




import express from "express";
import { upload } from "../middlewares/upload.js";
import {
    analyzeResume,
    deleteResumeReport,
    downloadResumeReportPdf,
    getResumeReportById,
    getResumeReports,
    reanalyzeResume,
    rewriteAISuggestion
}
from "../controllers/resume.controller.js";
import { userAuth } from "../middlewares/auth.middleware.js";

const resumeReportRouter = express.Router();

// @route   POST /api/resume/analyze
// @desc    Upload and analyze resume (PDF)
// @access  Private
resumeReportRouter.post("/analyze", userAuth, upload.single("resume"), analyzeResume);

// @route   GET /api/resume/history
// @desc    Get resume analysis history
// @access  Private
resumeReportRouter.get("/history", userAuth, getResumeReports);


// @route   DELETE /resume/:reportId
resumeReportRouter.delete("/:reportId", userAuth, deleteResumeReport);

resumeReportRouter.put("/reanalyze/:reportId", userAuth, reanalyzeResume);


// @route   GET /api/resume/:reportId
// @desc    Get a single resume report
// @access  Private
resumeReportRouter.get("/:reportId", userAuth, getResumeReportById);


// @route   GET /api/resume/download/:reportId
// @desc    Download resume analysis report as PDF
// @access  Private
resumeReportRouter.get("/download/:reportId", userAuth, downloadResumeReportPdf);


// POST /rewrite
resumeReportRouter.post("/rewrite/:reportId", userAuth, rewriteAISuggestion);





export default resumeReportRouter;
