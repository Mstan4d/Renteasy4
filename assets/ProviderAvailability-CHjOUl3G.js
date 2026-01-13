import{r as h,j as e}from"./index-DRyMwwkr.js";import{P as C}from"./ProviderPageTemplate-DE_zu0kM.js";import{W as g,X as p,a as f,B as O,V as R}from"./index-CbNkEdQY.js";const F=()=>{const[d,o]=h.useState({monday:{active:!0,slots:[{from:"09:00",to:"17:00"}]},tuesday:{active:!0,slots:[{from:"09:00",to:"17:00"}]},wednesday:{active:!0,slots:[{from:"09:00",to:"17:00"}]},thursday:{active:!0,slots:[{from:"09:00",to:"17:00"}]},friday:{active:!0,slots:[{from:"09:00",to:"17:00"}]},saturday:{active:!1,slots:[{from:"10:00",to:"14:00"}]},sunday:{active:!1,slots:[]}}),[u,y]=h.useState([{id:1,date:"2024-01-20",reason:"Public Holiday",recurring:!1},{id:2,date:"2024-01-25",reason:"Personal Day",recurring:!1},{id:3,date:"2024-02-14",reason:"Valentine's Day",recurring:!0}]),[i,c]=h.useState({date:"",reason:"",recurring:!1}),j=[{key:"monday",label:"Monday"},{key:"tuesday",label:"Tuesday"},{key:"wednesday",label:"Wednesday"},{key:"thursday",label:"Thursday"},{key:"friday",label:"Friday"},{key:"saturday",label:"Saturday"},{key:"sunday",label:"Sunday"}],v=s=>{o(a=>({...a,[s]:{...a[s],active:!a[s].active}}))},b=s=>{const a=d[s],l=[...a.slots,{from:"09:00",to:"17:00"}];o(r=>({...r,[s]:{...a,slots:l}}))},x=(s,a,l,r)=>{const t=d[s],n=t.slots.map((m,T)=>T===a?{...m,[l]:r}:m);o(m=>({...m,[s]:{...t,slots:n}}))},N=(s,a)=>{const l=d[s],r=l.slots.filter((t,n)=>n!==a);o(t=>({...t,[s]:{...l,slots:r}}))},k=()=>{if(!i.date||!i.reason){alert("Please fill in all fields");return}y(s=>[...s,{id:s.length+1,...i}]),c({date:"",reason:"",recurring:!1})},S=s=>{y(a=>a.filter(l=>l.id!==s))},w=()=>{alert("Availability saved successfully!")};return e.jsxs(C,{title:"Availability Settings",subtitle:"Set your working hours and time off",actions:e.jsxs("button",{className:"btn-primary",onClick:w,children:[e.jsx(R,{style:{marginRight:"0.5rem"}}),"Save Changes"]}),children:[e.jsxs("div",{className:"provider-grid",children:[e.jsxs("div",{className:"provider-card",style:{gridColumn:"span 2"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Weekly Schedule"}),e.jsx("p",{className:"card-subtitle",children:"Set your regular working hours for each day"})]}),e.jsx("div",{className:"weekly-schedule",children:j.map(s=>{const a=d[s.key];return e.jsxs("div",{className:"day-schedule",children:[e.jsxs("div",{className:"day-header",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1rem"},children:[e.jsx("input",{type:"checkbox",id:`toggle-${s.key}`,checked:a.active,onChange:()=>v(s.key),style:{width:"20px",height:"20px"}}),e.jsx("label",{htmlFor:`toggle-${s.key}`,style:{fontWeight:"600",color:a.active?"#1a237e":"#666"},children:s.label})]}),a.active&&e.jsxs("button",{className:"btn-secondary",onClick:()=>b(s.key),style:{padding:"0.3rem 0.8rem",fontSize:"0.9rem"},children:[e.jsx(g,{style:{marginRight:"0.3rem"}}),"Add Slot"]})]}),a.active?e.jsx("div",{className:"time-slots",children:a.slots.map((l,r)=>e.jsxs("div",{className:"time-slot",children:[e.jsxs("div",{className:"time-inputs",children:[e.jsxs("div",{className:"time-input-group",children:[e.jsx("label",{children:"From"}),e.jsx("input",{type:"time",value:l.from,onChange:t=>x(s.key,r,"from",t.target.value),className:"form-control"})]}),e.jsxs("div",{className:"time-input-group",children:[e.jsx("label",{children:"To"}),e.jsx("input",{type:"time",value:l.to,onChange:t=>x(s.key,r,"to",t.target.value),className:"form-control"})]})]}),a.slots.length>1&&e.jsx("button",{className:"remove-slot-btn",onClick:()=>N(s.key,r),style:{padding:"0.5rem",background:"#f44336",color:"white",border:"none",borderRadius:"4px",cursor:"pointer"},children:e.jsx(p,{})})]},r))}):e.jsx("div",{style:{padding:"1rem",background:"#f8f9fa",borderRadius:"8px"},children:e.jsx("p",{style:{margin:0,color:"#666",fontStyle:"italic"},children:"Not available on this day"})})]},s.key)})})]}),e.jsxs("div",{className:"provider-card",children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Time Off / Holidays"}),e.jsx("p",{className:"card-subtitle",children:"Schedule days you won't be available"})]}),e.jsxs("div",{className:"add-time-off",children:[e.jsx("h4",{style:{marginBottom:"1rem"},children:"Add Time Off"}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Date"}),e.jsx("input",{type:"date",className:"form-control",value:i.date,onChange:s=>c({...i,date:s.target.value})})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Reason"}),e.jsx("input",{type:"text",className:"form-control",placeholder:"e.g., Public Holiday, Personal Day",value:i.reason,onChange:s=>c({...i,reason:s.target.value})})]}),e.jsx("div",{className:"form-group",children:e.jsxs("label",{style:{display:"flex",alignItems:"center",gap:"0.5rem"},children:[e.jsx("input",{type:"checkbox",checked:i.recurring,onChange:s=>c({...i,recurring:s.target.checked})}),"Recurring annually"]})}),e.jsxs("button",{className:"btn-primary",onClick:k,style:{width:"100%"},children:[e.jsx(g,{style:{marginRight:"0.5rem"}}),"Add Time Off"]})]}),e.jsxs("div",{style:{marginTop:"2rem"},children:[e.jsx("h4",{style:{marginBottom:"1rem"},children:"Scheduled Time Off"}),u.length===0?e.jsxs("div",{className:"empty-state",style:{padding:"2rem"},children:[e.jsx(f,{style:{fontSize:"3rem",color:"#ddd",marginBottom:"1rem"}}),e.jsx("p",{style:{color:"#666"},children:"No time off scheduled"})]}):e.jsx("div",{className:"time-off-list",children:u.map(s=>e.jsxs("div",{className:"time-off-item",children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:"600",fontSize:"1.1rem"},children:new Date(s.date).toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}),e.jsxs("div",{style:{color:"#666",marginTop:"0.3rem"},children:[s.reason,s.recurring&&e.jsx("span",{style:{background:"#e8f5e9",color:"#2e7d32",padding:"0.2rem 0.5rem",borderRadius:"12px",fontSize:"0.8rem",marginLeft:"0.5rem"},children:"Recurring"})]})]}),e.jsx("button",{className:"btn-secondary",onClick:()=>S(s.id),style:{padding:"0.5rem"},children:e.jsx(p,{})})]},s.id))})]})]})]}),e.jsxs("div",{className:"provider-card",style:{marginTop:"2rem"},children:[e.jsx("div",{className:"card-header",children:e.jsx("h3",{className:"card-title",children:"Availability Summary"})}),e.jsxs("div",{className:"availability-summary",children:[e.jsxs("div",{className:"summary-item",children:[e.jsx(f,{style:{fontSize:"2rem",color:"#1a237e"}}),e.jsxs("div",{children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0"},children:"Working Days"}),e.jsxs("p",{style:{margin:0,color:"#666"},children:[Object.values(d).filter(s=>s.active).length," days per week"]})]})]}),e.jsxs("div",{className:"summary-item",children:[e.jsx(O,{style:{fontSize:"2rem",color:"#1a237e"}}),e.jsxs("div",{children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0"},children:"Total Hours"}),e.jsxs("p",{style:{margin:0,color:"#666"},children:[Object.values(d).reduce((s,a)=>a.active?s+a.slots.reduce((l,r)=>{const t=parseInt(r.from.split(":")[0]),n=parseInt(r.to.split(":")[0]);return l+(n-t)},0):s,0)," hours per week"]})]})]}),e.jsxs("div",{className:"summary-item",children:[e.jsx(f,{style:{fontSize:"2rem",color:"#1a237e"}}),e.jsxs("div",{children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0"},children:"Time Off"}),e.jsxs("p",{style:{margin:0,color:"#666"},children:[u.length," days scheduled"]})]})]})]})]}),e.jsx("style",{jsx:!0,children:`
        .weekly-schedule {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .day-schedule {
          padding: 1.5rem;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        
        .day-schedule:hover {
          border-color: #1a237e;
        }
        
        .day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .time-slots {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .time-slot {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .time-inputs {
          display: flex;
          gap: 1rem;
          flex: 1;
        }
        
        .time-input-group {
          flex: 1;
        }
        
        .time-input-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
        }
        
        .add-time-off {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
          margin-bottom: 2rem;
        }
        
        .time-off-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .time-off-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .time-off-item:hover {
          border-color: #1a237e;
          background: #f8f9fa;
        }
        
        .availability-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          padding: 1.5rem;
        }
        
        .summary-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
        }
        
        @media (max-width: 992px) {
          .provider-card[style*="grid-column: span 2"] {
            grid-column: span 1;
          }
          
          .time-inputs {
            flex-direction: column;
          }
          
          .time-slot {
            flex-direction: column;
            align-items: stretch;
          }
          
          .remove-slot-btn {
            align-self: flex-end;
          }
        }
        
        @media (max-width: 768px) {
          .availability-summary {
            grid-template-columns: 1fr;
          }
          
          .day-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
      `})]})};export{F as default};
