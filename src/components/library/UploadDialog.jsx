import { StudyMaterial } from '@/api/entities';
import { supabase } from '@/api/supabase';
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Upload, Loader2, Sparkles } from "lucide-react";
import { analyzeContent } from "@/lib/ai";

async function uploadFileToSupabase(file) {
  const { data: { user } } = await supabase.auth.getUser();
  const path = `${user.id}/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from('study-files').upload(path, file);
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from('study-files').getPublicUrl(path);
  return publicUrl;
}

async function extractTextFromFile(file) {
  const name = file.name.toLowerCase();

  // Plain text / markdown
  if (file.type === 'text/plain' || name.endsWith('.txt') || name.endsWith('.md')) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsText(file);
    });
  }

  // PDF via PDF.js
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) {
    return new Promise(async (resolve) => {
      try {
        if (!window.pdfjsLib) {
          await new Promise((res, rej) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = res; script.onerror = rej;
            document.head.appendChild(script);
          });
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map(item => item.str).join(' ') + '\n';
        }
        resolve(fullText);
      } catch (err) {
        console.error('PDF extraction failed:', err);
        resolve('');
      }
    });
  }

  // Word (.docx) via mammoth.js
  if (name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return new Promise(async (resolve) => {
      try {
        if (!window.mammoth) {
          await new Promise((res, rej) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
            script.onload = res; script.onerror = rej;
            document.head.appendChild(script);
          });
        }
        const arrayBuffer = await file.arrayBuffer();
        const result = await window.mammoth.extractRawText({ arrayBuffer });
        resolve(result.value || '');
      } catch (err) {
        console.error('DOCX extraction failed:', err);
        resolve('');
      }
    });
  }

  // PowerPoint (.pptx) - extract text from XML
  if (name.endsWith('.pptx') || file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    return new Promise(async (resolve) => {
      try {
        if (!window.JSZip) {
          await new Promise((res, rej) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = res; script.onerror = rej;
            document.head.appendChild(script);
          });
        }
        const arrayBuffer = await file.arrayBuffer();
        const zip = await window.JSZip.loadAsync(arrayBuffer);
        let fullText = '';
        const slideFiles = Object.keys(zip.files).filter(f => f.startsWith('ppt/slides/slide') && f.endsWith('.xml'));
        slideFiles.sort();
        for (const slideFile of slideFiles) {
          const content = await zip.files[slideFile].async('string');
          const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          fullText += text + '\n';
        }
        resolve(fullText);
      } catch (err) {
        console.error('PPTX extraction failed:', err);
        resolve('');
      }
    });
  }

  return '';
}

function getSourceType(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.docx')) return 'docx';
  if (name.endsWith('.pptx')) return 'pptx';
  return 'document';
}

export default function UploadDialog({ open, onOpenChange, onCreated }) {
  const [mode, setMode] = useState("text");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");

  const reset = () => {
    setTitle(""); setSubject(""); setText(""); setFile(null); setBusy(false); setStage("");
  };

  const handleSubmit = async () => {
    if (!title.trim()) { alert("Please enter a title."); return; }
    setBusy(true);
    try {
      let content = text;
      let file_url = null;
      let source_type = "text";

      if (mode === "file" && file) {
        setStage("Uploading file…");
        file_url = await uploadFileToSupabase(file);
        source_type = getSourceType(file);
        setStage(`Extracting text from ${source_type.toUpperCase()}…`);
        const extracted = await extractTextFromFile(file);
        if (extracted && extracted.trim().length > 50) content = extracted;
      }

      if (!content || content.trim().length < 50) {
        alert("Not enough text found. Try pasting text instead.");
        setBusy(false); setStage(""); return;
      }

      setStage("Analyzing with AI… (10-20 seconds)");
      const analysis = await analyzeContent(content, title || "Untitled");

      const words = content.trim().split(/\s+/).length;
      const created = await StudyMaterial.create({
        title: title || "Untitled Material",
        subject: subject || "General",
        source_type,
        file_url,
        content: content.slice(0, 20000),
        summary: analysis.summary || "",
        key_topics: analysis.key_topics || [],
        word_count: words,
        estimated_read_time: Math.max(1, Math.round(words / 220)),
      });

      sessionStorage.setItem(`audio_script_${created.id}`, analysis.audio_script || "");
      onCreated?.(created);
      reset();
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      alert("Something went wrong: " + e.message);
    } finally {
      setBusy(false); setStage("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!busy) { reset(); onOpenChange(v); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Add study material</DialogTitle>
          <DialogDescription>Upload PDF, Word, PowerPoint, or paste text. AI will analyze it.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Title *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Operating Systems II" />
            </div>
            <div>
              <Label>Subject</Label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="CS" />
            </div>
          </div>

          <Tabs value={mode} onValueChange={setMode}>
            <TabsList className="w-full">
              <TabsTrigger value="text" className="flex-1"><FileText className="w-4 h-4 mr-1.5" />Paste text</TabsTrigger>
              <TabsTrigger value="file" className="flex-1"><Upload className="w-4 h-4 mr-1.5" />Upload file</TabsTrigger>
            </TabsList>

            <TabsContent value="text">
              <Textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Paste your notes, article, or study content here…"
                className="min-h-[160px] resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">{text.length} characters</p>
            </TabsContent>

            <TabsContent value="file">
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => document.getElementById('file-input').click()}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">{file.name}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, Word (.docx), PowerPoint (.pptx), TXT</p>
                  </>
                )}
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.txt,.md,.docx,.pptx"
                  className="hidden"
                  onChange={e => setFile(e.target.files[0])}
                />
              </div>
            </TabsContent>
          </Tabs>

          {stage && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              {stage}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }} disabled={busy}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={busy || (!text.trim() && !file)}>
              {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Analyze
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
