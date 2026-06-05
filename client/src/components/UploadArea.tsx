import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { analyzeResume } from "@/app/features/resumeAnalysis/resumeAnalysisSlice";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AnalysisProgressBar } from "@/components/AnalysisProgressBar";
import { useAnalysisProgress } from "@/hooks/useAnalysisProgress";
import { FileText, Upload, CheckCircle2, ExternalLink } from "lucide-react";

const UploadArea: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, data, error } = useAppSelector((s) => s.resumeAnalysis);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const { progress, stage, complete } = useAnalysisProgress(loading);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Maximum file size is 10MB.",
      });
      return;
    }

    setPendingFile(file);
    setShowDialog(true);
  }, []);

  const handleAnalyze = async () => {
    if (!pendingFile) return;

    const toastId = toast.loading("Starting analysis...", { id: "upload-toast" });

    try {
      const result = await dispatch(analyzeResume(pendingFile)).unwrap();
      complete();
      setUploadedFile(pendingFile);

      if (result.warning) {
        toast.warning("Analysis completed with limitations", {
          id: toastId,
          description: result.warning,
        });
      } else {
        toast.success("Resume analyzed successfully!", { id: toastId });
      }
    } catch (err) {
      toast.error("Analysis failed", {
        id: toastId,
        description: typeof err === "string" ? err : "Please try again.",
      });
    } finally {
      setPendingFile(null);
      setShowDialog(false);
    }
  };

  useEffect(() => {
    if (error) {
      toast.error("Analysis failed", { description: error });
    }
  }, [error]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 10 * 1024 * 1024,
    disabled: loading,
  });

  return (
    <>
      <div className="space-y-5">
        {!data && !uploadedFile && !loading && (
          <Card
            {...getRootProps()}
            className="group cursor-pointer border-2 border-dashed border-muted-foreground/30 bg-gradient-to-br from-card to-muted/20 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
          >
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
              <input {...getInputProps()} />
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                <Upload className="h-8 w-8" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-lg font-semibold">Upload your resume</Label>
                <p className="text-sm text-muted-foreground">
                  Drag & drop or click to browse • PDF only • Max 10MB
                </p>
              </div>
              {isDragActive && (
                <p className="text-sm font-medium text-emerald-500">Drop your file here</p>
              )}
            </CardContent>
          </Card>
        )}

        {loading && <AnalysisProgressBar progress={progress} stage={stage} />}

        {uploadedFile && !data && !loading && (
          <Card className="border-border/60 bg-muted/30">
            <CardContent className="flex flex-col items-start justify-between gap-4 p-5 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • PDF
                  </p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => setUploadedFile(null)}>
                Upload New
              </Button>
            </CardContent>
          </Card>
        )}

        {data && (
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="flex flex-col items-start justify-between gap-4 p-5 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/15">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="font-semibold">{data.resumeName || "Resume analyzed"}</p>
                  <p className="text-sm text-muted-foreground">
                    ATS Score: {data.analysis?.ats_score ?? 0}% • Report ready
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={data.resumeUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <ExternalLink className="h-3.5 w-3.5" />
                    View Resume
                  </Button>
                </a>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  Upload New
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Analyze this resume?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingFile
                ? `"${pendingFile.name}" will be analyzed by AI. This may take up to a minute.`
                : "Your resume will be analyzed by AI."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setPendingFile(null);
                setShowDialog(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAnalyze}>Analyze Now</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UploadArea;
