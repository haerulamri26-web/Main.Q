'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2, Undo, Redo, Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, List, ListOrdered,
  Link as LinkIcon, Type, ChevronLeft, FileText, Settings, Hash
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ============================================================================
// HELPER: Generate Slug dari Judul (Untuk URL Artikel)
// ============================================================================
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function EditArticlePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [labels, setLabels] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [activeFormats, setActiveFormats] = useState({
    bold: false, italic: false, underline: false, strikeThrough: false,
    justifyLeft: false, justifyCenter: false, justifyRight: false,
    insertUnorderedList: false, insertOrderedList: false,
  });

  const editorRef = useRef<HTMLDivElement>(null);

  const articleRef = useMemoFirebase(() => {
    if (!firestore || !articleId) return null;
    return doc(firestore, 'articles', articleId);
  }, [firestore, articleId]);

  const { data: article, isLoading: isArticleLoading } = useDoc(articleRef);

  useEffect(() => {
    if (article && editorRef.current && !title) {
      setTitle(article.title);
      setCategory(article.category);
      setLabels(article.labels?.join(', ') || '');
      editorRef.current.innerHTML = article.content;
      updateCounts();
    }
  }, [article, title]);

  const checkActiveFormats = useCallback(() => {
    if (typeof document === 'undefined') return;
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
    });
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => checkActiveFormats();
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [checkActiveFormats]);

  const updateCounts = useCallback(() => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
      setWordCount(words);
      setCharCount(text.length);
    }
  }, []);

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (typeof document === 'undefined') return;
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateCounts();
    checkActiveFormats();
  };

  // ✅ FIX: Insert Link TIDAK LONCAT ke bawah (Mengikuti Kursor)
  const addLink = () => {
    const url = prompt('Masukkan URL:', 'https://');
    if (!url || url === 'https://') return;

    if (typeof document === 'undefined') return;
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      // ✅ FIX: Gunakan range aktif (posisi kursor saat ini)
      const range = selection.getRangeAt(0);
      range.deleteContents();

      const selectedText = selection.toString().trim();
      const linkText = selectedText || url;

      const link = document.createElement('a');
      link.href = url;
      link.innerText = linkText;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'text-primary underline';

      // ✅ Insert di posisi kursor, bukan di akhir
      range.insertNode(link);

      // ✅ Pindahkan kursor ke setelah link
      range.setStartAfter(link);
      range.setEndAfter(link);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    updateCounts();
    checkActiveFormats();
  };

  const onUpdate = async () => {
    if (!firestore || !user || !article) return;
    const content = editorRef.current?.innerHTML || '';
    if (!title.trim() || !category || !content.trim()) {
      toast({ variant: 'destructive', title: 'Data tidak lengkap', description: 'Pastikan judul, kategori, dan konten terisi.' });
      return;
    }
    setIsSubmitting(true);
    try {
      // ✅ Generate slug dari judul untuk URL artikel
      const slug = generateSlug(title);
      
      await updateDoc(doc(firestore, 'articles', articleId), {
        title,
        category,
        content,
        slug, // Simpan slug untuk URL yang rapi
        labels: labels.split(',').map(l => l.trim()).filter(l => l),
      });
      toast({ title: 'Artikel Diperbarui!', description: 'Perubahan telah disimpan ke dalam sistem.' });
      router.push('/profile');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Gagal Memperbarui', description: e.message });
      setIsSubmitting(false);
    }
  };

  if (isUserLoading || isArticleLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  if (!user || (article && user.uid !== article.userId)) return <div className="flex justify-center py-20">Akses Ditolak</div>;

  const ToolbarButton = ({ command, value, icon: Icon, title, isActive, onClickOverride }: {
    command?: string, value?: string, icon: any, title: string, isActive?: boolean, onClickOverride?: () => void
  }) => (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 rounded-md transition-colors",
        isActive && "bg-primary/10 text-primary hover:bg-primary/20"
      )}
      onMouseDown={(e) => {
        e.preventDefault();
        onClickOverride ? onClickOverride() : executeCommand(command, value);
      }}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <style>{`
        .editor-area:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          cursor: text;
        }
        .editor-area a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
        .editor-area h1 {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        .editor-area h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
      `}</style>

      <header className="bg-white border-b sticky top-0 z-50 px-4 py-3 shadow-sm">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="rounded-full">
              <Link href="/profile">
                <ChevronLeft className="h-6 w-6" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-bold font-headline hidden sm:inline">Edit Artikel</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-full px-6 hidden sm:flex" asChild>
              <Link href="/profile">Batal</Link>
            </Button>
            <Button size="default" className="rounded-full px-8 shadow-md" onClick={onUpdate} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Simpan
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl mt-8 px-4 animate-in fade-in duration-500">
        <div className="bg-white rounded-2xl shadow-sm border p-1 mb-4 overflow-hidden focus-within:ring-2 ring-primary/20 transition-all">
          <input
            type="text"
            placeholder="Judul Artikel..."
            className="w-full px-6 py-6 text-3xl font-bold border-none focus:outline-none placeholder:text-slate-300 text-slate-800"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-t-2xl border-x border-t px-4 py-2 flex items-center flex-wrap gap-1 sticky top-[65px] z-40 shadow-sm border-b">
          <ToolbarButton command="undo" icon={Undo} title="Undo" />
          <ToolbarButton command="redo" icon={Redo} title="Redo" />
          <div className="mx-2 h-6 w-px bg-border" />
          <ToolbarButton command="bold" icon={Bold} title="Tebal" isActive={activeFormats.bold} />
          <ToolbarButton command="italic" icon={Italic} title="Miring" isActive={activeFormats.italic} />
          <ToolbarButton command="underline" icon={Underline} title="Garis Bawah" isActive={activeFormats.underline} />
          <div className="mx-2 h-6 w-px bg-border" />
          <select
            onChange={(e) => executeCommand('formatBlock', e.target.value)}
            className="h-8 px-2 text-xs border rounded-md bg-transparent cursor-pointer focus:ring-1 focus:ring-primary"
          >
            <option value="P">Normal</option>
            <option value="H1">H1 - Judul Utama</option>
            <option value="H2">H2 - Sub Judul</option>
            <option value="H3">H3 - Poin Penting</option>
          </select>
          <div className="mx-2 h-6 w-px bg-border" />
          <ToolbarButton command="justifyLeft" icon={AlignLeft} title="Rata Kiri" isActive={activeFormats.justifyLeft} />
          <ToolbarButton command="justifyCenter" icon={AlignCenter} title="Rata Tengah" isActive={activeFormats.justifyCenter} />
          <ToolbarButton command="insertUnorderedList" icon={List} title="List" isActive={activeFormats.insertUnorderedList} />
          <ToolbarButton icon={LinkIcon} title="Link" onClickOverride={addLink} />
        </div>

        <div className="bg-white rounded-b-2xl border-x border-b p-8 min-h-[500px] shadow-sm focus-within:ring-2 ring-primary/20 ring-inset transition-all">
          <div
            ref={editorRef}
            contentEditable
            onInput={updateCounts}
            onKeyUp={checkActiveFormats}
            onMouseUp={checkActiveFormats}
            className="editor-area prose prose-lg md:prose-xl max-w-none focus:outline-none min-h-[400px] text-slate-700"
            data-placeholder="Mulai tulis artikel inspiratif Anda..."
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border mt-6 p-8 grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
              <Settings className="h-4 w-4" /> Kategori Artikel
            </label>
            <Select onValueChange={setCategory} value={category}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendidikan">Pendidikan</SelectItem>
                <SelectItem value="Prompting">Prompting</SelectItem>
                <SelectItem value="Tutorial">Tutorial</SelectItem>
                <SelectItem value="Tanya Jawab">Tanya Jawab</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
              <Hash className="h-4 w-4" /> Label (Tag)
            </label>
            <Input
              placeholder="Inovasi, Tips, Kurikulum (pisahkan koma)"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center text-slate-400 text-xs px-2">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5" /> {wordCount} kata
            </span>
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> {charCount} karakter
            </span>
          </div>
          <span>ID: {articleId}</span>
        </div>
      </main>
    </div>
  );
}
