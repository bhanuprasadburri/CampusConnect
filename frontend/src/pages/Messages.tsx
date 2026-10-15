import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCheck, ChevronRight, CircleHelp, FileText, Headphones, Mail, MessageSquare, MoreVertical, Paperclip, Search, Send, Smile, X } from 'lucide-react';

type ChatMessage = { id: string; text: string; time: string; from: 'student' | 'staff'; attachment?: { name: string; size: string; url: string } };
type Conversation = { id: string; name: string; role: string; initials: string; color: string; preview: string; time: string; unread?: number; messages: ChatMessage[] };

const initialConversations: Conversation[] = [
  { id: 'faculty', name: 'Dr. S. Ramesh', role: 'HOD · CSE', initials: 'DR', color: 'lavender', preview: 'Regarding the upcoming seminar...', time: '10:24 AM', unread: 2, messages: [
    { id: 'f1', from: 'staff', text: 'Hello Bhanu Prasad,\n\nRegarding the upcoming seminar on “Emerging Technologies in AI”, please ensure that your team registers by tomorrow.\n\nRegards,\nDr. S. Ramesh', time: '10:24 AM' },
    { id: 'f2', from: 'student', text: 'Thank you sir. I will register today itself.', time: '10:32 AM' },
    { id: 'f3', from: 'staff', text: 'Great!\nLet me know if you need any further assistance.\n\nRegards,\nDr. S. Ramesh', time: '10:33 AM' },
  ] },
  { id: 'placement', name: 'Placement Cell', role: 'Placement Coordinator', initials: 'PC', color: 'teal', preview: 'Walk-in drive details for TCS...', time: 'Yesterday', unread: 1, messages: [{ id: 'p1', from: 'staff', text: 'The placement cell has shared the latest walk-in drive details. Please check the eligibility criteria and carry your updated resume.', time: 'Yesterday' }] },
  { id: 'library', name: 'Library Team', role: 'Library Manager', initials: 'LT', color: 'blue', preview: 'New e-resources are now available...', time: 'Yesterday', messages: [{ id: 'l1', from: 'staff', text: 'New e-resources are now available in the library portal. You can access them using your student account.', time: 'Yesterday' }] },
  { id: 'hostel', name: 'Hostel Warden', role: 'Hostel In-charge', initials: 'HW', color: 'orange', preview: 'Mess menu for this week...', time: '28 Sep', messages: [{ id: 'h1', from: 'staff', text: 'The updated mess menu for this week is now available. Please check the hostel notice board for details.', time: '28 Sep' }] },
  { id: 'transport', name: 'Transport Office', role: 'Campus Transport', initials: 'TO', color: 'violet', preview: 'Bus timings updated for route 3...', time: '26 Sep', messages: [{ id: 't1', from: 'staff', text: 'Please note: Route 3 bus timings have been updated. The new schedule is available from the Transport section.', time: '26 Sep' }] },
  { id: 'support', name: 'Student Support', role: 'Student Welfare', initials: 'SS', color: 'rose', preview: 'Counselling session on 20 Sep...', time: '24 Sep', messages: [{ id: 's1', from: 'staff', text: 'A student wellness and counselling session is scheduled this week. Contact Student Support if you would like to reserve a slot.', time: '24 Sep' }] },
  { id: 'academic', name: 'Academic Office', role: 'Academic Section', initials: 'AO', color: 'cyan', preview: 'Reopening of lab sessions...', time: '22 Sep', messages: [{ id: 'a1', from: 'staff', text: 'Lab sessions will resume as scheduled. Please refer to your timetable for room and period details.', time: '22 Sep' }] },
  { id: 'self', name: 'You', role: 'Personal notes', initials: 'BP', color: 'purple', preview: 'Thank you for the information!', time: '20 Sep', messages: [{ id: 'me1', from: 'student', text: 'Thank you for the information!', time: '20 Sep' }] },
];

