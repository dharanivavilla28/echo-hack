import { useState } from 'react';

function ProjectChat({ messages = [], onSend }) {
  const [text, setText] = useState('');
  const submit = (event) => { event.preventDefault(); if (text.trim()) { onSend(text); setText(''); } };
  return <aside className="project-chat"><h3>Project Chat</h3><div className="project-chat-messages">{messages.map((message) => <p key={message._id || `${message.createdAt}-${message.text}`}><strong>{message.name}:</strong> {message.text}</p>)}</div><form onSubmit={submit}><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message team..." /><button>Send</button></form></aside>;
}
export default ProjectChat;
