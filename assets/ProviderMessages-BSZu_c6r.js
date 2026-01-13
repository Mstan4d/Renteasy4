import{r as i,j as e}from"./index-DRyMwwkr.js";import{P as b}from"./ProviderPageTemplate-DE_zu0kM.js";import{Y as v,y,Z as j,_ as w,$ as N,a0 as k,a1 as M}from"./index-CbNkEdQY.js";const z=()=>{const[l,p]=i.useState([{id:1,name:"John Doe",lastMessage:"Can you send me a quote?",time:"10:30 AM",unread:2,avatar:"JD",type:"tenant"},{id:2,name:"Jane Smith",lastMessage:"Thanks for the great service!",time:"Yesterday",unread:0,avatar:"JS",type:"landlord"},{id:3,name:"Mike Johnson",lastMessage:"Are you available tomorrow?",time:"2 days ago",unread:1,avatar:"MJ",type:"tenant"},{id:4,name:"Sarah Williams",lastMessage:"I need cleaning service",time:"3 days ago",unread:0,avatar:"SW",type:"estate-firm"},{id:5,name:"David Brown",lastMessage:"Payment sent",time:"1 week ago",unread:0,avatar:"DB",type:"landlord"}]),[r,x]=i.useState(1),[n,g]=i.useState([{id:1,sender:"tenant",text:"Hello, I need cleaning service for my 3-bedroom apartment",time:"10:00 AM"},{id:2,sender:"provider",text:"Hi John! I'd be happy to help. What date do you need the service?",time:"10:05 AM"},{id:3,sender:"tenant",text:"This Friday, January 15th",time:"10:10 AM"},{id:4,sender:"tenant",text:"Can you send me a quote?",time:"10:30 AM"}]),[t,c]=i.useState(""),s=l.find(a=>a.id===r),m=()=>{if(!t.trim())return;const a={id:n.length+1,sender:"provider",text:t,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})};g([...n,a]),c(""),p(f=>f.map(d=>d.id===r?{...d,lastMessage:t,time:"Just now",unread:0}:d))},u=a=>{a.key==="Enter"&&!a.shiftKey&&(a.preventDefault(),m())},o=a=>{switch(a){case"tenant":return"#2196f3";case"landlord":return"#4caf50";case"estate-firm":return"#9c27b0";case"manager":return"#ff9800";default:return"#757575"}},h=a=>{switch(a){case"tenant":return"Tenant";case"landlord":return"Landlord";case"estate-firm":return"Estate Firm";case"manager":return"Manager";default:return"User"}};return e.jsxs(b,{title:"Messages",subtitle:"Communicate with clients and partners",children:[e.jsxs("div",{className:"messages-container",children:[e.jsxs("div",{className:"conversations-sidebar",children:[e.jsx("div",{className:"sidebar-header",children:e.jsxs("div",{style:{position:"relative",width:"100%"},children:[e.jsx(v,{style:{position:"absolute",left:"1rem",top:"50%",transform:"translateY(-50%)",color:"#666"}}),e.jsx("input",{type:"text",placeholder:"Search conversations...",className:"form-control",style:{paddingLeft:"2.5rem"}})]})}),e.jsx("div",{className:"conversations-list",children:l.map(a=>e.jsxs("div",{className:`conversation-item ${r===a.id?"active":""}`,onClick:()=>x(a.id),children:[e.jsx("div",{className:"conversation-avatar",style:{background:o(a.type)},children:a.avatar}),e.jsxs("div",{className:"conversation-info",children:[e.jsxs("div",{className:"conversation-header",children:[e.jsx("h4",{style:{margin:0},children:a.name}),e.jsx("span",{className:"conversation-time",children:a.time})]}),e.jsxs("div",{className:"conversation-preview",children:[e.jsx("p",{style:{margin:0,color:"#666"},children:a.lastMessage}),a.unread>0&&e.jsx("span",{className:"unread-badge",children:a.unread})]}),e.jsx("div",{className:"conversation-type",children:e.jsx("span",{style:{fontSize:"0.8rem",color:o(a.type),fontWeight:"600"},children:h(a.type)})})]})]},a.id))})]}),e.jsx("div",{className:"chat-area",children:s?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"chat-header",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1rem"},children:[e.jsx("div",{className:"chat-avatar",style:{background:o(s.type)},children:s.avatar}),e.jsxs("div",{children:[e.jsx("h3",{style:{margin:0},children:s.name}),e.jsxs("p",{style:{margin:"0.2rem 0 0",color:"#666",fontSize:"0.9rem"},children:[h(s.type)," • Last seen recently"]})]})]}),e.jsxs("div",{className:"chat-actions",children:[e.jsx("button",{className:"chat-action-btn",title:"Voice Call",children:e.jsx(y,{})}),e.jsx("button",{className:"chat-action-btn",title:"Video Call",children:e.jsx(j,{})})]})]}),e.jsx("div",{className:"messages-list",children:n.map(a=>e.jsx("div",{className:`message ${a.sender==="provider"?"sent":"received"}`,children:e.jsxs("div",{className:"message-bubble",children:[e.jsx("p",{style:{margin:0},children:a.text}),e.jsx("span",{className:"message-time",children:a.time})]})},a.id))}),e.jsxs("div",{className:"message-input-area",children:[e.jsxs("div",{className:"input-actions",children:[e.jsx("button",{className:"input-action-btn",children:e.jsx(w,{})}),e.jsx("button",{className:"input-action-btn",children:e.jsx(N,{})}),e.jsx("button",{className:"input-action-btn",children:e.jsx(k,{})})]}),e.jsx("textarea",{className:"message-input",placeholder:"Type your message here...",value:t,onChange:a=>c(a.target.value),onKeyPress:u,rows:"1"}),e.jsx("button",{className:"send-button",onClick:m,disabled:!t.trim(),children:e.jsx(M,{})})]})]}):e.jsx("div",{className:"no-chat-selected",children:e.jsxs("div",{className:"empty-state",children:[e.jsx("div",{className:"empty-state-icon",children:"💬"}),e.jsx("h3",{children:"Select a conversation"}),e.jsx("p",{children:"Choose a conversation from the list to start messaging"})]})})})]}),e.jsx("style",{jsx:!0,children:`
        .messages-container {
          display: grid;
          grid-template-columns: 350px 1fr;
          height: calc(100vh - 200px);
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .conversations-sidebar {
          border-right: 1px solid #e0e0e0;
          display: flex;
          flex-direction: column;
        }
        
        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .conversations-list {
          flex: 1;
          overflow-y: auto;
        }
        
        .conversation-item {
          display: flex;
          padding: 1rem 1.5rem;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .conversation-item:hover {
          background: #f8f9fa;
        }
        
        .conversation-item.active {
          background: #e8f0fe;
          border-left: 4px solid #1a237e;
        }
        
        .conversation-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
          flex-shrink: 0;
        }
        
        .conversation-info {
          flex: 1;
          min-width: 0;
        }
        
        .conversation-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.3rem;
        }
        
        .conversation-time {
          font-size: 0.8rem;
          color: #666;
          white-space: nowrap;
        }
        
        .conversation-preview {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.3rem;
        }
        
        .conversation-preview p {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .unread-badge {
          background: #1a237e;
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 600;
          flex-shrink: 0;
        }
        
        .chat-area {
          display: flex;
          flex-direction: column;
        }
        
        .chat-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          z-index: 10;
        }
        
        .chat-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
        }
        
        .chat-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .chat-action-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid #ddd;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .chat-action-btn:hover {
          background: #f8f9fa;
          border-color: #1a237e;
          color: #1a237e;
        }
        
        .messages-list {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: #f8f9fa;
        }
        
        .message {
          display: flex;
        }
        
        .message.sent {
          justify-content: flex-end;
        }
        
        .message.received {
          justify-content: flex-start;
        }
        
        .message-bubble {
          max-width: 70%;
          padding: 0.8rem 1rem;
          border-radius: 18px;
          position: relative;
        }
        
        .message.sent .message-bubble {
          background: #1a237e;
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        .message.received .message-bubble {
          background: white;
          color: #333;
          border: 1px solid #e0e0e0;
          border-bottom-left-radius: 4px;
        }
        
        .message-time {
          display: block;
          font-size: 0.7rem;
          opacity: 0.7;
          margin-top: 0.3rem;
          text-align: right;
        }
        
        .message-input-area {
          padding: 1rem 1.5rem;
          border-top: 1px solid #e0e0e0;
          display: flex;
          align-items: flex-end;
          gap: 1rem;
          background: white;
        }
        
        .input-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .input-action-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid #ddd;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .input-action-btn:hover {
          background: #f8f9fa;
          border-color: #1a237e;
          color: #1a237e;
        }
        
        .message-input {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 24px;
          padding: 0.8rem 1rem;
          font-size: 1rem;
          resize: none;
          max-height: 120px;
          min-height: 40px;
          outline: none;
          transition: all 0.3s ease;
        }
        
        .message-input:focus {
          border-color: #1a237e;
          box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
        }
        
        .send-button {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #1a237e;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .send-button:hover:not(:disabled) {
          background: #283593;
          transform: scale(1.05);
        }
        
        .send-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .no-chat-selected {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: #f8f9fa;
        }
        
        @media (max-width: 992px) {
          .messages-container {
            grid-template-columns: 1fr;
          }
          
          .conversations-sidebar {
            display: none;
          }
        }
        
        @media (max-width: 768px) {
          .chat-header {
            padding: 1rem;
          }
          
          .message-input-area {
            padding: 1rem;
          }
          
          .message-bubble {
            max-width: 85%;
          }
        }
      `})]})};export{z as default};
