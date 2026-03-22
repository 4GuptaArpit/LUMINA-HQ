// components/document-upload-dialog.tsx
"use client";

import { useState, useRef } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { upload } from "@vercel/blob/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { allowedTypes } from "@/app/data/data";

interface DocumentUploadDialogProps {
  onUploadSuccess?: () => void;
  trigger?: React.ReactNode;
  organizationSlug?: string;
}

export function DocumentUploadDialog({
  onUploadSuccess,
  trigger,
  organizationSlug,
}: DocumentUploadDialogProps) {
  const { organization } = useOrganization();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [documentName, setDocumentName] = useState("");
  //   const [documentContent, setDocumentContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const allowedExtensions = [".txt", ".pdf", ".doc", ".docx", ".md"];

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    const fileExtension = file.name
      .slice(file.name.lastIndexOf("."))
      .toLowerCase();
    const isAllowedType = allowedTypes.includes(file.type);
    const isAllowedExtension = allowedExtensions.includes(fileExtension);

    if (!isAllowedType && !isAllowedExtension) {
      toast.error(
        "File type not supported. Please upload .txt, .pdf, .doc, .docx, or .md files",
      );
      return;
    }

    setSelectedFile(file);
    setDocumentName(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
  };

  // Handle upload
  const handleUpload = async () => {
    if (!user || !selectedFile) {
      toast.error("Please choose a file and an active organization");
      return;
    }

    const organizationId = organization?.id ?? null;

    if (!organizationId && !organizationSlug) {
      toast.error("Please choose a file and an active organization");
      return;
    }

    if (!documentName.trim()) {
      toast.error("Please enter a document name");
      return;
    }

    setIsUploading(true);

    try {
      let uploadedFileUrl: string | null = null;
      let uploadedFileSize: number | null = null;
      let uploadedFileType: string | null = null;

      if (selectedFile) {
        const blob = await upload(selectedFile.name, selectedFile, {
          access: "private",
          handleUploadUrl: "/api/documents/upload",
          multipart: selectedFile.size > 5 * 1024 * 1024,
          clientPayload: JSON.stringify({
            fileName: selectedFile.name,
            organizationId,
            organizationSlug,
          }),
        });

        uploadedFileUrl = blob.downloadUrl;
        uploadedFileSize = selectedFile.size;
        uploadedFileType = selectedFile.type || "unknown";
      }

      const formData = new FormData();
      formData.append("name", documentName);
      if (organizationId) {
        formData.append("organizationId", organizationId);
      }
      if (organizationSlug) {
        formData.append("organizationSlug", organizationSlug);
      }

      if (uploadedFileUrl) {
        formData.append("fileUrl", uploadedFileUrl);
      }

      if (uploadedFileSize !== null) {
        formData.append("fileSize", String(uploadedFileSize));
      }

      if (uploadedFileType) {
        formData.append("fileType", uploadedFileType);
      }

      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Document uploaded successfully!");

        // Reset form
        setDocumentName("");
        setSelectedFile(null);
        setIsOpen(false);

        // Call success callback
        onUploadSuccess?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // Reset form when dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form state
      setDocumentName("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a file or enter text content for analysis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Document Name *
            </label>
            <Input
              placeholder="Enter document name"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              disabled={isUploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Upload File
            </label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".txt,.pdf,.doc,.docx,.md"
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="font-medium">
                    {selectedFile ? selectedFile.name : "Click to select file"}
                  </span>
                  <span className="text-sm text-gray-500">
                    Supports: .txt, .pdf, .doc, .docx, .md (Max 10MB)
                  </span>
                  {selectedFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || !documentName.trim()}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
