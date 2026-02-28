
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
  Link as LinkIcon, Type, ChevronLeft, FileText, Settings, Hash
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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
  
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });

  const editorRef = useRef<HTMLDivElement>(null);

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
    if (editorRef.current) {
      editorRef.current.focus();
    }
    
    const handleSelectionChange = () => {
      checkActiveFormats();
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [checkActiveFormats]);

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
    checkActiveFormats();
  };

  const addLink = () => {
    if (typeof window === 'undefined') return;
    
    const selection = window.getSelection();
    const editor = editorRef.current;
    if (!editor || !selection) return;

    const url = prompt('Masukkan URL Link Game atau Referensi:', 'https://');
    
    if (url && url !== 'https://') {
      editor.focus();
      
      // If user selected text, wrap it with <a>
      if (selection.toString().length > 0) {
        document.execCommand('createLink', false, url);
      } else {
        // If no selection, insert the URL as clickable text
        const link = document.createElement('a');
        link.href = url;
        link.innerText = url;
        link.target = '_blank';
        link.style.color = 'hsl(var(--primary))';
        link.style.textDecoration = 'underline';
        
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(link);
          
          // Move cursor after the inserted link
          range.setStartAfter(link);
          range.setEndAfter(link);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          editor.appendChild(link);
        }
      }
      updateCounts();
      checkActiveFormats();
    }
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
      router.push('/community');
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
    isActive,
    onClickOverride
  }: { 
    command?: string, 
    value?: string, 
    icon: any, 
    title: string,
    isActive?: boolean,
    onClickOverride?: () => void
  }) => (
    <Button 
      variant="ghost" 
      size="icon" 
      className={cn(
        "h-8 w-8 transition-colors",
        isActive && "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
      )} 
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
      `}</style>

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
        <div className="bg-white rounded-xl shadow-sm border mb-4 overflow-hidden">
          <input 
            type="text" 
            placeholder="Judul Postingan..." 
            className="w-full px-6 py-5 text-3xl font-bold border-none focus:ring-0 focus:outline-none placeholder:text-gray-300 text-gray-800"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-t-xl border border-b-0 px-4 py-2 flex items-center flex-wrap gap-1 sticky top-[65px] z-40 shadow-sm">
          <ToolbarButton command="undo" icon={Undo} title="Undo" />
          <ToolbarButton command="redo" icon={Redo} title="Redo" />
          
          <div className="mx-2 h-6 w-px bg-border" />
          
          <ToolbarButton command="bold" icon={Bold} title="Tebal" isActive={activeFormats.bold} />
          <ToolbarButton command="italic" icon={Italic} title="Miring" isActive={activeFormats.italic} />
          <ToolbarButton command="underline" icon={Underline} title="Garis Bawah" isActive={activeFormats.underline} />
          <ToolbarButton command="strikeThrough" icon={Strikethrough} title="Coret" isActive={activeFormats.strikeThrough} />
          
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

          <select 
            onChange={(e) => executeCommand('fontSize', e.target.value)}
            className="h-8 px-2 text-xs border rounded-md bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="3">Ukuran</option>
            <option value="2">Sedang</option>
            <option value="3">Normal</option>
            <option value="5">Besar</option>
            <option value="7">Sangat Besar</option>
          </select>

          <div className="mx-2 h-6 w-px bg-border" />

          <ToolbarButton command="justifyLeft" icon={AlignLeft} title="Rata Kiri" isActive={activeFormats.justifyLeft} />
          <ToolbarButton command="justifyCenter" icon={AlignCenter} title="Rata Tengah" isActive={activeFormats.justifyCenter} />
          <ToolbarButton command="justifyRight" icon={AlignRight} title="Rata Kanan" isActive={activeFormats.justifyRight} />

          <div className="mx-2 h-6 w-px bg-border" />

          <ToolbarButton command="insertUnorderedList" icon={List} title="Daftar Bulat" isActive={activeFormats.insertUnorderedList} />
          <ToolbarButton command="insertOrderedList" icon={ListOrdered} title="Daftar Angka" isActive={activeFormats.insertOrderedList} />
          
          <div className="mx-2 h-6 w-px bg-border" />

          <ToolbarButton icon={LinkIcon} title="Sisipkan Link Game" onClickOverride={addLink} />
        </div>

        <div className="bg-white rounded-b-xl border border-t-0 p-8 min-h-[500px] shadow-sm">
          <div 
            ref={editorRef}
            contentEditable
            onInput={updateCounts}
            onKeyUp={checkActiveFormats}
            onMouseUp={checkActiveFormats}
            className="editor-area prose prose-lg max-w-none focus:outline-none min-h-[400px] text-gray-800"
            data-placeholder="Mulai tulis artikel inspiratif Anda di sini..."
          />
        </div>

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
                  <SelectItem value="Pendidikan">Pendidikan</SelectItem>
                  <SelectItem value="Prompting">Prompting</SelectItem>
                  <SelectItem value="Tutorial">Tutorial</SelectItem>
                  <SelectItem value="Tanya Jawab">Tanya Jawab</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">Label (Tag)</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Inovasi, Tips (pisahkan dengan koma)" 
                  className="pl-10 h-11"
                  value={labels}
                  onChange={(e) => setLabels(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium"><Type className="h-4 w-4" /> {wordCount} kata</span>
            <span className="flex items-center gap-1.5 font-medium"><FileText className="h-4 w-4" /> {charCount} karakter</span>
          </div>
        </div>
      </main>
    </div>
  );
}
