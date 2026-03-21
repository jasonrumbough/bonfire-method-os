export const SYSTEMS = [
  { key: 'structure', label: 'Structure', icon: '🏗️', color: '#E8593C', desc: 'The boundaries and rhythms that hold everything together.' },
  { key: 'yield', label: 'Yield', icon: '📊', color: '#C9922F', desc: 'The results your systems produce.' },
  { key: 'support', label: 'Support', icon: '🤝', color: '#2A9D8F', desc: 'The people, tools, and habits that stabilize your work.' },
  { key: 'time', label: 'Time', icon: '⏰', color: '#3478C0', desc: 'Where your most valuable resource actually goes.' },
  { key: 'energy', label: 'Energy', icon: '⚡', color: '#C9922F', desc: 'Your physical, emotional, mental, and spiritual fuel.' },
  { key: 'money', label: 'Money', icon: '💰', color: '#639922', desc: 'The financial resources that sustain your mission.' },
  { key: 'story', label: 'Story', icon: '📖', color: '#A052D8', desc: 'The message your life and leadership communicate.' },
];

export const AUDIT_QUESTIONS = {
  spark: [
    { id: 'sp1', q: 'I can clearly articulate my personal why — the deeper purpose behind my work.', p: 'Passion' },
    { id: 'sp2', q: 'My daily work aligns with the problems I feel most called to solve.', p: 'Pain' },
    { id: 'sp3', q: 'I see patterns of opportunity that others overlook in my field.', p: 'Pattern' },
    { id: 'sp4', q: 'I am actively developing the skills my calling requires.', p: 'Practice' },
    { id: 'sp5', q: 'My work creates sustainable financial provision for my life and mission.', p: 'Provision' },
    { id: 'sp6', q: 'I am leading in ways that align with how I am naturally wired.', p: 'Personality' },
  ],
  systems: [
    { id: 'sy1', q: 'My daily and weekly routines create consistent, forward progress.', p: 'Structure' },
    { id: 'sy2', q: 'I can clearly measure whether my work is producing meaningful results.', p: 'Yield' },
    { id: 'sy3', q: 'I have people, environments, and tools that actively sustain my mission.', p: 'Support' },
    { id: 'sy4', q: 'My calendar reflects my highest priorities — not just urgency.', p: 'Time' },
    { id: 'sy5', q: 'I protect and replenish my physical, emotional, mental, and spiritual energy.', p: 'Energy' },
    { id: 'sy6', q: 'My finances align with the mission I say matters most.', p: 'Money' },
    { id: 'sy7', q: 'The message my life communicates is clear, authentic, and consistent.', p: 'Story' },
  ],
  air: [
    { id: 'ai1', q: 'I regularly audit the health of my fire — not just activity, but actual impact.', p: 'Audit' },
    { id: 'ai2', q: 'I intentionally invest in what the season is asking of me.', p: 'Invest' },
    { id: 'ai3', q: 'I build in structured time to reflect on what the fire has taught me.', p: 'Reflect' },
    { id: 'ai4', q: 'I catch drift early — before small problems become large failures.', p: 'Rhythm' },
    { id: 'ai5', q: 'My leadership is growing more sustainable, not just more successful.', p: 'Sustainability' },
  ],
};

export const ASHES = [
  { id: 'ash1', letter: 'A', label: 'Apathy', q: 'I feel emotionally disconnected from work that once energized me.' },
  { id: 'ash2', letter: 'S', label: 'Skepticism', q: 'I find myself doubting whether the work I am doing actually matters.' },
  { id: 'ash3', letter: 'H', label: 'Helplessness', q: 'I feel stuck — like nothing I do will move the needle.' },
  { id: 'ash4', letter: 'E', label: 'Erosion of Health', q: 'My physical, mental, or emotional health is declining due to work stress.' },
  { id: 'ash5', letter: 'S', label: 'Social Withdrawal', q: 'I have pulled back from people who once gave me energy and perspective.' },
];

export const SYSTEM_AUDITS = {
  structure: [
    { id: 'str1', q: 'I have clear roles, responsibilities, and expectations for my work.' },
    { id: 'str2', q: 'My daily and weekly routines create consistent progress — not reactive chaos.' },
    { id: 'str3', q: 'I have established boundaries that protect my time, focus, and priorities.' },
  ],
  yield: [
    { id: 'yld1', q: 'I can clearly identify measurable results my work is producing.' },
    { id: 'yld2', q: 'Activity in my life and org is producing real forward momentum.' },
    { id: 'yld3', q: 'The outcomes I produce align with my stated mission.' },
  ],
  support: [
    { id: 'sup1', q: 'I have people actively helping carry the weight of the mission.' },
    { id: 'sup2', q: 'My environments restore clarity and support deep, focused work.' },
    { id: 'sup3', q: 'I have the right tools and processes reducing my cognitive load.' },
  ],
  time: [
    { id: 'tm1', q: 'My most important work gets my best hours — not just what is urgent.' },
    { id: 'tm2', q: 'My schedule is sustainable over the long term without burning me out.' },
    { id: 'tm3', q: 'I actively protect time for deep work, reflection, and recovery.' },
  ],
  energy: [
    { id: 'en1', q: 'My physical energy — sleep, nutrition, movement — is consistently strong.' },
    { id: 'en2', q: 'My mental and emotional bandwidth is replenished, not perpetually depleted.' },
    { id: 'en3', q: 'My sense that work aligns with deeper purpose — spiritual energy — is intact.' },
  ],
  money: [
    { id: 'mn1', q: 'I clearly understand my income, expenses, and financial commitments.' },
    { id: 'mn2', q: 'My financial capacity is expanding toward long-term stability.' },
    { id: 'mn3', q: 'My spending reflects the life and mission I say I want to build.' },
  ],
  story: [
    { id: 'st1', q: 'The message I communicate is clear, authentic, and consistent.' },
    { id: 'st2', q: 'People understand what I stand for and what I am building.' },
    { id: 'st3', q: 'My daily life reinforces the mission I claim to pursue.' },
  ],
};

export const NAV = [
  { section: 'Overview', items: [{ key: 'dashboard', icon: '🔥', label: 'Dashboard' }] },
  { section: 'The Method', items: [
    { key: 'spark', icon: '✦', label: 'Spark' },
    { key: 'systems', icon: '⚙️', label: 'SYSTEMS' },
    { key: 'air', icon: '💨', label: 'AIR Rhythm' },
  ]},
  { section: 'Tools', items: [
    { key: 'audit', icon: '📊', label: 'Audit' },
    { key: 'coach', icon: '🤖', label: 'AI Coach' },
    { key: 'notes', icon: '📝', label: 'Notes' },
    { key: 'history', icon: '📋', label: 'History' },
  ]},
  { section: 'Personal', items: [
    { key: 'personality', icon: '🧬', label: 'Personality' },
    { key: 'health', icon: '❤️', label: 'Health Data' },
  ]},
];