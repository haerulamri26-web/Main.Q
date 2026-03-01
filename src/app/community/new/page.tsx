// ============================================================================
// MARKDOWN PARSER - Convert Markdown to HTML (FIXED ORDER)
// ============================================================================
function convertMarkdownToHtml(text: string): string {
  if (!text) return '';
  
  // Normalize line endings
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  const lines = text.split('\n');
  const output: string[] = [];
  
  // State tracking
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';
  let listItems: string[] = [];
  let inBlockquote = false;
  let blockquoteContent: string[] = [];
  let paragraphLines: string[] = [];
  
  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      const content = paragraphLines.join('<br>');
      let formatted = applyInlineFormatting(content);
      output.push(`<p class="mb-4">${formatted}</p>`);
      paragraphLines = [];
    }
  };
  
  const flushList = () => {
    if (inList && listItems.length > 0) {
      const tag = listType === 'ul' ? 'ul' : 'ol';
      output.push(`<${tag} class="list-disc list-inside my-4">${listItems.join('')}</${tag}>`);
      listItems = [];
      inList = false;
    }
  };
  
  const flushBlockquote = () => {
    if (inBlockquote && blockquoteContent.length > 0) {
      const content = blockquoteContent.join('<br>');
      let formatted = applyInlineFormatting(content);
      output.push(`<blockquote class="border-l-4 border-primary bg-muted/30 p-4 my-4 rounded-r-lg">${formatted}</blockquote>`);
      blockquoteContent = [];
      inBlockquote = false;
    }
  };
  
  const applyInlineFormatting = (text: string): string => {
    let result = text;
    
    // Code inline (protect first)
    const inlineCodes: string[] = [];
    result = result.replace(/`([^`]+)`/g, (match, code) => {
      inlineCodes.push(code);
      return `%%INLINECODE${inlineCodes.length - 1}%%`;
    });
    
    // Bold
    result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    
    // Italic
    result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    result = result.replace(/(?<!\w)_([^_]+)_(?!\w)/g, '<em>$1</em>');
    
    // Strikethrough
    result = result.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    
    // Links
    result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>');
    
    // Images
    result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />');
    
    // Restore inline code
    result = result.replace(/%%INLINECODE(\d+)%%/g, (match, index) => {
      return `<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">${inlineCodes[parseInt(index)]}</code>`;
    });
    
    return result;
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Code blocks
    if (trimmedLine.startsWith('```')) {
      if (!inCodeBlock) {
        flushParagraph();
        flushList();
        flushBlockquote();
        inCodeBlock = true;
        codeBlockContent = [];
      } else {
        const code = codeBlockContent.join('\n');
        output.push(`<pre class="bg-zinc-900 text-zinc-100 p-4 rounded-lg my-4 overflow-x-auto"><code>${code}</code></pre>`);
        inCodeBlock = false;
        codeBlockContent = [];
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }
    
    // Headers
    const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      flushParagraph();
      flushList();
      flushBlockquote();
      const level = headerMatch[1].length;
      const content = applyInlineFormatting(headerMatch[2]);
      const sizes: Record<number, string> = {
        1: 'text-3xl font-bold mb-4',
        2: 'text-2xl font-bold mb-4',
        3: 'text-xl font-bold mb-3',
        4: 'text-lg font-bold mb-3',
        5: 'text-base font-bold mb-2',
        6: 'text-sm font-bold mb-2'
      };
      output.push(`<h${level} class="${sizes[level]}">${content}</h${level}>`);
      continue;
    }
    
    // Blockquotes
    if (trimmedLine.startsWith('>')) {
      flushParagraph();
      flushList();
      inBlockquote = true;
      blockquoteContent.push(trimmedLine.substring(1).trim());
      continue;
    } else if (inBlockquote && trimmedLine === '') {
      flushBlockquote();
      continue;
    }
    
    // Unordered lists
    const ulMatch = trimmedLine.match(/^[\-\*]\s+(.+)$/);
    if (ulMatch) {
      flushParagraph();
      flushBlockquote();
      if (!inList || listType !== 'ul') {
        flushList();
        inList = true;
        listType = 'ul';
      }
      const content = applyInlineFormatting(ulMatch[1]);
      listItems.push(`<li class="ml-4">${content}</li>`);
      continue;
    }
    
    // Ordered lists
    const olMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      flushParagraph();
      flushBlockquote();
      if (!inList || listType !== 'ol') {
        flushList();
        inList = true;
        listType = 'ol';
      }
      const content = applyInlineFormatting(olMatch[1]);
      listItems.push(`<li class="ml-4">${content}</li>`);
      continue;
    }
    
    // Horizontal rules
    if (/^[\-\*]{3,}$/.test(trimmedLine)) {
      flushParagraph();
      flushList();
      flushBlockquote();
      output.push('<hr class="my-6 border-t" />');
      continue;
    }
    
    // Empty line
    if (trimmedLine === '') {
      flushParagraph();
      flushList();
      flushBlockquote();
      continue;
    }
    
    // Regular text
    flushList();
    flushBlockquote();
    paragraphLines.push(applyInlineFormatting(trimmedLine));
  }
  
  // Flush remaining
  flushParagraph();
  flushList();
  flushBlockquote();
  
  if (inCodeBlock && codeBlockContent.length > 0) {
    const code = codeBlockContent.join('\n');
    output.push(`<pre class="bg-zinc-900 text-zinc-100 p-4 rounded-lg my-4 overflow-x-auto"><code>${code}</code></pre>`);
  }
  
  // Join and clean
  let html = output.join('\n');
  html = html.replace(/<p class="mb-4"><\/p>/g, '');
  html = html.replace(/<p class="mb-4"><br><\/p>/g, '');
  
  return html.trim();
}

