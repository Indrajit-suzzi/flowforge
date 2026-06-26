import { useState, useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import DOMPurify from 'dompurify';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Code, Quote, Link as LinkIcon, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight,
  Undo, Redo, X
} from 'lucide-react';

const btnStyle = (active = false) => ({
  padding: '6px', background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
  border: active ? '1px solid rgba(59,130,246,0.3)' : 'none',
  color: active ? '#93c5fd' : '#64748b', cursor: 'pointer', borderRadius: '6px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all 0.15s ease'
});
const separatorStyle = { width: '1px', background: '#1e293b', margin: '0 4px' };

function Toolbar({ editor }) {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  const setLink = useCallback(() => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }
    setShowImageInput(false);
    setImageUrl('');
  }, [editor, imageUrl]);

  if (!editor) return null;

  return (
    <div style={{ display: 'flex', gap: '2px', padding: '8px', background: '#0a0f1e', borderBottom: '1px solid #1e293b', flexWrap: 'wrap', alignItems: 'center' }}>
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={btnStyle(editor.isActive('bold'))} title="Bold"><Bold style={{ width: '14px', height: '14px' }} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={btnStyle(editor.isActive('italic'))} title="Italic"><Italic style={{ width: '14px', height: '14px' }} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} style={btnStyle(editor.isActive('underline'))} title="Underline"><UnderlineIcon style={{ width: '14px', height: '14px' }} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} style={btnStyle(editor.isActive('strike'))} title="Strikethrough"><Strikethrough style={{ width: '14px', height: '14px' }} /></button>

      <div style={separatorStyle} />

      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} style={btnStyle(editor.isActive('heading', { level: 1 }))} title="Heading 1"><Heading1 style={{ width: '14px', height: '14px' }} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={btnStyle(editor.isActive('heading', { level: 2 }))} title="Heading 2"><Heading2 style={{ width: '14px', height: '14px' }} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} style={btnStyle(editor.isActive('heading', { level: 3 }))} title="Heading 3"><Heading3 style={{ width: '14px', height: '14px' }} /></button>

      <div style={separatorStyle} />

      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={btnStyle(editor.isActive('bulletList'))} title="Bullet List"><List style={{ width: '14px', height: '14px' }} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} style={btnStyle(editor.isActive('orderedList'))} title="Ordered List"><ListOrdered style={{ width: '14px', height: '14px' }} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} style={btnStyle(editor.isActive('blockquote'))} title="Blockquote"><Quote style={{ width: '14px', height: '14px' }} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} style={btnStyle(editor.isActive('codeBlock'))} title="Code Block"><Code style={{ width: '14px', height: '14px' }} /></button>

      <div style={separatorStyle} />

      <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} style={btnStyle(editor.isActive({ textAlign: 'left' }))} title="Align Left"><AlignLeft style={{ width: '14px', height: '14px' }} /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} style={btnStyle(editor.isActive({ textAlign: 'center' }))} title="Align Center"><AlignCenter style={{ width: '14px', height: '14px' }} /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} style={btnStyle(editor.isActive({ textAlign: 'right' }))} title="Align Right"><AlignRight style={{ width: '14px', height: '14px' }} /></button>

      <div style={separatorStyle} />

      <div style={{ position: 'relative' }}>
        <button type="button" onClick={() => { setShowLinkInput(!showLinkInput); setShowImageInput(false); if (!showLinkInput) { const prev = editor.getAttributes('link').href || ''; setLinkUrl(prev); } }} style={btnStyle(editor.isActive('link'))} title="Link">
          <LinkIcon style={{ width: '14px', height: '14px' }} />
        </button>
        {showLinkInput && (
          <div style={{ position: 'absolute', top: '100%', left: '0', marginTop: '4px', display: 'flex', gap: '4px', padding: '8px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', zIndex: 50, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', minWidth: '260px' }}>
            <input
              type="url"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              placeholder="https://..."
              style={{ flex: 1, padding: '6px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#f1f5f9', fontSize: '12px', outline: 'none' }}
              onKeyDown={e => { if (e.key === 'Enter') setLink(); if (e.key === 'Escape') setShowLinkInput(false); }}
              autoFocus
            />
            <button type="button" onClick={setLink} style={{ padding: '6px 10px', background: '#3b82f6', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', cursor: 'pointer' }}>Set</button>
            <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setShowLinkInput(false); }} style={{ padding: '6px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X style={{ width: '14px', height: '14px' }} /></button>
          </div>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <button type="button" onClick={() => { setShowImageInput(!showImageInput); setShowLinkInput(false); }} style={btnStyle()} title="Image">
          <ImageIcon style={{ width: '14px', height: '14px' }} />
        </button>
        {showImageInput && (
          <div style={{ position: 'absolute', top: '100%', left: '0', marginTop: '4px', display: 'flex', gap: '4px', padding: '8px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', zIndex: 50, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', minWidth: '260px' }}>
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="Image URL..."
              style={{ flex: 1, padding: '6px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#f1f5f9', fontSize: '12px', outline: 'none' }}
              onKeyDown={e => { if (e.key === 'Enter') addImage(); if (e.key === 'Escape') setShowImageInput(false); }}
              autoFocus
            />
            <button type="button" onClick={addImage} style={{ padding: '6px 10px', background: '#3b82f6', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', cursor: 'pointer' }}>Add</button>
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      <button type="button" onClick={() => editor.chain().focus().undo().run()} style={btnStyle()} title="Undo"><Undo style={{ width: '14px', height: '14px' }} /></button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} style={btnStyle()} title="Redo"><Redo style={{ width: '14px', height: '14px' }} /></button>
    </div>
  );
}

export default function RichTextEditor({ value, onChange, placeholder }) {
  const [isFocused, setIsFocused] = useState(false);
  const sanitizeJob = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        validate: (href) => !href.startsWith('javascript:'),
      }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: placeholder || 'Start typing...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const raw = editor.getHTML();
      if (sanitizeJob.current) {
        if ('cancelIdleCallback' in window) window.cancelIdleCallback(sanitizeJob.current);
        else clearTimeout(sanitizeJob.current);
      }
      const sanitize = () => {
        const clean = DOMPurify.sanitize(raw, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img', 'hr'], ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'rel', 'class', 'style', 'data-placeholder'], ALLOW_DATA_ATTR: false });
        onChange?.(clean);
      };
      sanitizeJob.current = 'requestIdleCallback' in window
        ? window.requestIdleCallback(sanitize, { timeout: 150 })
        : window.setTimeout(sanitize, 50);
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
      handleDOMEvents: {
        focus: () => setIsFocused(true),
        blur: () => setIsFocused(false),
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [value, editor]);

  useEffect(() => () => {
    if (!sanitizeJob.current) return;
    if ('cancelIdleCallback' in window) window.cancelIdleCallback(sanitizeJob.current);
    else clearTimeout(sanitizeJob.current);
  }, []);

  return (
    <div style={{ border: `1px solid ${isFocused ? '#3b82f6' : '#1e293b'}`, borderRadius: '8px', overflow: 'hidden', transition: 'border-color 0.15s ease' }}>
      <Toolbar editor={editor} />

      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 150 }} style={{ display: 'flex', gap: '2px', padding: '4px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={btnStyle(editor.isActive('bold'))}><Bold style={{ width: '12px', height: '12px' }} /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={btnStyle(editor.isActive('italic'))}><Italic style={{ width: '12px', height: '12px' }} /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} style={btnStyle(editor.isActive('underline'))}><UnderlineIcon style={{ width: '12px', height: '12px' }} /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} style={btnStyle(editor.isActive('strike'))}><Strikethrough style={{ width: '12px', height: '12px' }} /></button>
          <button type="button" onClick={() => { const url = editor.getAttributes('link').href; if (url) { editor.chain().focus().unsetLink().run(); } else { const link = window.prompt('Enter URL:'); if (link && !link.startsWith('javascript:')) editor.chain().focus().setLink({ href: link }).run(); } }} style={btnStyle(editor.isActive('link'))}><LinkIcon style={{ width: '12px', height: '12px' }} /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} style={btnStyle(editor.isActive('code'))}><Code style={{ width: '12px', height: '12px' }} /></button>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} style={{ minHeight: '150px' }} />

      <style>{`
        .tiptap-editor {
          min-height: 150px;
          padding: 12px;
          background: #0a0f1e;
          color: #f1f5f9;
          font-size: 14px;
          outline: none;
          line-height: 1.7;
        }
        .tiptap-editor p { margin: 0 0 8px; }
        .tiptap-editor h1, .tiptap-editor h2, .tiptap-editor h3 { margin: 16px 0 8px; font-weight: 700; color: #f8fafc; }
        .tiptap-editor h1 { font-size: 22px; }
        .tiptap-editor h2 { font-size: 18px; }
        .tiptap-editor h3 { font-size: 16px; }
        .tiptap-editor ul, .tiptap-editor ol { padding-left: 20px; margin: 8px 0; }
        .tiptap-editor li { margin: 2px 0; }
        .tiptap-editor blockquote {
          border-left: 3px solid #3b82f6; padding: 8px 16px; margin: 8px 0;
          background: rgba(59,130,246,0.06); border-radius: 0 6px 6px 0;
          color: #94a3b8; font-style: italic;
        }
        .tiptap-editor pre {
          background: #0f172a; color: #e2e8f0; padding: 12px; border-radius: 8px;
          font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 13px;
          overflow-x: auto; border: 1px solid #1e293b; margin: 8px 0;
        }
        .tiptap-editor pre code { background: none; color: inherit; padding: 0; font-size: inherit; }
        .tiptap-editor code {
          background: #1e293b; padding: 2px 6px; border-radius: 4px;
          font-size: 13px; color: #f472b6; font-family: ui-monospace, monospace;
        }
        .tiptap-editor a { color: #60a5fa; text-decoration: underline; cursor: pointer; }
        .tiptap-editor img { max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0; }
        .tiptap-editor hr { border: none; border-top: 1px solid #1e293b; margin: 16px 0; }
        .tiptap-editor p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left; color: #475569; pointer-events: none; height: 0;
        }
        .tiptap-editor ul { list-style-type: disc; }
        .tiptap-editor ol { list-style-type: decimal; }
        .tiptap-editor [style*="text-align: center"] { text-align: center; }
        .tiptap-editor [style*="text-align: right"] { text-align: right; }
      `}</style>
    </div>
  );
}
