import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowDown, ArrowRight, Award, BookOpen, CheckCircle2, ChevronDown, Code2,
  ExternalLink, FileText, ListChecks, Play, Sparkles, Target, Video
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Original Coding landing page                                        */
/* ------------------------------------------------------------------ */

const topics = [
  { title: 'Arrays', count: 12, level: 'Easy · Medium', state: 'Completed', color: 'green' },
  { title: 'Strings', count: 10, level: 'Easy · Medium', state: 'Completed', color: 'teal' },
  { title: 'Linked Lists', count: 10, level: 'Easy · Medium', state: 'Completed', color: 'purple' },
  { title: 'Stacks & Queues', count: 8, level: 'Easy · Medium', state: 'In Progress', color: 'blue' },
  { title: 'Trees', count: 12, level: 'Easy · Hard', state: 'Not Started', color: 'orange' },
  { title: 'Heaps (Priority Queue)', count: 8, level: 'Medium · Hard', state: 'Not Started', color: 'rose' },
  { title: 'Graphs', count: 12, level: 'Medium · Hard', state: 'Not Started', color: 'cyan' },
  { title: 'Dynamic Programming', count: 15, level: 'Medium · Hard', state: 'Not Started', color: 'green' },
  { title: 'Backtracking', count: 8, level: 'Medium · Hard', state: 'Not Started', color: 'purple' },
  { title: 'Greedy', count: 6, level: 'Medium · Hard', state: 'Not Started', color: 'orange' },
];
const topicProblems: Record<string, { title: string; difficulty: string; slug: string }[]> = {
  Arrays: [{title:'Two Sum',difficulty:'Easy',slug:'two-sum'},{title:'Best Time to Buy and Sell Stock',difficulty:'Easy',slug:'best-time-to-buy-and-sell-stock'},{title:'Contains Duplicate',difficulty:'Easy',slug:'contains-duplicate'}],
  Strings: [{title:'Valid Anagram',difficulty:'Easy',slug:'valid-anagram'},{title:'Longest Common Prefix',difficulty:'Easy',slug:'longest-common-prefix'},{title:'Longest Substring Without Repeating Characters',difficulty:'Medium',slug:'longest-substring-without-repeating-characters'}],
  'Linked Lists': [{title:'Reverse Linked List',difficulty:'Easy',slug:'reverse-linked-list'},{title:'Merge Two Sorted Lists',difficulty:'Easy',slug:'merge-two-sorted-lists'},{title:'Linked List Cycle',difficulty:'Easy',slug:'linked-list-cycle'}],
  'Stacks & Queues': [{title:'Valid Parentheses',difficulty:'Easy',slug:'valid-parentheses'},{title:'Min Stack',difficulty:'Medium',slug:'min-stack'},{title:'Implement Queue using Stacks',difficulty:'Easy',slug:'implement-queue-using-stacks'}],
  Trees: [{title:'Maximum Depth of Binary Tree',difficulty:'Easy',slug:'maximum-depth-of-binary-tree'},{title:'Invert Binary Tree',difficulty:'Easy',slug:'invert-binary-tree'},{title:'Binary Tree Level Order Traversal',difficulty:'Medium',slug:'binary-tree-level-order-traversal'}],
  'Heaps (Priority Queue)': [{title:'Kth Largest Element in an Array',difficulty:'Medium',slug:'kth-largest-element-in-an-array'},{title:'Top K Frequent Elements',difficulty:'Medium',slug:'top-k-frequent-elements'},{title:'Find Median from Data Stream',difficulty:'Hard',slug:'find-median-from-data-stream'}],
  Graphs: [{title:'Number of Islands',difficulty:'Medium',slug:'number-of-islands'},{title:'Course Schedule',difficulty:'Medium',slug:'course-schedule'},{title:'Clone Graph',difficulty:'Medium',slug:'clone-graph'}],
  'Dynamic Programming': [{title:'Climbing Stairs',difficulty:'Easy',slug:'climbing-stairs'},{title:'House Robber',difficulty:'Medium',slug:'house-robber'},{title:'Coin Change',difficulty:'Medium',slug:'coin-change'}],
  Backtracking: [{title:'Subsets',difficulty:'Medium',slug:'subsets'},{title:'Permutations',difficulty:'Medium',slug:'permutations'},{title:'Combination Sum',difficulty:'Medium',slug:'combination-sum'}],
  Greedy: [{title:'Jump Game',difficulty:'Medium',slug:'jump-game'},{title:'Assign Cookies',difficulty:'Easy',slug:'assign-cookies'},{title:'Gas Station',difficulty:'Medium',slug:'gas-station'}],
};
const downloadStriverSheet = () => {
  const rows = topics.flatMap((topic) => [`${topic.title} (${topic.count} practice items)`, ...(topicProblems[topic.title] || []).map((problem) => `  - ${problem.title}: https://leetcode.com/problems/${problem.slug}/`), '']);
  const blob = new Blob([`CampusConnect · Curated Striver DSA Sheet\n\n${rows.join('\n')}\nNote: LeetCode links open the original problem pages.`], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'CampusConnect-Striver-DSA-Sheet.txt'; anchor.click(); URL.revokeObjectURL(url);
};

export const Coding: React.FC = () => {
  const navigate = useNavigate();
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const goLeetCode = () => window.open('https://leetcode.com/problemset/', '_blank', 'noopener,noreferrer');
  const resources = [
    { title: 'Learning Resources', desc: 'Topic-wise notes, videos, and concept explanations.', action: 'Explore Resources', icon: BookOpen, color: 'purple', onClick: () => navigate('/coding/resources') },
    { title: 'Practice Problem Lists', desc: 'Curated sets for each topic, from basics to advanced.', action: 'View Practice Lists', icon: ListChecks, color: 'green', onClick: () => navigate('/coding/problems') },
    { title: 'LeetCode Problems', desc: 'Open curated problems to practise on LeetCode.', action: 'Go to LeetCode', icon: Code2, color: 'orange', onClick: goLeetCode },
    { title: 'Coding Roadmap', desc: 'Follow a structured path to build your skills step by step.', action: 'View Roadmap', icon: Target, color: 'purple', onClick: () => navigate('/coding/roadmap') },
  ];

  return <div className="portal-page coding-page"><header className="portal-hero coding-hero"><div className="portal-hero-icon"><Code2/></div><div><span className="portal-breadcrumb">Dashboard　›　Coding Practice</span><h1>Coding Practice</h1><div className="coding-tagline">Learn <i/> Practise <i/> Build Your Dream</div><p>Build problem-solving skills with curated resources, topic practice, and LeetCode links. Follow a structured DSA roadmap and track your progress.</p></div><a className="leetcode-badge" href="https://leetcode.com/problemset/" target="_blank" rel="noreferrer"><Code2/> LeetCode <ExternalLink/></a><div className="hero-art coding-art"><Code2/><span>01</span></div></header>
    <section className="portal-card coding-workspace-cta">
      <span className="coding-icon purple"><Code2 /></span>
      <div className="cw-cta-copy">
        <h2>Coding Workspace</h2>
        <p>Practise in a Monaco editor — the same engine that powers VS Code. Pick from 12 beginner-friendly problems with starter templates, then run your code on the server with real output, error reporting, and timing. Supports Python, Java, and JavaScript.</p>
      </div>
      <button className="solid-button" onClick={() => navigate('/coding/editor')}>Open Workspace <ArrowRight /></button>
    </section>
    <div className="coding-layout"><main className="coding-main"><div className="coding-resource-grid">{resources.map(({title,desc,action,icon:Icon,color,onClick}) => <button className="coding-resource portal-card" key={title} onClick={onClick}><span className={`coding-icon ${color}`}><Icon/></span><h2>{title}</h2><p>{desc}</p><strong>{action}<ArrowRight/></strong></button>)}</div>
      <section className="portal-card coding-sheet"><div className="portal-section-head"><div><span className="section-icon"><ListChecks/></span><div><h2>Striver’s Sheet</h2><p>A curated topic-wise list of real LeetCode practice problems.</p></div></div><button className="outline-button" onClick={() => navigate('/coding/sheet')}>View Full Sheet <ArrowRight/></button></div><div className="topic-list">{topics.map((topic, i) => <article className="topic-row" key={topic.title}><button className={`topic-number ${topic.color}`} onClick={() => setExpandedTopic(expandedTopic === topic.title ? null : topic.title)}>{i + 1}</button><button className="topic-name" onClick={() => setExpandedTopic(expandedTopic === topic.title ? null : topic.title)}>{topic.title}<small>{topicProblems[topic.title]?.length || 0} LeetCode Problems <i/> {topic.level}</small></button><span className={`topic-state ${topic.state.toLowerCase().replace(' ', '-')}`}>{topic.state === 'Completed' ? <CheckCircle2/> : topic.state === 'In Progress' ? <Play/> : <ArrowDown/>}{topic.state}</span><button className="topic-open" onClick={() => setExpandedTopic(expandedTopic === topic.title ? null : topic.title)}>View Problems <ChevronDown/></button><button className="topic-chevron" aria-label={`Expand ${topic.title}`} onClick={() => setExpandedTopic(expandedTopic === topic.title ? null : topic.title)}><ChevronDown className={expandedTopic === topic.title ? 'rotated' : ''}/></button>{expandedTopic === topic.title && <div className="topic-detail topic-problem-links">{(topicProblems[topic.title] || []).map((problem) => <a key={problem.slug} href={`https://leetcode.com/problems/${problem.slug}/`} target="_blank" rel="noreferrer"><span>{problem.title}<small>{problem.difficulty}</small></span><ExternalLink/></a>)}</div>}</article>)}</div></section>
      <section className="coding-progress-strip"><span className="progress-target"><Target/></span><div><strong>Small steps. Big progress.</strong><p>Consistent practice today builds success tomorrow.</p></div><div className="progress-chip"><CheckCircle2/><strong>3</strong><small>Topics completed</small></div><div className="progress-chip"><Code2/><strong>101</strong><small>Curated problems</small></div><div className="progress-chip"><Award/><strong>10</strong><small>Core topics</small></div><button className="solid-button" onClick={goLeetCode}>Start Practising <ArrowRight/></button></section>
    </main><aside className="coding-aside"><section className="portal-card coding-journey"><div className="portal-section-head"><div><span className="section-icon"><Target/></span><div><h2>Your Coding Journey</h2><p>Follow the roadmap and track progress.</p></div></div></div><div className="journey-progress"><div><span style={{width:'30%'}}/></div><strong>3/10 Topics Completed</strong></div><div className="journey-list">{topics.map((topic,i) => <div className={`journey-row ${topic.state.toLowerCase().replace(' ','-')}`} key={topic.title}><span>{i+1}</span><strong>{topic.title}</strong><small>{topic.state === 'Completed' ? <><CheckCircle2/>Completed</> : topic.state === 'In Progress' ? <><Play/>In Progress</> : <><ArrowDown/>Not Started</>}</small></div>)}</div></section><section className="portal-card coding-quick-links"><div className="portal-section-head"><div><span className="section-icon"><ExternalLink/></span><h2>Quick Links</h2></div></div><button onClick={downloadStriverSheet}><span><FileText/></span><div><strong>Striver’s Sheet</strong><small>Download curated problem links</small></div><ArrowDown/></button><a href="https://leetcode.com/problemset/" target="_blank" rel="noreferrer"><span><Code2/></span><div><strong>LeetCode</strong><small>Solve problems on LeetCode</small></div><ExternalLink/></a><button onClick={() => navigate('/coding/videos')}><span><Video/></span><div><strong>Video Tutorials</strong><small>Topic-wise video resources</small></div><ExternalLink/></button><button onClick={() => navigate('/coding/resources')}><span><BookOpen/></span><div><strong>Practice Resources</strong><small>Guides and learning material</small></div><ExternalLink/></button></section><section className="coding-aside-quote"><Sparkles/><strong>Learn a little every day.</strong><p>Build habits that turn practice into progress.</p></section></aside></div></div>;
};

/* ------------------------------------------------------------------ */
/* Coding sub-pages (resources, problems, roadmap, sheet, videos)      */
/* ------------------------------------------------------------------ */

export const CodingSubPage: React.FC = () => {
  const { pageSlug = '' } = useParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All topics');
  const isSheet = pageSlug === 'sheet';
  const isProblems = pageSlug === 'problems' || isSheet;
  const pageNames: Record<string, string> = { resources: 'Learning Resources', problems: 'Practice Problem Lists', roadmap: 'Coding Roadmap', sheet: 'Striver’s DSA Sheet', videos: 'Video Tutorials' };
  const title = pageNames[pageSlug] || 'Coding Practice';
  const problems = topics.flatMap((topic) => (topicProblems[topic.title] || []).map((problem) => ({ ...problem, topic: topic.title })));
  const filteredProblems = problems.filter((problem) => filter === 'All topics' || problem.topic === filter);
  const learning = [
    { title: 'LeetCode Explore', detail: 'Structured topic cards and guided coding study plans.', url: 'https://leetcode.com/explore/', label: 'Open learning plans' },
    { title: 'Java Documentation', detail: 'Official Java language and standard library documentation.', url: 'https://docs.oracle.com/en/java/', label: 'Read Java docs' },
    { title: 'MDN Web Docs', detail: 'Reference guides for JavaScript, HTML, and browser APIs.', url: 'https://developer.mozilla.org/', label: 'Explore web docs' },
    { title: 'GeeksforGeeks DSA', detail: 'Topic guides and worked examples for common data structures.', url: 'https://www.geeksforgeeks.org/data-structures/', label: 'Browse DSA guides' },
  ];
  const videos = [
    { title: 'Arrays and Hashing', q: 'data structures arrays hashing tutorial' }, { title: 'Linked Lists', q: 'linked list data structure tutorial' }, { title: 'Trees and Binary Search Trees', q: 'binary trees data structures tutorial' }, { title: 'Graphs and Traversal', q: 'graph algorithms BFS DFS tutorial' }, { title: 'Dynamic Programming', q: 'dynamic programming tutorial problems' }, { title: 'Greedy Algorithms', q: 'greedy algorithms data structures tutorial' },
  ];
  const roadmap = [
    { phase: '01', title: 'Programming Foundations', detail: 'Choose one language and practise variables, functions, loops, recursion, and complexity analysis.', topics: 'Language basics · Big O · Recursion' },
    { phase: '02', title: 'Core Data Structures', detail: 'Build reliable array, string, linked-list, stack, queue, and hash-table fundamentals.', topics: 'Arrays · Strings · Lists · Stacks · Queues' },
    { phase: '03', title: 'Trees, Heaps & Graphs', detail: 'Learn traversals, priority queues, graph representations, and common search patterns.', topics: 'Trees · Heaps · BFS · DFS' },
    { phase: '04', title: 'Problem-Solving Patterns', detail: 'Recognize two pointers, sliding windows, binary search, backtracking, and greedy patterns.', topics: 'Two pointers · Windows · Greedy · Backtracking' },
    { phase: '05', title: 'Dynamic Programming & Review', detail: 'Practise state design, transitions, memoization, and timed mixed-topic review.', topics: '1D DP · 2D DP · Mixed practice' },
  ];
  return <div className="portal-page entity-page coding-subpage"><button className="back-link" onClick={() => navigate('/coding')}><ArrowRight className="back-arrow"/> Back to Coding Practice</button><header className="portal-hero"><div className="portal-hero-icon"><Code2/></div><div><span className="portal-breadcrumb">Coding Practice　›　{title}</span><h1>{title}</h1><p>{pageSlug === 'resources' ? 'Use these live reference sites and documentation to study and practise.' : pageSlug === 'roadmap' ? 'A practical progression from programming fundamentals to interview practice.' : pageSlug === 'videos' ? 'Open topic-focused video searches with current tutorials.' : 'Browse curated DSA practice problems with direct links to their original LeetCode pages.'}</p></div></header>
    {pageSlug === 'resources' && <div className="coding-detail-grid">{learning.map((item) => <article className="portal-card coding-detail-card" key={item.title}><span className="section-icon"><BookOpen/></span><h2>{item.title}</h2><p>{item.detail}</p><a className="solid-button" href={item.url} target="_blank" rel="noreferrer">{item.label}<ExternalLink/></a></article>)}</div>}
    {pageSlug === 'videos' && <section className="portal-card"><div className="portal-section-head"><div><span className="section-icon"><Video/></span><div><h2>Topic video tutorials</h2><p>Open current video results on YouTube.</p></div></div></div><div className="coding-video-list">{videos.map((item) => <a key={item.title} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.q)}`} target="_blank" rel="noreferrer"><span><Video/></span><strong>{item.title}</strong><small>Find current tutorials</small><ExternalLink/></a>)}</div></section>}
    {pageSlug === 'roadmap' && <section className="portal-card coding-roadmap-list">{roadmap.map((item) => <article key={item.phase}><span>{item.phase}</span><div><h2>{item.title}</h2><p>{item.detail}</p><small>{item.topics}</small></div><CheckCircle2/></article>)}<button className="solid-button" onClick={() => navigate('/coding/sheet')}>Open Topic Problem Sheet <ArrowRight/></button></section>}
    {isProblems && <section className="portal-card coding-problem-page"><div className="portal-section-head"><div><span className="section-icon"><ListChecks/></span><div><h2>{isSheet ? 'Topic-wise Striver practice sheet' : 'Curated LeetCode problems'}</h2><p>Each problem opens the original LeetCode page.</p></div></div><span className="soft-count">{filteredProblems.length} problems</span></div><div className="problem-page-filters"><label>Filter by topic<select value={filter} onChange={(event) => setFilter(event.target.value)}><option>All topics</option>{topics.map((topic) => <option key={topic.title}>{topic.title}</option>)}</select></label><button className="outline-button" onClick={downloadStriverSheet}><ArrowDown/> Download Sheet</button></div><div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>#</th><th>Problem</th><th>Topic</th><th>Difficulty</th><th>Practice</th></tr></thead><tbody>{filteredProblems.map((problem,index) => <tr key={problem.slug}><td>{String(index+1).padStart(2,'0')}</td><td><strong>{problem.title}</strong></td><td>{problem.topic}</td><td><span className={`problem-difficulty ${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span></td><td><a className="table-action" href={`https://leetcode.com/problems/${problem.slug}/`} target="_blank" rel="noreferrer">Open on LeetCode <ExternalLink/></a></td></tr>)}</tbody></table></div></section>}
    {!pageNames[pageSlug] && <section className="portal-card"><h2>Page not found</h2><button className="solid-button" onClick={() => navigate('/coding')}>Return to Coding Practice</button></section>}
  </div>;
};
