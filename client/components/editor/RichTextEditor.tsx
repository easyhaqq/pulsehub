'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { Highlight } from '@tiptap/extension-highlight';
import { Youtube } from '@tiptap/extension-youtube';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { CharacterCount } from '@tiptap/extension-character-count';
import { useEffect, useCallback, useState } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, Heading4,
  List, ListOrdered, Quote, Minus, Link as LinkIcon,
  Image as ImageIcon, MonitorPlay as YoutubeIcon, Table as TableIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Highlighter, Undo, Redo, Code, Eye, Smartphone
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  onReadTime?: (mins: number) => void;
  postId?: number;
}

function ToolbarButton({
  onClick, active, disabled, title, children
}: {
  onClick: () => void; active?: boolean; disabled?: boolean;
  title: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg transition-all text-sm ${
        active
          ? 'bg-[#E11D48] text-white'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  content, onChange, onReadTime, postId
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [preview, setPreview] = useState<'desktop' | 'mobile' | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [internalSearch, setInternalSearch] = useState('');
  const [internalResults, setInternalResults] = useState<{ id: number; title: string; slug: string }[]>([]);
  const [showInternalSearch, setShowInternalSearch] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: 'Start writing your story...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Youtube.configure({ 
        width: 640, 
        height: 480,
        HTMLAttributes: {
          class: 'w-full',
        }
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CharacterCount,
    ],
    content,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChange(html);
      const words = editor.getText().split(/\s+/).filter(Boolean).length;
      const mins = Math.max(1, Math.ceil(words / 200));
      onReadTime?.(mins);
    },
  });

  const autosave = useCallback(async () => {
    if (!postId || !editor) return;
    try {
      await fetch(`/api/posts/${postId}/autosave`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editor.getHTML() }),
      });
      setAutoSaveStatus('Autosaved ' + new Date().toLocaleTimeString());
    } catch {
      setAutoSaveStatus('Autosave failed');
    }
  }, [postId, editor]);

  useEffect(() => {
    if (!postId) return;
    const interval = setInterval(autosave, 30000);
    return () => clearInterval(interval);
  }, [autosave, postId]);

  useEffect(() => {
    if (!internalSearch.trim()) { setInternalResults([]); return; }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/posts/search/internal?q=${encodeURIComponent(internalSearch)}`, {
        credentials: 'include',
      });
      const data = await res.json();
      setInternalResults(data);
    }, 300);
    return () => clearTimeout(timer);
  }, [internalSearch]);

  function insertLink() {
    if (!linkUrl || !editor) return;
    editor.chain().focus().setLink({ href: linkUrl }).run();
    setLinkUrl('');
    setShowLinkInput(false);
  }

  function insertYoutube() {
    if (!youtubeUrl || !editor) return;
    editor.commands.setYoutubeVideo({ src: youtubeUrl });
    setYoutubeUrl('');
    setShowYoutubeInput(false);
  }

  function insertImage() {
    if (!imageUrl || !editor) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl('');
    setShowImageInput(false);
  }

  function insertInternalLink(slug: string, title: string) {
    if (!editor) return;
    editor.chain().focus().setLink({ href: `/news/${slug}` }).insertContent(title).run();
    setShowInternalSearch(false);
    setInternalSearch('');
  }

  if (!editor) return null;

  const wordCount = editor.storage.characterCount?.words() ?? 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">

      {/* Toolbar */}
      <div className="border-b border-slate-200 bg-slate-50 p-2 flex flex-wrap items-center gap-0.5">

        {/* History */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-slate-200 mr-1">
          <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
            <Undo size={15} />
          </ToolbarButton>
          <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
            <Redo size={15} />
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-slate-200 mr-1">
          {([1,2,3,4] as const).map(level => (
            <ToolbarButton
              key={level}
              title={`Heading ${level}`}
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
              active={editor.isActive('heading', { level })}
            >
              {level === 1 ? <Heading1 size={15} /> :
               level === 2 ? <Heading2 size={15} /> :
               level === 3 ? <Heading3 size={15} /> :
               <span className="text-xs font-bold">H4</span>}
            </ToolbarButton>
          ))}
        </div>

        {/* Text formatting */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-slate-200 mr-1">
          <ToolbarButton title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
            <Bold size={15} />
          </ToolbarButton>
          <ToolbarButton title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
            <Italic size={15} />
          </ToolbarButton>
          <ToolbarButton title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}>
            <UnderlineIcon size={15} />
          </ToolbarButton>
          <ToolbarButton title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}>
            <Strikethrough size={15} />
          </ToolbarButton>
          <ToolbarButton title="Highlight" onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')}>
            <Highlighter size={15} />
          </ToolbarButton>
          <ToolbarButton title="Code" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')}>
            <Code size={15} />
          </ToolbarButton>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-slate-200 mr-1">
          <ToolbarButton title="Align Left" onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })}>
            <AlignLeft size={15} />
          </ToolbarButton>
          <ToolbarButton title="Align Center" onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })}>
            <AlignCenter size={15} />
          </ToolbarButton>
          <ToolbarButton title="Align Right" onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })}>
            <AlignRight size={15} />
          </ToolbarButton>
          <ToolbarButton title="Justify" onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })}>
            <AlignJustify size={15} />
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-slate-200 mr-1">
          <ToolbarButton title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
            <List size={15} />
          </ToolbarButton>
          <ToolbarButton title="Numbered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
            <ListOrdered size={15} />
          </ToolbarButton>
          <ToolbarButton title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
            <Quote size={15} />
          </ToolbarButton>
          <ToolbarButton title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <Minus size={15} />
          </ToolbarButton>
        </div>

        {/* Media & Links */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-slate-200 mr-1">
          <ToolbarButton title="Insert Link" onClick={() => setShowLinkInput(!showLinkInput)} active={editor.isActive('link')}>
            <LinkIcon size={15} />
          </ToolbarButton>
          <ToolbarButton title="Insert Image" onClick={() => setShowImageInput(!showImageInput)}>
            <ImageIcon size={15} />
          </ToolbarButton>
          <ToolbarButton title="Embed YouTube" onClick={() => setShowYoutubeInput(!showYoutubeInput)}>
            <YoutubeIcon size={15} />
          </ToolbarButton>
          <ToolbarButton title="Insert Table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
            <TableIcon size={15} />
          </ToolbarButton>
        </div>

        {/* Internal link search */}
        <ToolbarButton title="Internal Link" onClick={() => setShowInternalSearch(!showInternalSearch)}>
          <span className="text-xs font-bold">🔗</span>
        </ToolbarButton>

        {/* Preview toggle */}
        <div className="flex items-center gap-0.5 ml-auto">
          <ToolbarButton title="Desktop Preview" onClick={() => setPreview(preview === 'desktop' ? null : 'desktop')} active={preview === 'desktop'}>
            <Eye size={15} />
          </ToolbarButton>
          <ToolbarButton title="Mobile Preview" onClick={() => setPreview(preview === 'mobile' ? null : 'mobile')} active={preview === 'mobile'}>
            <Smartphone size={15} />
          </ToolbarButton>
        </div>
      </div>

      {/* Inline inputs */}
      {showLinkInput && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b border-blue-100">
          <LinkIcon size={14} className="text-blue-500 flex-shrink-0" />
          <input
            autoFocus
            type="url"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && insertLink()}
            placeholder="https://example.com"
            className="flex-1 bg-transparent text-sm outline-none text-slate-800"
          />
          <button onClick={insertLink} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg">Insert</button>
          <button onClick={() => editor.chain().focus().unsetLink().run()} className="text-xs text-red-500">Remove</button>
          <button onClick={() => setShowLinkInput(false)} className="text-xs text-slate-400">✕</button>
        </div>
      )}

      {showImageInput && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border-b border-green-100">
          <ImageIcon size={14} className="text-green-500 flex-shrink-0" />
          <input
            autoFocus
            type="url"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && insertImage()}
            placeholder="https://images.unsplash.com/..."
            className="flex-1 bg-transparent text-sm outline-none text-slate-800"
          />
          <button onClick={insertImage} className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg">Insert</button>
          <button onClick={() => setShowImageInput(false)} className="text-xs text-slate-400">✕</button>
        </div>
      )}

      {showYoutubeInput && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border-b border-red-100">
          <YoutubeIcon size={14} className="text-red-500 flex-shrink-0" />
          <input
            autoFocus
            type="url"
            value={youtubeUrl}
            onChange={e => setYoutubeUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && insertYoutube()}
            placeholder="https://youtube.com/watch?v=..."
            className="flex-1 bg-transparent text-sm outline-none text-slate-800"
          />
          <button onClick={insertYoutube} className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg">Embed</button>
          <button onClick={() => setShowYoutubeInput(false)} className="text-xs text-slate-400">✕</button>
        </div>
      )}

      {showInternalSearch && (
        <div className="px-3 py-2 bg-purple-50 border-b border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-purple-700">Search PulseHub articles to link:</span>
            <button onClick={() => setShowInternalSearch(false)} className="text-xs text-slate-400 ml-auto">✕</button>
          </div>
          <input
            autoFocus
            type="text"
            value={internalSearch}
            onChange={e => setInternalSearch(e.target.value)}
            placeholder="Type article title..."
            className="w-full bg-white border border-purple-200 rounded-lg px-3 py-1.5 text-sm outline-none"
          />
          {internalResults.length > 0 && (
            <div className="mt-1 bg-white rounded-lg border border-purple-200 overflow-hidden">
              {internalResults.map(r => (
                <button
                  key={r.id}
                  onClick={() => insertInternalLink(r.slug, r.title)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-purple-50 border-b border-slate-100 last:border-0"
                >
                  {r.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Editor / Preview */}
      {preview ? (
        <div className={`p-6 ${preview === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
          <div className="text-xs text-center text-slate-400 mb-3 uppercase tracking-wider">
            {preview === 'mobile' ? '📱 Mobile Preview' : '🖥 Desktop Preview'}
          </div>
          <div
            className="prose-article"
            dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
          />
        </div>
      ) : (
        <>
          {editor && (
            <BubbleMenu editor={editor}>
              <div className="flex items-center gap-1 bg-[#0F172A] rounded-lg px-2 py-1.5 shadow-xl">
                <button onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`p-1 rounded text-white ${editor.isActive('bold') ? 'bg-white/20' : ''}`}>
                  <Bold size={13} />
                </button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`p-1 rounded text-white ${editor.isActive('italic') ? 'bg-white/20' : ''}`}>
                  <Italic size={13} />
                </button>
                <button onClick={() => setShowLinkInput(true)}
                  className={`p-1 rounded text-white ${editor.isActive('link') ? 'bg-white/20' : ''}`}>
                  <LinkIcon size={13} />
                </button>
                <button onClick={() => editor.chain().focus().toggleHighlight().run()}
                  className={`p-1 rounded text-white ${editor.isActive('highlight') ? 'bg-white/20' : ''}`}>
                  <Highlighter size={13} />
                </button>
              </div>
            </BubbleMenu>
          )}
          <EditorContent
            editor={editor}
            className="min-h-[400px] px-6 py-4 prose-article focus-within:outline-none"
          />
        </>
      )}

      {/* Footer bar */}
      <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span>{readTime} min read</span>
          <span>{editor.storage.characterCount?.characters() ?? 0} characters</span>
        </div>
        {autoSaveStatus && <span className="text-emerald-600">{autoSaveStatus}</span>}
      </div>
    </div>
  );
}