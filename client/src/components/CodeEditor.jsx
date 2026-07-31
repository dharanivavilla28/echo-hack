import { useState, useEffect } from 'react';

function CodeEditor({ code, onChange, readOnly, saveStatus }) {
  const lineCount = code ? code.split('\n').length : 1;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

  return (
    <div className="code-editor-container">
      <div className="code-editor-header">
        <span className="code-editor-title">HTML / CSS / JS</span>
        {saveStatus && (
          <span className={`save-status save-status-${saveStatus}`}>
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'saved' && 'Saved ✓'}
            {saveStatus === 'unsaved' && 'Unsaved changes'}
          </span>
        )}
      </div>
      <div className="code-editor-body">
        <div className="code-editor-gutters">{lineNumbers}</div>
        <textarea
          className="code-editor-textarea"
          value={code}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          spellCheck="false"
          placeholder="Generated code will appear here..."
        />
      </div>
    </div>
  );
}

export default CodeEditor;