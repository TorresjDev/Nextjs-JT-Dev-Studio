'use client'

/**
 * Rich Text Editor Component
 * 
 * A Tiptap-based rich text editor similar to X/Twitter's post composer.
 * Supports:
 * - Bold, Italic, Underline, Strikethrough
 * - Bullet and Ordered Lists
 * - Code blocks
 * - Emoji picker trigger (emojis typed directly work too)
 * 
 * Tiptap = A headless, framework-agnostic rich text editor built on ProseMirror
 * ProseMirror = A toolkit for building rich text editors
 */

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { useCallback, useEffect } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  maxLength?: number
  disabled?: boolean
}

/**
 * Toolbar Button Component
 */
function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        p-2 rounded-lg transition-colors text-sm font-medium
        ${isActive 
          ? 'bg-primary/20 text-primary' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {children}
    </button>
  )
}

/**
 * Editor Toolbar
 */
function EditorToolbar({ editor, disabled }: { editor: Editor | null; disabled?: boolean }) {
  if (!editor) return null

  return (
    <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30 rounded-t-lg flex-wrap">
      {/* Bold */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        disabled={disabled}
        title="Bold (Ctrl+B)"
      >
        <span className="font-bold">B</span>
      </ToolbarButton>

      {/* Italic */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        disabled={disabled}
        title="Italic (Ctrl+I)"
      >
        <span className="italic">I</span>
      </ToolbarButton>

      {/* Underline */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        disabled={disabled}
        title="Underline (Ctrl+U)"
      >
        <span className="underline">U</span>
      </ToolbarButton>

      {/* Strikethrough */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        disabled={disabled}
        title="Strikethrough"
      >
        <span className="line-through">S</span>
      </ToolbarButton>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Bullet List */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        disabled={disabled}
        title="Bullet List"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </ToolbarButton>

      {/* Ordered List */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        disabled={disabled}
        title="Numbered List"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      </ToolbarButton>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Code Block */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        disabled={disabled}
        title="Code Block"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </ToolbarButton>

      {/* Blockquote */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        disabled={disabled}
        title="Quote"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </ToolbarButton>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Clear Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        disabled={disabled}
        title="Clear Formatting"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </ToolbarButton>

      {/* Hint about emojis */}
      <div className="ml-auto text-xs text-muted-foreground hidden sm:block">
        💡 Type emojis directly (Win+. or Ctrl+Cmd+Space)
      </div>
    </div>
  )
}

/**
 * Main Rich Text Editor Component
 */
export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Write something amazing...',
  maxLength = 50000,
  disabled = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    // Prevent SSR hydration mismatch - render only on client
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Disable heading since we're keeping it simple like X
        heading: false,
        // Keep the rest of StarterKit features
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Underline,
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      // Only update if content actually changed
      if (html !== content) {
        onChange(html)
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  })

  // Update editor when content prop changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [disabled, editor])

  // Get plain text length for character count
  const textLength = editor?.getText().length ?? 0

  return (
    <div className={`
      border rounded-lg overflow-hidden transition-colors
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'focus-within:border-primary focus-within:ring-1 focus-within:ring-primary'}
      border-border bg-background
    `}>
      <EditorToolbar editor={editor} disabled={disabled} />
      
      <EditorContent 
        editor={editor} 
        className="rich-text-editor"
      />
      
      {/* Character Count */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/20">
        <div className="text-xs text-muted-foreground">
          Supports <strong>bold</strong>, <em>italic</em>, lists, and more
        </div>
        <div className={`text-xs ${textLength > maxLength ? 'text-red-500' : 'text-muted-foreground'}`}>
          {textLength.toLocaleString()}/{maxLength.toLocaleString()}
        </div>
      </div>

      {/* Custom styles for the editor */}
      <style jsx global>{`
        .rich-text-editor .ProseMirror {
          min-height: 200px;
          padding: 1rem;
          outline: none;
        }
        
        .rich-text-editor .ProseMirror.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
        }
        
        .rich-text-editor .ProseMirror p {
          margin: 0.5em 0;
        }
        
        .rich-text-editor .ProseMirror ul,
        .rich-text-editor .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.5em 0;
        }
        
        .rich-text-editor .ProseMirror li {
          margin: 0.25em 0;
        }
        
        .rich-text-editor .ProseMirror code {
          background-color: hsl(var(--muted));
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }
        
        .rich-text-editor .ProseMirror pre {
          background-color: hsl(var(--muted));
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 0.5em 0;
        }
        
        .rich-text-editor .ProseMirror pre code {
          background: none;
          padding: 0;
        }
        
        .rich-text-editor .ProseMirror blockquote {
          border-left: 3px solid hsl(var(--primary));
          padding-left: 1rem;
          margin: 0.5em 0;
          color: hsl(var(--muted-foreground));
        }
        
        .rich-text-editor .ProseMirror strong {
          font-weight: 700;
        }
        
        .rich-text-editor .ProseMirror em {
          font-style: italic;
        }
        
        .rich-text-editor .ProseMirror u {
          text-decoration: underline;
        }
        
        .rich-text-editor .ProseMirror s {
          text-decoration: line-through;
        }
      `}</style>
    </div>
  )
}
