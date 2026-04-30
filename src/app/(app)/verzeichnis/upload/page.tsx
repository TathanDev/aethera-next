"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Upload, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const IDENTIFIER_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [uploading, setUploading] = useState(false);

  const identifierError =
    identifier && !IDENTIFIER_RE.test(identifier)
      ? "Only lowercase letters, numbers, and hyphens (e.g. my-world)"
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !identifier || identifierError) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("identifier", identifier);

      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Upload failed");
      }

      toast.success("File uploaded successfully");
      router.push("/verzeichnis/dateien");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/verzeichnis">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Upload</h1>
          <p className="text-sm text-zinc-500">
            Files are automatically deleted after 48 hours
          </p>
        </div>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Upload file</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identifier */}
            <div className="space-y-1">
              <Label htmlFor="identifier">Identifier</Label>
              <Input
                id="identifier"
                placeholder="my-world"
                className="font-mono"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value.toLowerCase())}
              />
              {identifierError && (
                <p className="text-xs text-red-500">{identifierError}</p>
              )}
              <p className="text-xs text-zinc-500">
                Unique name to reference the file (e.g. during server deploy)
              </p>
            </div>

            {/* File picker */}
            <div className="space-y-1">
              <Label>File</Label>
              <div
                className="cursor-pointer rounded-md border-2 border-dashed border-zinc-200 p-6 text-center transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500"
                onClick={() => inputRef.current?.click()}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileIcon className="h-8 w-8 shrink-0 text-zinc-400" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-zinc-500">
                        {formatBytes(file.size)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="mx-auto h-8 w-8 text-zinc-400" />
                    <p className="text-sm text-zinc-500">
                      Click to select
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <Button
              type="submit"
              disabled={uploading || !file || !identifier || !!identifierError}
              className="w-full"
            >
              <Upload className="mr-1.5 h-4 w-4" />
              {uploading ? "Uploading…" : "Upload"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