const emojiOptions = ['😀', '😊', '😂', '❤️', '👍', '🙏', '🎉', '🤔', '👏', '✨', '😄', '🙌'];
const formatSize = (bytes: number) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export const Messages: React.FC = () => {
  const { showToast } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedId, setSelectedId] = useState('faculty');
  const [activeTab, setActiveTab] = useState<'messages' | 'helpdesk'>('messages');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLInputElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const selected = conversations.find((conversation) => conversation.id === selectedId) || conversations[0];
  const filtered = useMemo(() => conversations.filter((conversation) => `${conversation.name} ${conversation.role} ${conversation.preview}`.toLowerCase().includes(search.toLowerCase())), [conversations, search]);
  const faqs = [
    { question: 'How can I raise a helpdesk request?', answer: 'Choose a support topic above to open the related campus conversation. You can describe your issue there. Online ticket submission is not connected yet.' },
    { question: 'Where can I get my hall ticket?', answer: 'Open the Examinations page in the portal to view available examination details and hall ticket options.' },
    { question: 'How do I check my fee payment status?', answer: 'Open Fee Payments to review your current balance, payment records, and receipt information.' },
    { question: 'How can I contact the placement cell?', answer: 'Select Placement Cell in your Messages inbox to view the conversation and send a message.' },
  ];

  useEffect(() => { threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' }); }, [selectedId, conversations]);

  const chooseConversation = (conversation: Conversation) => {
    setSelectedId(conversation.id);
    if (conversation.unread) setConversations((current) => current.map((item) => item.id === conversation.id ? { ...item, unread: 0 } : item));
    setEmojiOpen(false); setMenuOpen(false);
  };

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const cleanText = draft.trim();
    if (!cleanText && !attachment) return;
    const newMessage: ChatMessage = {
      id: `local-${Date.now()}`, from: 'student', text: cleanText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...(attachment ? { attachment: { name: attachment.name, size: formatSize(attachment.size), url: URL.createObjectURL(attachment) } } : {}),
    };
    setConversations((current) => current.map((conversation) => conversation.id === selectedId ? { ...conversation, preview: cleanText || `Attachment: ${attachment?.name}`, time: 'Now', messages: [...conversation.messages, newMessage] } : conversation));
    setDraft(''); setAttachment(null); setEmojiOpen(false);
    if (fileInput.current) fileInput.current.value = '';
  };

  const openFilePicker = () => fileInput.current?.click();
  const addEmoji = (emoji: string) => { setDraft((value) => `${value}${emoji}`); setEmojiOpen(false); composerRef.current?.focus(); };

  return <div className="portal-page messages-page">
    <header className="portal-hero messages-hero"><div className="portal-hero-icon"><Mail/></div><div><span className="portal-breadcrumb">Dashboard　›　Messages & Helpdesk</span><h1>Messages & Helpdesk</h1><p>Stay connected with your college and message your campus contacts.</p></div><div className="hero-art messages-art"><MessageSquare/><Mail/><Headphones/></div></header>
    <main className="messages-main"><section className="portal-card inbox-card">
      <nav className="portal-tabs messages-tabs"><button className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}><Mail/> Messages</button><button className={activeTab === 'helpdesk' ? 'active' : ''} onClick={() => setActiveTab('helpdesk')}><Headphones/> Helpdesk</button></nav>
      {activeTab === 'messages' ? <div className="inbox-grid">
        <section className="inbox-list"><label className="inbox-search"><Search/><input aria-label="Search conversations" placeholder="Search conversations..." value={search} onChange={(event) => setSearch(event.target.value)}/></label><div className="inbox-items">{filtered.map((conversation) => <button className={`inbox-item ${selected?.id === conversation.id ? 'selected' : ''}`} key={conversation.id} onClick={() => chooseConversation(conversation)}><span className={`inbox-avatar ${conversation.color}`}>{conversation.initials}</span><span className="inbox-item-copy"><span className="inbox-name-row"><strong>{conversation.name}</strong><time>{conversation.time}</time></span><small className="inbox-role">{conversation.role}</small><small>{conversation.preview}</small></span>{Boolean(conversation.unread) && <i className="unread-dot"/>}</button>)}{!filtered.length && <div className="inbox-empty">No conversations match your search.</div>}</div><div className="inbox-list-foot">{conversations.length} conversations</div></section>
        <section className="message-detail">
          <div className="message-detail-head"><span className={`detail-avatar ${selected.color}`}>{selected.initials}</span><div><strong>{selected.name}</strong><small>{selected.role}</small></div><button className="icon-button" title="Conversation options" aria-label="Conversation options" onClick={() => setMenuOpen((open) => !open)}><MoreVertical/></button>{menuOpen && <div className="chat-menu"><button onClick={() => {setConversations((current) => current.map((item) => item.id === selectedId ? {...item, unread:0} : item));setMenuOpen(false);}}>Mark conversation read</button><button onClick={() => {setSearch('');setMenuOpen(false);}}>Clear search</button></div>}</div>
          <div className="message-thread" ref={threadRef} aria-live="polite">{selected.messages.map((message) => <article key={message.id} className={`message-row ${message.from === 'student' ? 'outgoing' : 'incoming'}`}><div className={`message-bubble ${message.from === 'student' ? 'outgoing' : 'incoming'}`}>{message.text && <p>{message.text}</p>}{message.attachment && <a className="chat-attachment" href={message.attachment.url} download={message.attachment.name}><span><FileText/></span><span><strong>{message.attachment.name}</strong><small>{message.attachment.size} · Download</small></span></a>}<small className="bubble-time">{message.time}{message.from === 'student' && <CheckCheck/>}</small></div></article>)}</div>
          <div className="chat-composer-wrap"><form className="message-composer" onSubmit={sendMessage}><input ref={fileInput} className="chat-file-input" type="file" onChange={(event) => setAttachment(event.target.files?.[0] || null)} aria-label="Choose attachment"/><button type="button" className="icon-button composer-tool" title="Attach a file" aria-label="Attach a file" onClick={openFilePicker}><Paperclip/></button><input ref={composerRef} className="chat-text-input" placeholder={`Message ${selected.name}...`} value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="Type a message"/><div className="emoji-control"><button type="button" className="icon-button composer-tool" title="Choose emoji" aria-label="Choose emoji" aria-expanded={emojiOpen} onClick={() => setEmojiOpen((open) => !open)}><Smile/></button>{emojiOpen && <div className="emoji-picker" role="group" aria-label="Choose an emoji">{emojiOptions.map((emoji) => <button key={emoji} type="button" onClick={() => addEmoji(emoji)} aria-label={`Add ${emoji}`}>{emoji}</button>)}</div>}</div><button type="submit" className="send-button" aria-label="Send message" title="Send message" disabled={!draft.trim() && !attachment}><Send/><span>Send</span></button></form>{attachment && <div className="pending-attachment"><Paperclip/><span>{attachment.name}<small>{formatSize(attachment.size)}</small></span><button type="button" onClick={() => {setAttachment(null);if(fileInput.current)fileInput.current.value='';}} aria-label="Remove attachment"><X/></button></div>}<div className="chat-local-note"><CircleHelp/> Messages are a local preview; server delivery and uploads are not connected yet.</div></div>
        </section>
      </div> : <section className="chat-helpdesk"><div className="chat-helpdesk-banner"><div className="chat-helpdesk-heading"><span className="section-icon"><Headphones/></span><div><h2>How can we help?</h2><p>Choose a topic or start a conversation with the right campus support contact.</p></div></div><button className="solid-button" onClick={() => {setSelectedId('support');setActiveTab('messages');}}><Mail/> Start a Conversation</button></div><div className="chat-helpdesk-topics">{[{title:'Academic Queries',desc:'Exams, results and certificates',icon:'🎓'},{title:'Technical Issues',desc:'Login, portal and website access',icon:'💻'},{title:'Hostel & Mess',desc:'Rooms, mess and facilities',icon:'🏠'},{title:'Transport',desc:'Bus timings and passes',icon:'🚌'},{title:'Fee Payments',desc:'Payment questions and receipts',icon:'💳'},{title:'Other Questions',desc:'General student support',icon:'💬'}].map((topic) => <button key={topic.title} onClick={() => {setActiveTab('messages');setSelectedId('support');showToast(`Opening ${topic.title} conversation.`);}}><span>{topic.icon}</span><strong>{topic.title}</strong><small>{topic.desc}</small><ChevronRight/></button>)}</div><section className="chat-faq"><div className="chat-faq-heading"><span className="section-icon"><CircleHelp/></span><div><h2>Frequently Asked Questions</h2><p>Quick answers to common student questions</p></div></div><div className="chat-faq-list">{faqs.map((faq, index) => <article className={`chat-faq-item ${openFaq === index ? 'open' : ''}`} key={faq.question}><button aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)}><span>{faq.question}</span><ChevronRight/></button>{openFaq === index && <p>{faq.answer}</p>}</article>)}</div></section><p className="chat-helpdesk-note"><CircleHelp/> Need personal support? Select a topic to open its conversation in Messages.</p></section>}
    </section></main>
  </div>;
};
