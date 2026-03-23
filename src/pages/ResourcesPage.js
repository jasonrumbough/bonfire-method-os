import React from "react";
import { useState, useEffect } from "react";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../utils/supabase";

const RESOURCE_TYPES = [
  { key:"book",    label:"Books",     icon:"📚" },
  { key:"article", label:"Articles",  icon:"📄" },
  { key:"podcast", label:"Podcasts",  icon:"🎙" },
  { key:"video",   label:"Videos",    icon:"▶️" },
  { key:"practice",label:"Practices", icon:"🔥" },
];

function todayKey() { return new Date().toISOString().split('T')[0]; }

export default function ResourcesPage({ data }) {

  const [playlist, setPlaylist] = React.useState(null);
  const [playlistLoading, setPlaylistLoading] = React.useState(false);

  const generatePlaylist = async () => {
    setPlaylistLoading(true);
    try {
      const scores = data.auditScores || {};
      const sparkStatement = data.sparkStatement || "";
      const overall = Object.values(scores).filter(v=>v>0).reduce((a,b)=>a+b,0) / (Object.values(scores).filter(v=>v>0).length||1);
      const prompt = 'Based on this leader\'s current state, suggest a Spotify focus playlist. ' +
        'Spark statement: "' + sparkStatement + '". ' +
        'Overall score: ' + overall.toFixed(1) + '/5. ' +
        'Respond ONLY with valid JSON (no markdown): { "rationale": "1-2 sentence explanation of why these tracks fit this leader right now", "searchQuery": "spotify search string for this vibe", "tracks": [ { "title": "Song Title", "artist": "Artist Name", "emoji": "🔥", "vibe": "one word vibe" } ] } with exactly 6 tracks.';
      const apiRes = await fetch(SUPABASE_URL + '/functions/v1/coach', {
        method: 'POST',
        headers: {'Content-Type':'application/json','apikey':SUPABASE_ANON_KEY,'Authorization':'Bearer '+SUPABASE_ANON_KEY},
        body: JSON.stringify({ messages:[{role:'user',content:prompt}], system:'Return only valid JSON. No markdown, no backticks, no explanation.' })
      });
      const apiData = await apiRes.json();
      const text = apiData.content?.[0]?.text || apiData.choices?.[0]?.message?.content || "";
      const clean = text.replace(/```json|```/g,"").trim();
      setPlaylist(JSON.parse(clean));
    } catch(e) { console.error(e); }
    setPlaylistLoading(false);
  };

  const [resources, setResources] = useState(null);
  const [scripture, setScripture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState('all');
  const [lastGenerated, setLastGenerated] = useState(null);

  useEffect(() => {
    const cached = localStorage.getItem('bonfire_resources');
    if (cached) {
      try {
        const { date, data: r, scripture: s } = JSON.parse(cached);
        setResources(r); setScripture(s); setLastGenerated(date);
        return;
      } catch(e) {}
    }
    generate();
  }, []);

  const buildContext = () => {
    const scores = data?.auditScores || {};
    const LABELS = {
      sp1:"Passion Clarity",sp2:"Work Alignment",sp3:"Pattern Recognition",sp4:"Skill Development",sp5:"Financial Provision",sp6:"Personality Alignment",
      sy1:"Structure",sy2:"Yield",sy3:"Support",sy4:"Time",sy5:"Energy",sy6:"Money",sy7:"Story",
      ai1:"Audit Rhythm",ai2:"Intentional Investment",ai3:"Reflection Practice",ai4:"Drift Prevention",ai5:"Sustainable Growth"
    };
    const allKeys = Object.keys(LABELS);
    const scored = allKeys.map(k=>({k,l:LABELS[k],v:Number(scores[k])||0})).filter(x=>x.v>0);
    const bottom3 = [...scored].sort((a,b)=>a.v-b.v).slice(0,3);
    const profile = data?.profile || {};
    return {
      bottom3,
      sparkStatement: data?.sparkStatement || '',
      name: profile.name || '',
      sector: profile.sector || '',
      roleLevel: profile.roleLevel || '',
      occupation: profile.occupation || '',
    };
  };

  const generate = async () => {
    setLoading(true);
    const ctx = buildContext();
    const gapStr = ctx.bottom3.map(x => x.l + ' (' + x.v + '/5)').join(', ');
    const identityStr = [ctx.sector, ctx.roleLevel, ctx.occupation].filter(Boolean).join(', ');

    const prompt = `You are a Bonfire Method leadership coach curating a daily resource list.

Client: ${ctx.name || 'a leader'}
Identity: ${identityStr || 'leadership role'}
Spark Statement: ${ctx.sparkStatement || 'Not defined'}
Biggest needs (lowest scores): ${gapStr || 'general leadership development'}

Generate a curated daily resource list. Return ONLY valid JSON, no markdown, no preamble:
{
  "headline": "one sentence explaining today's focus",
  "focus_area": "the single biggest gap area name",
  "resources": [
    {
      "type": "book",
      "title": "exact book title",
      "author": "author full name",
      "url": "https://www.amazon.com/s?k=TITLE+AUTHOR (real Amazon or Goodreads search URL)",
      "why": "1-2 sentences on why this addresses their gap",
      "takeaway": "one actionable takeaway for this week"
    },
    {
      "type": "book",
      "title": "second book title",
      "author": "author full name",
      "url": "https://www.goodreads.com/search?q=TITLE",
      "why": "why this helps",
      "takeaway": "one actionable takeaway"
    },
    {
      "type": "article",
      "title": "article or blog post title",
      "author": "publication or author name",
      "url": "https://hbr.org or https://medium.com or real article URL",
      "why": "why this helps",
      "takeaway": "one actionable takeaway"
    },
    {
      "type": "podcast",
      "title": "Podcast Name — Episode Title",
      "author": "host name",
      "url": "https://open.spotify.com/show/... or https://podcasts.apple.com/... or real show URL",
      "why": "why this helps",
      "takeaway": "one actionable takeaway"
    },
    {
      "type": "podcast",
      "title": "Second Podcast — Episode Title",
      "author": "host name",
      "url": "https://open.spotify.com/show/... or podcast homepage URL",
      "why": "why this helps",
      "takeaway": "one actionable takeaway"
    },
    {
      "type": "practice",
      "title": "specific daily practice title",
      "author": "source or framework name",
      "url": "https://relevant resource, tool, or article URL about this practice",
      "why": "why this directly addresses their gap",
      "takeaway": "do this specific thing today"
    }
  ]
}

IMPORTANT: Every resource must have a real, working URL. For books use Amazon search or Goodreads. For podcasts use Spotify or Apple Podcasts. For articles use the real publication URL. For practices link to a relevant resource.`;

    const scripturePrompt = `A leader with biggest needs: ${gapStr || 'leadership development'} — ${identityStr ? 'working in ' + identityStr : ''}.
Return ONLY valid JSON: {"reference":"Book Ch:V","text":"full passage text (ESV or NIV)","application":"2-3 sentences applying this to their biggest need"}`;

    try {
      const [resRes, scrRes] = await Promise.all([
        fetch(SUPABASE_URL + '/functions/v1/coach', {
          method:'POST',
          headers:{'Content-Type':'application/json','apikey':SUPABASE_ANON_KEY,'Authorization':'Bearer '+SUPABASE_ANON_KEY},
          body:JSON.stringify({ messages:[{role:'user',content:prompt}], system:'Return only valid JSON. No markdown. No preamble. Every resource must include a url field.', max_tokens:1400 })
        }),
        fetch(SUPABASE_URL + '/functions/v1/coach', {
          method:'POST',
          headers:{'Content-Type':'application/json','apikey':SUPABASE_ANON_KEY,'Authorization':'Bearer '+SUPABASE_ANON_KEY},
          body:JSON.stringify({ messages:[{role:'user',content:scripturePrompt}], system:'Return only valid JSON. No markdown.', max_tokens:300 })
        })
      ]);

      const [rd, sd] = await Promise.all([resRes.json(), scrRes.json()]);

      let parsedResources = null, parsedScripture = null;
      try {
        const rText = (rd.content?.[0]?.text||'').replace(/^```json\n?|\n?```$/g,'').trim();
        parsedResources = JSON.parse(rText);
      } catch(e) { console.error('Resources parse error:', e); }

      try {
        const sText = (sd.content?.[0]?.text||'').replace(/^```json\n?|\n?```$/g,'').trim();
        parsedScripture = JSON.parse(sText);
      } catch(e) { console.error('Scripture parse error:', e); }

      if (parsedResources) {
        const today = todayKey();
        setResources(parsedResources);
        setScripture(parsedScripture);
        setLastGenerated(today);
        localStorage.setItem('bonfire_resources', JSON.stringify({ date: today, data: parsedResources, scripture: parsedScripture }));
      }
    } catch(e) { console.error('Generate error:', e); }
    setLoading(false);
  };

  const refresh = () => {
    localStorage.removeItem('bonfire_resources');
    setResources(null); setScripture(null); setLoading(false);
    setTimeout(generate, 50);
  };

  const typeIcon = (type) => RESOURCE_TYPES.find(t=>t.key===type)?.icon || '🔥';
  const typeLabel = (type) => RESOURCE_TYPES.find(t=>t.key===type)?.label?.slice(0,-1) || type;
  const filtered = resources?.resources?.filter(r => activeType === 'all' || r.type === activeType) || [];

  // Build a search URL fallback if AI didn't provide one
  const getUrl = (r) => {
    if (r.url && r.url.startsWith('http')) return r.url;
    const q = encodeURIComponent((r.title||'') + ' ' + (r.author||''));
    if (r.type === 'book') return `https://www.amazon.com/s?k=${q}`;
    if (r.type === 'podcast') return `https://open.spotify.com/search/${encodeURIComponent(r.title||'')}`;
    if (r.type === 'article') return `https://www.google.com/search?q=${q}`;
    return `https://www.google.com/search?q=${q}`;
  };

  return (
    <div style={{ padding:"1.5rem 1rem", maxWidth:760, margin:"0 auto" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1.25rem", flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ fontFamily:"var(--font-display)", fontSize:"1.4rem", color:"var(--cream)", marginBottom:4 }}>
            Resources
          </div>
          <div style={{ fontSize:"0.78rem", color:"var(--smoke)" }}>
            Curated daily for your biggest growth areas
            {lastGenerated && <span> · {lastGenerated}</span>}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={refresh} disabled={loading} style={{ fontSize:"0.78rem" }}>
          {loading ? <><span className="spinner" style={{width:10,height:10}}/> Generating...</> : "↻ Refresh"}
        </button>
      </div>


      {resources && (
        <div>

          {/* Scripture */}
          {scripture && (
            <div className="card" style={{ marginBottom:"1rem", background:"rgba(42,157,143,0.06)", border:"1px solid rgba(42,157,143,0.2)" }}>
              <div style={{ fontSize:"0.65rem", color:"#2A9D8F", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>📖 Scripture for Today</div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:"0.9rem", color:"var(--pale)", fontStyle:"italic", lineHeight:1.7, marginBottom:8 }}>
                "{scripture.text}"
              </div>
              <div style={{ fontSize:"0.78rem", color:"#2A9D8F", fontWeight:600, marginBottom:8 }}>— {scripture.reference}</div>
              <div style={{ fontSize:"0.8rem", color:"var(--fog)", lineHeight:1.6, borderTop:"1px solid rgba(42,157,143,0.15)", paddingTop:8 }}>
                {scripture.application}
              </div>
            </div>
          )}

        {/* Spotify Playlist */}
        <div className="card" style={{marginBottom:"1rem"}}>
          <div className="card-header">
            <div>
              <div className="card-title">🎵 Your Focus Playlist</div>
              <div className="card-sub" style={{marginTop:2}}>Curated by AI based on your current scores and season</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={generatePlaylist} disabled={playlistLoading}
              style={{fontSize:"0.75rem",color:"var(--ember)",borderColor:"rgba(232,89,60,0.4)"}}>
              {playlistLoading ? <><span className="spinner" style={{width:10,height:10}}/> Generating...</> : "↺ Refresh"}
            </button>
          </div>
          {playlist ? (
            <div>
              <div style={{fontSize:"0.85rem",color:"var(--pale)",lineHeight:1.7,marginBottom:12,padding:"10px 14px",background:"var(--ash)",borderRadius:8,fontStyle:"italic"}}>
                "{playlist.rationale}"
              </div>
              <div style={{display:"grid",gap:6}}>
                {(playlist.tracks||[]).map((t,i)=>(
                  <a key={i} href={"https://open.spotify.com/search/"+encodeURIComponent((t.title||"")+" "+(t.artist||""))} target="_blank" rel="noreferrer"
                    style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"var(--ash)",borderRadius:8,textDecoration:"none",cursor:"pointer"}}>
                    <span style={{fontSize:"1rem",minWidth:20,textAlign:"center"}}>{t.emoji||"🎵"}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:"0.82rem",color:"var(--pale)",fontWeight:500}}>{t.title}</div>
                      <div style={{fontSize:"0.72rem",color:"var(--smoke)"}}>{t.artist}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{fontSize:"0.68rem",color:"var(--ember)",padding:"2px 8px",background:"rgba(232,89,60,0.1)",borderRadius:12}}>{t.vibe}</div>
                      <span style={{fontSize:"0.75rem",color:"#1DB954"}}>↗</span>
                    </div>
                  </a>
                ))}
              </div>
  
            </div>
          ) : playlistLoading ? (
            <div style={{textAlign:"center",padding:"1.5rem",color:"var(--smoke)",fontSize:"0.875rem"}}>Curating your playlist...</div>
          ) : (
            <div style={{textAlign:"center",padding:"1.5rem",color:"var(--smoke)",fontSize:"0.875rem"}}>
              No playlist yet — click Refresh to generate one based on your current scores.
            </div>
          )}


      {/* Loading */}
      {loading && !resources && (
        <div className="card" style={{ textAlign:"center", padding:"3rem" }}>
          <span className="spinner" style={{ width:24, height:24, margin:"0 auto 1rem" }} />
          <div style={{ fontSize:"0.85rem", color:"var(--smoke)" }}>Curating your personalized resource list...</div>
        </div>
      )}


      {resources && (<div>
          {/* Type filter tabs */}
          <div style={{ display:"flex", gap:6, marginBottom:"1rem", flexWrap:"wrap" }}>
            {[{key:'all',label:'All',icon:'🔥'},...RESOURCE_TYPES].map(t=>(
              <button key={t.key} onClick={()=>setActiveType(t.key)}
                style={{ padding:"4px 12px", borderRadius:20, border:"1px solid",
                  borderColor:activeType===t.key?"var(--ember)":"var(--ash)",
                  background:activeType===t.key?"rgba(232,89,60,0.15)":"transparent",
                  color:activeType===t.key?"var(--ember-light)":"var(--smoke)",
                  cursor:"pointer", fontSize:"0.75rem", fontFamily:"var(--font-body)" }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Resource cards */}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {filtered.map((r, i) => {
              const url = getUrl(r);
              return (
                <div key={i} className="card" style={{ borderLeft:"3px solid var(--ember)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <span style={{ fontSize:"1rem" }}>{typeIcon(r.type)}</span>
                        <span style={{ fontSize:"0.62rem", color:"var(--ember)", textTransform:"uppercase", letterSpacing:"0.08em", background:"rgba(232,89,60,0.1)", padding:"2px 8px", borderRadius:20 }}>
                          {typeLabel(r.type)}
                        </span>
                      </div>
                      <a href={url} target="_blank" rel="noreferrer"
                        style={{ fontFamily:"var(--font-display)", fontSize:"1rem", color:"var(--cream)", textDecoration:"none", display:"block", marginBottom:2, lineHeight:1.3 }}
                        onMouseEnter={e=>e.currentTarget.style.color='var(--ember-light)'}
                        onMouseLeave={e=>e.currentTarget.style.color='var(--cream)'}>
                        {r.title} ↗
                      </a>
                      <div style={{ fontSize:"0.78rem", color:"var(--smoke)" }}>{r.author}</div>
                    </div>
                    <a href={url} target="_blank" rel="noreferrer"
                      style={{ flexShrink:0, marginLeft:12, padding:"5px 12px", background:"rgba(232,89,60,0.12)", border:"1px solid rgba(232,89,60,0.25)", borderRadius:6, color:"var(--ember-light)", fontSize:"0.72rem", textDecoration:"none", whiteSpace:"nowrap" }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(232,89,60,0.25)'}
                      onMouseLeave={e=>e.currentTarget.style.background='rgba(232,89,60,0.12)'}>
                      Open →
                    </a>
                  </div>
                  <div style={{ fontSize:"0.82rem", color:"var(--fog)", lineHeight:1.65, marginBottom:10 }}>{r.why}</div>
                  <div style={{ background:"rgba(232,89,60,0.07)", border:"1px solid rgba(232,89,60,0.15)", borderRadius:8, padding:"8px 12px" }}>
                    <div style={{ fontSize:"0.62rem", color:"var(--ember)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>This week's takeaway</div>
                    <div style={{ fontSize:"0.82rem", color:"var(--pale)", lineHeight:1.6 }}>{r.takeaway}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="card" style={{ textAlign:"center", padding:"2rem", color:"var(--smoke)", fontSize:"0.82rem" }}>
              No resources found for this filter.
            </div>
          )}
      </div>
      )}

    </div>
  );
}