// ============================================================================
// HELPER: Clean AI Formatting
// ============================================================================
function cleanAIFormatting(text: string): string {
  if (!text) return '';
  
  text = text.replace(/^(Tentu|Berikut|Ini|Here|This is|Sure|Of course)[\s\S]*?[:\-]\s*/i, '');
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
  text = text.split('\n').map(line => line.trimEnd()).join('\n').trim();
  
  return text;
}

function htmlToPlainText(html: string): string {
  if (typeof window === 'undefined') return '';
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.innerText;
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
    if (editorRef.current) {
      editorRef.current.focus();
    }
    updateCounts();
  };

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

  const handleInsertGameLink = () => {
    setLinkUrl('https://mainq.my.id/game/');
    setLinkText('Mainkan Game Edukasi Ini');
    setShowLinkModal(true);
  };

  // ✅ FIXED: Paste Handler with proper order
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    const pastedText = e.clipboardData.getData('text/plain');
    
    if (!pastedText) return;
    
    const cleanedText = cleanAIFormatting(pastedText);
    const htmlContent = convertMarkdownToHtml(cleanedText);
    
    if (typeof document !== 'undefined') {
      const editor = editorRef.current;
      if (!editor) return;
      
      editor.focus();
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        // Create a wrapper div
        const wrapper = document.createElement('div');
        wrapper.innerHTML = htmlContent;
        
        // Get all child nodes as array
        const nodes = Array.from(wrapper.childNodes);
        
        // Insert each node in order
        nodes.forEach((node, index) => {
          if (index === 0) {
            range.insertNode(node);
          } else {
            range.insertNode(node);
          }
          range.collapse(false);
        });
        
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editor.innerHTML += htmlContent;
      }
      
      updateCounts();
      
      toast({ 
        title: '✅ Markdown dikonversi!', 
        description: 'Format berhasil dikonversi ke HTML.' 
      });
    }
  };

  const handleConvertMarkdown = () => {
    if (typeof document === 'undefined') return;
    
    const editor = editorRef.current;
    if (!editor) return;
    
    const currentContent = editor.innerHTML;
    
    const hasMarkdown = /(\*\*|\_\_|^#|\-\s|\d+\.\s|\[.*\]\(.*\)|\!\[.*\]\(.*\))/m.test(currentContent);
    
    if (!hasMarkdown) {
      toast({ 
        variant: 'destructive', 
        title: 'Tidak ada Markdown terdeteksi',
        description: 'Konten sudah dalam format HTML.'
      });
      return;
    }
    
    const textContent = editor.innerText;
    const convertedHtml = convertMarkdownToHtml(textContent);
    
    editor.innerHTML = convertedHtml;
    updateCounts();
    
    toast({ 
      title: '✅ Konversi selesai!', 
      description: 'Semua format Markdown telah dikonversi.' 
    });
  };

  const handleClearFormatting = () => {
    if (typeof document === 'undefined') return;
    
    const editor = editorRef.current;
    if (!editor) return;
    
    if (confirm('Hapus semua formatting?')) {
      const textContent = editor.innerText;
      editor.innerHTML = `<p class="mb-4">${textContent}</p>`;
      updateCounts();
      toast({ title: '✅ Formatting dihapus' });
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
        .editor-area h1, .editor-area h2, .editor-area h3,
        .editor-area h4, .editor-area h5, .editor-area h6 {
          margin: 0;
          line-height: 1.3;
        }
        .editor-area ul, .editor-area ol {
          margin: 0;
          padding-left: 1.5rem;
        }
        .editor-area blockquote {
          margin: 0;
        }
        .editor-area pre {
          margin: 0;
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
          <ToolbarButton icon={Wand2} title="Konversi Markdown ke HTML" onClickOverride={handleConvertMarkdown} />
          <ToolbarButton icon={Eraser} title="Hapus Formatting" onClickOverride={handleClearFormatting} />
        </div>

        <div className="bg-white rounded-b-xl border border-t-0 p-8 min-h-[500px] shadow-sm">
          <div
            ref={editorRef}
            contentEditable
            onInput={updateCounts}
            onPaste={handlePaste}
            className="editor-area prose prose-lg max-w-none focus:outline-none min-h-[400px] text-gray-800"
            data-placeholder="Mulai tulis artikel inspiratif Anda di sini... (Support paste dari AI dengan format Markdown)"
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
