import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Code, Heading1, Heading2 } from 'lucide-react';

export default function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    if (onChange) onChange(editorRef.current.innerHTML);
  };

  const handleInput = () => {
    if (onChange) onChange(editorRef.current.innerHTML);
  };

  const btnStyle = { padding: '6px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', borderRadius: '4px' };

  return (
    <div style={{ border: `1px solid ${isFocused ? '#3b82f6' : '#1e293b'}`, borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: '2px', padding: '8px', background: '#0a0f1e', borderBottom: '1px solid #1e293b', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => execCommand('bold')} style={btnStyle}><Bold style={{ width: '14px', height: '14px' }} /></button>
        <button type="button" onClick={() => execCommand('italic')} style={btnStyle}><Italic style={{ width: '14px', height: '14px' }} /></button>
        <button type="button" onClick={() => execCommand('underline')} style={btnStyle}><Underline style={{ width: '14px', height: '14px' }} /></button>
        <div style={{ width: '1px', background: '#1e293b', margin: '0 4px' }} />
        <button type="button" onClick={() => execCommand('formatBlock', '<h1>')} style={btnStyle}><Heading1 style={{ width: '14px', height: '14px' }} /></button>
        <button type="button" onClick={() => execCommand('formatBlock', '<h2>')} style={btnStyle}><Heading2 style={{ width: '14px', height: '14px' }} /></button>
        <div style={{ width: '1px', background: '#1e293b', margin: '0 4px' }} />
        <button type="button" onClick={() => execCommand('insertUnorderedList')} style={btnStyle}><List style={{ width: '14px', height: '14px' }} /></button>
        <button type="button" onClick={() => execCommand('insertOrderedList')} style={btnStyle}><ListOrdered style={{ width: '14px', height: '14px' }} /></button>
        <div style={{ width: '1px', background: '#1e293b', margin: '0 4px' }} />
        <button type="button" onClick={() => { const url = prompt('Enter URL:'); if (url) execCommand('createLink', url); }} style={btnStyle}><LinkIcon style={{ width: '14px', height: '14px' }} /></button>
        <button type="button" onClick={() => execCommand('formatBlock', '<pre>')} style={btnStyle}><Code style={{ width: '14px', height: '14px' }} /></button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{ minHeight: '150px', padding: '12px', background: '#0a0f1e', color: '#f1f5f9', fontSize: '14px', outline: 'none', lineHeight: '1.6' }}
        data-placeholder={placeholder}
      />
    </div>
  );
}