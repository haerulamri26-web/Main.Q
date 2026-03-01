'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2, Undo, Redo, Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, List, ListOrdered,
  Link as LinkIcon, Type, ChevronLeft, FileText, Settings, Hash,
  Youtube, Gamepad2, Image as ImageIcon, Quote, Wand2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ============================================================================
// MARKDOWN PARSER - Convert Markdown to HTML
// ============================================================================
function convertMarkdownToHtml(text: string): string {
  if (!text) return '';
  
  let html = text;
  
  // 1. Code blocks (```code```)
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-zinc-900 text-zinc-100 p-4 rounded-lg my-4 overflow-x-auto"><code>$1</code></pre>');
  
  // 2. Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
  
  // 3. Bold (**text** or __text__)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  
  // 4. Italic (*text* or _text_)
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
  
  // 5. Strikethrough (~~text~~)
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  
  // 6. Headings (# to ######)
  html = html.replace(/^###### (.+)$/gm, '<h6 class="text-sm font-bold mb-2">$1</h6>');
  html = html.replace(/^##### (.+)$/gm, '<h5 class="text-base font-bold mb-2">$1</h5>');
  html = html.replace(/^#### (.+)$/gm, '<h4 class="text-lg font-bold mb-3">$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mb-3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mb-4">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mb-4">$1</h1>');
  
  // 7. Links ([text](url))
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>');
  
  // 8. Images (![alt](url))
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />');
  
  // 9. Unordered lists (- or *)
  html = html.replace(/^[\-\*] (.+)$/gm, '<li class="ml-4">$1</li>');
  html = html.replace(/(<li.*<\/li>\n?)+/g, '<ul class="list-disc list-inside my-4">$&</ul>');
  
  // 10. Ordered lists (1. 2. 3.)
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4">$1</li>');
  html = html.replace(/(<li.*<\/li>\n?)+/g, '<ol class="list-decimal list-inside my-4">$&</ol>');
  
  // 11. Blockquotes (> text)
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary bg-muted/30 p-4 my-4 rounded-r-lg">$1</blockquote>');
  
  // 12. Horizontal rules (--- or ***)
  html = html.replace(/^[\-\*]{3,}$/gm, '<hr class="my-6 border-t" />');
  
  // 13. Line breaks (double newline to <p>)
  html = html.replace(/\n\n/g, '</p><p class="mb-4">');
  html = `<p class="mb-4">${html}</p>`;
  
  // Clean up empty paragraphs
  html = html.replace(/<p class="mb-4"><\/p>/g, '');
  html = html.replace(/<p class="mb-4">(<h[1-6]|<ul|<ol|<blockquote|<pre)/g, '$1');
  html = html.replace(/(<\/h[1-6]|<\/ul>|<\/ol>|<\/blockquote>|<\/pre>)<\/p>/g, '$1');
  
  return html;
}

// ============================================================================
// HELPER: Clean AI Formatting
// ============================================================================
function cleanAIFormatting(text: string): string {
  if (!text) return '';
  
  // Remove common AI prefixes
  text = text.replace(/^(Tentu|Berikut|Ini|Here|This is)[\s\S]*?[:\-]\s*/i, '');
  
  // Remove excessive newlines
  text = text.replace(/\n{3,}/g, '\n\n');
  
  // Trim whitespace
  text = text.trim();
  
  return text;
}

export default function NewArticlePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [labels, setLabels] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState('Siap');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showYoutubeModal, setShowYoutubeModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  
  const editorRef = useRef<HTMLDivElement>(null);

  const updateCounts = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
      setWordCount(words);
      setCharCount(text.length);
    }
  };

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (typeof document === 'undefined') return;
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    updateCounts();
  };

  // ✅ Insert Link dengan Modal
  const handleInsertLink = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      setLinkText(selection.toString());
    }
    setShowLinkModal(true);
  };

  const confirmInsertLink = () => {
    if (!linkUrl) {
      toast({ variant: 'destructive', title: 'URL Wajib Diisi' });
      return;
    }
    
    if (typeof document === 'undefined') return;
    
    const editor = editorRef.current;
    if (!editor) return;
    
    editor.focus();
    
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      document.execCommand('createLink', false, linkUrl);
    } else if (linkText) {
      const link = document.createElement('a');
      link.href = linkUrl;
      link.innerText = linkText || linkUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.color = 'hsl(var(--primary))';
      link.style.textDecoration = 'underline';
      
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      range.insertNode(link);
      range.setStartAfter(link);
      range.setEndAfter(link);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    
    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
    updateCounts();
  };

  // ✅ Insert YouTube Embed
  const handleInsertYoutube = () => {
    setShowYoutubeModal(true);
  };

  const getYoutubeEmbedUrl = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const confirmInsertYoutube = () => {
    const videoId = getYoutubeEmbedUrl(youtubeUrl);
    
    if (!videoId) {
      toast({ variant: 'destructive', title: 'URL YouTube Tidak Valid' });
      return;
    }
    
    if (typeof document === 'undefined') return;
    
    const editor = editorRef.current;
    if (!editor) return;
    
    editor.focus();
    
    const embedDiv = document.createElement('div');
    embedDiv.className = 'youtube-embed';
    embedDiv.style.cssText = 'position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 20px 0; border-radius: 12px;';
    
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    
    embedDiv.appendChild(iframe);
    
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    range.insertNode(embedDiv);
    range.setStartAfter(embedDiv);
    range.setEndAfter(embedDiv);
    
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    
    setShowYoutubeModal(false);
    setYoutubeUrl('');
    updateCounts();
  };

  // ✅ Insert Game Link (Special for MAIN Q games)
  const handleInsertGameLink = () => {
    setLinkUrl('https://mainq.my.id/game/');
    setLinkText('Mainkan Game Edukasi Ini');
    setShowLinkModal(true);
  };

  // ✅ CONVERT MARKDOWN TO HTML (Paste Handler)
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    const pastedText = e.clipboardData.getData('text/plain');
    
    if (!pastedText) return;
    
    // Clean AI formatting first
    const cleanedText = cleanAIFormatting(pastedText);
    
    // Convert Markdown to HTML
    const htmlContent = convertMarkdownToHtml(cleanedText);
    
    // Insert into editor
    if (typeof document !== 'undefined') {
      const editor = editorRef.current;
      if (!editor) return;
      
      editor.focus();
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        while (tempDiv.firstChild) {
          range.insertNode(tempDiv.firstChild);
        }
        
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editor.innerHTML += htmlContent;
      }
      
      updateCounts();
      
      toast({ 
        title: '✅ Markdown dikonversi!', 
        description: 'Format bold, italic, heading, dan link sudah dikonversi ke HTML.' 
      });
    }
  };

  // ✅ Manual Convert Button (Untuk konten yang sudah di-paste)
  const handleConvertMarkdown = () => {
    if (typeof document === 'undefined') return;
    
    const editor = editorRef.current;
    if (!editor) return;
    
    const currentContent = editor.innerHTML;
    
    // Check if content looks like Markdown
    const hasMarkdown = /(\*\*|\_\_|^\#|\-\s|\d+\.\s|\[.*\]\(.*\)|\!\[.*\]\(.*\))/m.test(currentContent);
    
    if (!hasMarkdown) {
      toast({ 
        variant: 'destructive', 
        title: 'Tidak ada Markdown terdeteksi',
        description: 'Konten sudah dalam format HTML atau tidak ada format Markdown.'
      });
      return;
    }
    
    // Convert innerHTML back to text, then to HTML
    const textContent = editor.innerText;
    const convertedHtml = convertMarkdownToHtml(textContent);
    
    editor.innerHTML = convertedHtml;
    updateCounts();
    
    toast({ 
      title: '✅ Konversi selesai!', 
      description: 'Semua format Markdown telah dikonversi ke HTML.' 
    });
  };

  const onSubmit = async () => {
    if (!firestore || !user) return;
    
    const content = editorRef.current?.innerHTML || '';
    
    if (!title.trim() || title.length < 5) {
      toast({ variant: 'destructive', title: 'Judul Terlalu Pendek', description: 'Minimal 5 karakter.' });
      return;
    }
    
    if (!category) {
      toast({ variant: 'destructive', title: 'Kategori Belum Dipilih' });
      return;
    }
    
    if (!content.trim() || content === '<p><br></p>' || content === '<div><br></div>' || content === '<br>') {
      toast({ variant: 'destructive', title: 'Konten Kosong', description: 'Silakan tulis isi artikel Anda.' });
      return;
    }
    
    setIsSubmitting(true);
    setSaveStatus('Menerbitkan...');
    
    const articleId = `${Date.now()}-${user.uid.substring(0, 5)}`;
    const articleData = {
      title,
      category,
      content,
      labels: labels.split(',').map(l => l.trim()).filter(l => l),
      userId: user.uid,
      authorName: user.displayName || 'Guru Kreatif',
      authorPhotoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
      views: 0,
    };
    
    try {
      await setDocumentNonBlocking(doc(firestore, 'articles', articleId), articleData);
      toast({ title: 'Berhasil!', description: 'Artikel Anda telah diterbitkan.' });
      router.push(`/community/article/${articleId}`);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Gagal', description: e.message });
      setIsSubmitting(false);
      setSaveStatus('Gagal');
    }
  };

  if (isUserLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  
  if (!user) {
    router.push('/login?redirect=/community/new');
    return null;
  }

  const ToolbarButton = ({
    command,
    value,
    icon: Icon,
    title,
    onClickOverride
  }: {
    command?: string,
    value?: string,
    icon: any,
    title: string,
    onClickOverride?: () => void
  }) => (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 transition-colors hover:bg-primary/10 hover:text-primary"
      onMouseDown={(e) => {
        e.preventDefault();
        if (!onClickOverride && command) {
          executeCommand(command, value);
        } else if (onClickOverride) {
          onClickOverride();
        }
      }}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <style jsx global>{`
        .editor-area:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          cursor: text;
        }
        .editor-area a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
        .youtube-embed {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          max-width: 100%;
          margin: 20px 0;
          border-radius: 12px;
        }
        .youtube-embed iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }
      `}</style>
      
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 px-4 py-3">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/community" className="text-gray-500 hover:text-primary transition-colors">
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-medium text-gray-700 hidden sm:inline">Editor Postingan</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              saveStatus === 'Siap' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {saveStatus}
            </span>
            <Button
              size="sm"
              className="rounded-full px-6 shadow-md"
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Terbitkan
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl mt-8 px-4">
        {/* Title Input */}
        <div className="bg-white rounded-xl shadow-sm border mb-4 overflow-hidden">
          <input
            type="text"
            placeholder="Judul Postingan..."
            className="w-full px-6 py-5 text-3xl font-bold border-none focus:ring-0 focus:outline-none placeholder:text-gray-300 text-gray-800"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-t-xl border border-b-0 px-4 py-2 flex items-center flex-wrap gap-1 sticky top-[65px] z-40 shadow-sm">
          <ToolbarButton command="undo" icon={Undo} title="Undo" />
          <ToolbarButton command="redo" icon={Redo} title="Redo" />
          <div className="mx-2 h-6 w-px bg-border" />
          <ToolbarButton command="bold" icon={Bold} title="Tebal (Ctrl+B)" />
          <ToolbarButton command="italic" icon={Italic} title="Miring (Ctrl+I)" />
          <ToolbarButton command="underline" icon={Underline} title="Garis Bawah (Ctrl+U)" />
          <ToolbarButton command="strikeThrough" icon={Strikethrough} title="Coret" />
          <div className="mx-2 h-6 w-px bg-border" />
          <select
            onChange={(e) => executeCommand('formatBlock', e.target.value)}
            className="h-8 px-2 text-xs border rounded-md bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="P">Teks Normal</option>
            <option value="H1">Heading 1</option>
            <option value="H2">Heading 2</option>
            <option value="H3">Heading 3</option>
          </select>
          <div className="mx-2 h-6 w-px bg-border" />
          <ToolbarButton command="justifyLeft" icon={AlignLeft} title="Rata Kiri" />
          <ToolbarButton command="justifyCenter" icon={AlignCenter} title="Rata Tengah" />
          <ToolbarButton command="justifyRight" icon={AlignRight} title="Rata Kanan" />
          <div className="mx-2 h-6 w-px bg-border" />
          <ToolbarButton command="insertUnorderedList" icon={List} title="Daftar Bulat" />
          <ToolbarButton command="insertOrderedList" icon={ListOrdered} title="Daftar Angka" />
          <div className="mx-2 h-6 w-px bg-border" />
          <ToolbarButton command="formatBlock" value="blockquote" icon={Quote} title="Kutipan" />
          <div className="mx-2 h-6 w-px bg-border" />
          <ToolbarButton icon={LinkIcon} title="Sisipkan Link" onClickOverride={handleInsertLink} />
          <ToolbarButton icon={Gamepad2} title="Link Game MAIN Q" onClickOverride={handleInsertGameLink} />
          <ToolbarButton icon={Youtube} title="Embed YouTube" onClickOverride={handleInsertYoutube} />
          <div className="mx-2 h-6 w-px bg-border" />
          {/* ✅ NEW: Convert Markdown Button */}
          <ToolbarButton 
            icon={Wand2} 
            title="Konversi Markdown ke HTML" 
            onClickOverride={handleConvertMarkdown} 
          />
        </div>

        {/* Editor Area */}
        <div className="bg-white rounded-b-xl border border-t-0 p-8 min-h-[500px] shadow-sm">
          <div
            ref={editorRef}
            contentEditable
            onInput={updateCounts}
            onPaste={handlePaste}  // ✅ Auto-convert on paste
            className="editor-area prose prose-lg max-w-none focus:outline-none min-h-[400px] text-gray-800"
            data-placeholder="Mulai tulis artikel inspiratif Anda di sini... (Support paste dari AI dengan format Markdown)"
          />
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl shadow-sm border mt-6 p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2 uppercase tracking-wider">
            <Settings className="h-4 w-4" /> Pengaturan Postingan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">Kategori Utama</label>
              <Select onValueChange={setCategory} value={category}>
                <SelectTrigger className="w-full h-11">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendidikan">📚 Pendidikan</SelectItem>
                  <SelectItem value="Prompting">🤖 Prompting AI</SelectItem>
                  <SelectItem value="Tutorial">📖 Tutorial</SelectItem>
                  <SelectItem value="Tanya Jawab">❓ Tanya Jawab</SelectItem>
                  <SelectItem value="Review">⭐ Review Game</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">Label (Tag)</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Inovasi, Tips, AI (pisahkan dengan koma)"
                  className="pl-10 h-11"
                  value={labels}
                  onChange={(e) => setLabels(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium"><Type className="h-4 w-4" /> {wordCount} kata</span>
            <span className="flex items-center gap-1.5 font-medium"><FileText className="h-4 w-4" /> {charCount} karakter</span>
          </div>
          <div className="text-xs text-muted-foreground">
            💡 Tip: Paste dari AI akan otomatis dikonversi format Markdown-nya
          </div>
        </div>
      </main>

      {/* Modal Insert Link */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <LinkIcon className="h-5 w-5" /> Sisipkan Link
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">URL Link</label>
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://mainq.my.id/game/..."
                  className="h-11"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">Teks Link (Opsional)</label>
                <Input
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Klik di sini untuk main game"
                  className="h-11"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowLinkModal(false)} className="flex-1">
                  Batal
                </Button>
                <Button onClick={confirmInsertLink} className="flex-1">
                  Insert Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Insert YouTube */}
      {showYoutubeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-500" /> Embed YouTube
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">URL YouTube</label>
                <Input
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... atau youtu.be/..."
                  className="h-11"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Support: youtube.com/watch, youtu.be, atau video ID langsung
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowYoutubeModal(false)} className="flex-1">
                  Batal
                </Button>
                <Button onClick={confirmInsertYoutube} className="flex-1">
                  Embed Video
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
