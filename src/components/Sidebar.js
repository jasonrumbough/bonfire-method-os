import { useState } from "react";

const NAV = [
  { section:"Overview", items:[{ key:"dashboard", label:"DASHBOARD" }]},
  { section:"The Method", items:[
    { key:"spark",   label:"SPARK" },
    { key:"systems", label:"SYSTEMS" },
    { key:"air",     label:"AIR RHYTHM" },
  ]},
  { section:"Tools", items:[
    { key:"tend",        label:"TEND" },
    { key:"notes",       label:"NOTES" },
    { key:"history",     label:"HISTORY" },
    { key:"resources",   label:"RESOURCES" },
    { key:"coach",       label:"COACH" },
  ]},
  { section:"Personal", items:[
    { key:"personality", label:"PERSONALITY" },
    { key:"health",      label:"HEALTH DATA" },
  ]},
];

export default function Sidebar({ page, setPage, user, onSignOut, syncing, localOnly, onEraseData }) {
  const [open, setOpen] = useState(false);
  const navigate = (key) => {
    if (key === "air") setPage("audit_air");
    else setPage(key);
    setOpen(false);
  };
  const isActive = (key) => key === "air" ? page === "audit_air" : page === key;
  const email = user?.email || "";
  const initials = email ? email.slice(0,2).toUpperCase() : "BM";

  return (
    <>
      <div className="mobile-topbar">
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:"1.1rem"}}>🔥</span>
          <span style={{fontFamily:"var(--font-display)",color:"var(--ember)",fontSize:"1rem"}}>Bonfire</span>
        </div>
        <button className="hamburger" onClick={()=>setOpen(o=>!o)} aria-label="Menu">
          <span/><span/><span/>
        </button>
      </div>

      {open&&<div className="sidebar-overlay" onClick={()=>setOpen(false)}/>}

      <div className={"sidebar"+(open?" sidebar-open":"")}>
        <div className="sidebar-logo">
          <div style={{fontSize:"1.3rem",marginBottom:4}}>🔥</div>
          <div className="brand">Bonfire Method</div>
          <div className="sub">Personal OS</div>
        </div>

        <div style={{flex:1,overflowY:"auto"}}>
          {NAV.map(sec=>(
            <div key={sec.section} className="nav-section">
              <div className="nav-label">{sec.section}</div>
              {sec.items.map(item=>(
                <div key={item.key}
                  className={"nav-item"+(isActive(item.key)?" active":"")}
                  onClick={()=>navigate(item.key)}>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          {localOnly ? (
            <div style={{marginBottom:10}}>
              <div style={{fontSize:"0.75rem",color:"var(--pale)",fontWeight:500,marginBottom:2}}>Local mode</div>
              <div style={{fontSize:"0.65rem",color:"var(--smoke)"}}>Data saved to this device only</div>
            </div>
          ) : (
            <div style={{marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:"rgba(232,89,60,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem",fontWeight:600,color:"var(--ember-light)",flexShrink:0}}>
                  {initials}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:"0.72rem",color:"var(--pale)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{email}</div>
                  <div style={{fontSize:"0.62rem",color:syncing?"var(--gold)":"#5DCAA5",marginTop:1}}>
                    {syncing?"Syncing...":"Synced"}
                  </div>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={onSignOut}
                style={{width:"100%",justifyContent:"center",marginBottom:6,fontSize:"0.75rem"}}>
                Sign Out
              </button>
            </div>
          )}
          <button onClick={onEraseData}
            style={{width:"100%",background:"none",border:"none",color:"var(--smoke)",fontSize:"0.65rem",cursor:"pointer",padding:"4px 0",textAlign:"center",marginBottom:6}}>
            Erase all data
          </button>
          <div style={{fontSize:"0.62rem",color:"var(--smoke)",textAlign:"center"}}>
            <span style={{color:"var(--ember)"}}>thebonfirecompany.com</span> · © 2026
          </div>
        </div>
      </div>
    </>
  );
}