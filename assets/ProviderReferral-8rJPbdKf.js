import{r as i,j as e}from"./index-DRyMwwkr.js";import{P as C}from"./ProviderPageTemplate-DE_zu0kM.js";import{ae as p,af as z,F,c as E,m as L,h as P,ag as x,N as g,a8 as T,a as U,ah as Y,ai as f,z as u,aj as b,q as M,S as q,U as A}from"./index-CbNkEdQY.js";const G=()=>{const[r,B]=i.useState({totalReferrals:24,activeReferrals:8,convertedReferrals:5,pendingEarnings:12500,totalEarned:37500,conversionRate:"21%",thisMonth:3,lastMonth:5}),[l]=i.useState({commission:5e3,conditions:"Friend must complete their first booking",reward:"₦5,000 per successful referral",terms:["Both you and your friend must be active users","Friend must sign up using your referral link","Friend must complete at least one paid booking","Commission paid after 7 days of successful booking","No limit on number of referrals"]}),[d,$]=i.useState([{id:1,name:"John Doe",email:"john@example.com",dateReferred:"2024-01-10",status:"converted",bookingCompleted:"2024-01-15",earnings:5e3,service:"House Cleaning"},{id:2,name:"Jane Smith",email:"jane@example.com",dateReferred:"2024-01-08",status:"active",bookingCompleted:null,earnings:0,service:null},{id:3,name:"Mike Johnson",email:"mike@example.com",dateReferred:"2024-01-05",status:"converted",bookingCompleted:"2024-01-12",earnings:5e3,service:"Painting Service"},{id:4,name:"Sarah Williams",email:"sarah@example.com",dateReferred:"2023-12-28",status:"expired",bookingCompleted:null,earnings:0,service:null},{id:5,name:"David Brown",email:"david@example.com",dateReferred:"2023-12-20",status:"converted",bookingCompleted:"2023-12-28",earnings:5e3,service:"Plumbing Repair"},{id:6,name:"Lisa Anderson",email:"lisa@example.com",dateReferred:"2024-01-14",status:"pending",bookingCompleted:null,earnings:0,service:null}]),[o,J]=i.useState([{rank:1,name:"Michael Chen",referrals:42,earnings:21e4},{rank:2,name:"Sarah Johnson",referrals:35,earnings:175e3},{rank:3,name:"David Smith",referrals:28,earnings:14e4},{rank:4,name:"Your Position",referrals:24,earnings:37500,isCurrentUser:!0},{rank:5,name:"Emma Wilson",referrals:22,earnings:11e4},{rank:6,name:"James Brown",referrals:18,earnings:9e4},{rank:7,name:"Maria Garcia",referrals:15,earnings:75e3}]),[n,W]=i.useState("https://renteasy.com/ref/provider123"),[j,v]=i.useState("link"),[t,y]=i.useState(!1),[c,m]=i.useState(!1),N=()=>{navigator.clipboard.writeText(n),m(!0),setTimeout(()=>m(!1),2e3)},k=[{id:"link",label:"Link",icon:e.jsx(g,{})},{id:"email",label:"Email",icon:e.jsx(u,{})},{id:"whatsapp",label:"WhatsApp",icon:e.jsx(b,{})},{id:"facebook",label:"Facebook",icon:e.jsx(q,{})},{id:"twitter",label:"Twitter",icon:e.jsx(A,{})}],h=s=>{switch(s){case"converted":return"#4caf50";case"active":return"#2196f3";case"pending":return"#ff9800";case"expired":return"#f44336";default:return"#666"}},w=s=>{switch(s){case"converted":return"💰";case"active":return"👤";case"pending":return"⏳";case"expired":return"❌";default:return"👤"}},S=s=>{let a="";switch(s){case"whatsapp":a=`https://wa.me/?text=Join%20RentEasy%20using%20my%20referral%20link:%20${encodeURIComponent(n)}`;break;case"facebook":a=`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(n)}`;break;case"twitter":a=`https://twitter.com/intent/tweet?text=Join%20RentEasy%20using%20my%20referral%20link&url=${encodeURIComponent(n)}`;break;case"email":a=`mailto:?subject=Join%20RentEasy&body=Use%20my%20referral%20link:%20${encodeURIComponent(n)}`;break;default:return}window.open(a,"_blank")},R=d;return e.jsxs(C,{title:"Referral Program",subtitle:"Earn money by referring friends to RentEasy",actions:e.jsxs("div",{style:{display:"flex",gap:"1rem",flexWrap:"wrap"},children:[e.jsxs("button",{className:"btn-secondary",children:[e.jsx(M,{style:{marginRight:"0.5rem"}}),"Earnings History"]}),e.jsxs("button",{className:"btn-primary",children:[e.jsx(f,{style:{marginRight:"0.5rem"}}),"Share Program"]})]}),children:[e.jsxs("div",{className:"provider-grid",style:{marginBottom:"2rem"},children:[e.jsxs("div",{className:"provider-card stats-card",style:{background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",style:{color:"white"},children:"Total Referrals"}),e.jsx(p,{style:{color:"white",fontSize:"1.5rem"}})]}),e.jsx("div",{className:"stats-number",style:{color:"white"},children:r.totalReferrals}),e.jsx("div",{className:"stats-label",style:{color:"rgba(255,255,255,0.9)"},children:"People referred"})]}),e.jsxs("div",{className:"provider-card stats-card",style:{background:"linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",style:{color:"white"},children:"Converted"}),e.jsx(z,{style:{color:"white",fontSize:"1.5rem"}})]}),e.jsx("div",{className:"stats-number",style:{color:"white"},children:r.convertedReferrals}),e.jsx("div",{className:"stats-label",style:{color:"rgba(255,255,255,0.9)"},children:"Successful referrals"})]}),e.jsxs("div",{className:"provider-card stats-card",style:{background:"linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",style:{color:"white"},children:"Total Earned"}),e.jsx(F,{style:{color:"white",fontSize:"1.5rem"}})]}),e.jsxs("div",{className:"stats-number",style:{color:"white"},children:["₦",r.totalEarned.toLocaleString()]}),e.jsx("div",{className:"stats-label",style:{color:"rgba(255,255,255,0.9)"},children:"From referrals"})]}),e.jsxs("div",{className:"provider-card stats-card",style:{background:"linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",style:{color:"white"},children:"Conversion Rate"}),e.jsx(E,{style:{color:"white",fontSize:"1.5rem"}})]}),e.jsx("div",{className:"stats-number",style:{color:"white"},children:r.conversionRate}),e.jsx("div",{className:"stats-label",style:{color:"rgba(255,255,255,0.9)"},children:"Success rate"})]})]}),e.jsxs("div",{className:"provider-card",style:{marginBottom:"2rem"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Program Details"}),e.jsxs("div",{className:"reward-badge",children:[e.jsx(L,{style:{marginRight:"0.5rem"}}),"Earn ₦",l.commission.toLocaleString()," per referral"]})]}),e.jsxs("div",{className:"program-details",children:[e.jsxs("div",{className:"detail-section",children:[e.jsx("h4",{children:"How It Works"}),e.jsxs("div",{className:"steps",children:[e.jsxs("div",{className:"step",children:[e.jsx("div",{className:"step-number",children:"1"}),e.jsxs("div",{className:"step-content",children:[e.jsx("strong",{children:"Share Your Link"}),e.jsx("p",{children:"Share your unique referral link with friends"})]})]}),e.jsxs("div",{className:"step",children:[e.jsx("div",{className:"step-number",children:"2"}),e.jsxs("div",{className:"step-content",children:[e.jsx("strong",{children:"Friend Signs Up"}),e.jsx("p",{children:"Your friend signs up using your link"})]})]}),e.jsxs("div",{className:"step",children:[e.jsx("div",{className:"step-number",children:"3"}),e.jsxs("div",{className:"step-content",children:[e.jsx("strong",{children:"Complete Booking"}),e.jsx("p",{children:"Friend completes their first booking"})]})]}),e.jsxs("div",{className:"step",children:[e.jsx("div",{className:"step-number",children:"4"}),e.jsxs("div",{className:"step-content",children:[e.jsx("strong",{children:"Get Paid"}),e.jsxs("p",{children:["You receive ₦",l.commission.toLocaleString()," after 7 days"]})]})]})]})]}),e.jsxs("div",{className:"detail-section",children:[e.jsx("h4",{children:"Terms & Conditions"}),e.jsx("ul",{className:"terms-list",children:l.terms.map((s,a)=>e.jsxs("li",{children:[e.jsx(P,{style:{color:"#4caf50",marginRight:"0.5rem"}}),s]},a))})]})]})]}),e.jsxs("div",{className:"provider-card",style:{marginBottom:"2rem"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Your Referral Link"}),e.jsxs("button",{className:"btn-secondary",onClick:()=>y(!t),children:[e.jsx(x,{style:{marginRight:"0.5rem"}}),t?"Hide QR Code":"Show QR Code"]})]}),e.jsxs("div",{className:"referral-link-section",children:[e.jsxs("div",{className:"link-container",children:[e.jsxs("div",{className:"link-display",children:[e.jsx(g,{style:{color:"#666",fontSize:"1.2rem"}}),e.jsx("input",{type:"text",readOnly:!0,value:n,className:"link-input"}),e.jsxs("button",{className:`copy-btn ${c?"copied":""}`,onClick:N,children:[e.jsx(T,{style:{marginRight:"0.5rem"}}),c?"Copied!":"Copy"]})]}),e.jsxs("p",{className:"link-note",children:["Share this link with friends. You get ₦",l.commission.toLocaleString()," when they complete their first booking."]})]}),t&&e.jsx("div",{className:"qr-code-section",children:e.jsxs("div",{className:"qr-code-placeholder",children:[e.jsx("div",{className:"qr-code",children:e.jsx(x,{style:{fontSize:"6rem",color:"#1a237e"}})}),e.jsx("p",{className:"qr-instructions",children:"Scan this QR code with your phone's camera to visit your referral page"})]})}),e.jsxs("div",{className:"share-methods",children:[e.jsx("h4",{style:{marginBottom:"1rem"},children:"Share Via"}),e.jsx("div",{className:"share-buttons",children:k.map(s=>e.jsxs("button",{className:`share-btn ${j===s.id?"active":""}`,onClick:()=>{v(s.id),s.id!=="link"&&S(s.id)},children:[s.icon,e.jsx("span",{children:s.label})]},s.id))})]})]})]}),e.jsxs("div",{className:"provider-grid",children:[e.jsxs("div",{className:"provider-card",style:{gridColumn:"span 2"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Your Referrals"}),e.jsxs("span",{className:"referrals-count",children:[d.length," total"]})]}),e.jsxs("div",{className:"referrals-table",children:[e.jsx("div",{className:"table-header",children:e.jsxs("div",{className:"table-row",children:[e.jsx("div",{className:"table-cell",children:"Name"}),e.jsx("div",{className:"table-cell",children:"Date Referred"}),e.jsx("div",{className:"table-cell",children:"Status"}),e.jsx("div",{className:"table-cell",children:"Booking"}),e.jsx("div",{className:"table-cell",children:"Earnings"})]})}),e.jsx("div",{className:"table-body",children:R.map(s=>e.jsxs("div",{className:"table-row",children:[e.jsx("div",{className:"table-cell",children:e.jsxs("div",{className:"referral-info",children:[e.jsx("div",{className:"referral-avatar",children:s.name.charAt(0)}),e.jsxs("div",{children:[e.jsx("div",{className:"referral-name",children:s.name}),e.jsx("div",{className:"referral-email",children:s.email})]})]})}),e.jsx("div",{className:"table-cell",children:e.jsxs("div",{className:"referral-date",children:[e.jsx(U,{style:{marginRight:"0.3rem",color:"#666"}}),s.dateReferred]})}),e.jsx("div",{className:"table-cell",children:e.jsxs("div",{className:"status-badge",style:{background:h(s.status)+"20",color:h(s.status)},children:[e.jsx("span",{className:"status-icon",children:w(s.status)}),e.jsx("span",{className:"status-text",children:s.status.charAt(0).toUpperCase()+s.status.slice(1)})]})}),e.jsx("div",{className:"table-cell",children:s.service?e.jsxs("div",{className:"booking-info",children:[e.jsx("div",{className:"service-name",children:s.service}),e.jsx("div",{className:"booking-date",children:s.bookingCompleted})]}):e.jsx("span",{className:"no-booking",children:"No booking yet"})}),e.jsx("div",{className:"table-cell",children:e.jsx("div",{className:`earnings ${s.earnings>0?"positive":"pending"}`,children:s.earnings>0?`₦${s.earnings.toLocaleString()}`:"—"})})]},s.id))})]}),e.jsxs("div",{className:"table-summary",children:[e.jsxs("div",{className:"summary-item",children:[e.jsx("strong",{children:"Total Conversions:"}),e.jsx("span",{children:r.convertedReferrals})]}),e.jsxs("div",{className:"summary-item",children:[e.jsx("strong",{children:"Total Earnings:"}),e.jsxs("span",{className:"earnings-total",children:["₦",r.totalEarned.toLocaleString()]})]}),e.jsxs("div",{className:"summary-item",children:[e.jsx("strong",{children:"Pending:"}),e.jsxs("span",{className:"earnings-pending",children:["₦",r.pendingEarnings.toLocaleString()]})]})]})]}),e.jsxs("div",{className:"provider-card",children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Referral Leaderboard"}),e.jsx(Y,{style:{color:"#ff9800",fontSize:"1.5rem"}})]}),e.jsx("div",{className:"leaderboard",children:o.map((s,a)=>e.jsxs("div",{className:`leaderboard-entry ${s.isCurrentUser?"current-user":""}`,children:[e.jsxs("div",{className:"rank",children:[e.jsx("span",{className:"rank-number",children:s.rank}),s.rank<=3&&e.jsx("span",{className:"rank-medal",children:s.rank===1?"🥇":s.rank===2?"🥈":"🥉"})]}),e.jsxs("div",{className:"entry-info",children:[e.jsxs("div",{className:"entry-name",children:[s.name,s.isCurrentUser&&e.jsx("span",{className:"you-badge",children:"You"})]}),e.jsxs("div",{className:"entry-stats",children:[e.jsxs("span",{children:[s.referrals," referrals"]}),e.jsx("span",{children:"•"}),e.jsxs("span",{children:["₦",s.earnings.toLocaleString()]})]})]}),e.jsxs("div",{className:"entry-earnings",children:[e.jsxs("div",{className:"earnings-amount",children:["₦",s.earnings.toLocaleString()]}),e.jsx("div",{className:"earnings-label",children:"earned"})]})]},s.rank))}),e.jsxs("div",{className:"leaderboard-stats",children:[e.jsxs("div",{className:"stat",children:[e.jsxs("div",{className:"stat-value",children:["#",o.find(s=>s.isCurrentUser)?.rank||"N/A"]}),e.jsx("div",{className:"stat-label",children:"Your Rank"})]}),e.jsxs("div",{className:"stat",children:[e.jsx("div",{className:"stat-value",children:r.totalReferrals}),e.jsx("div",{className:"stat-label",children:"Your Referrals"})]}),e.jsxs("div",{className:"stat",children:[e.jsxs("div",{className:"stat-value",children:["₦",r.totalEarned.toLocaleString()]}),e.jsx("div",{className:"stat-label",children:"Your Earnings"})]})]})]})]}),e.jsxs("div",{className:"provider-card",style:{marginTop:"2rem"},children:[e.jsx("div",{className:"card-header",children:e.jsx("h3",{className:"card-title",children:"Tips to Get More Referrals"})}),e.jsxs("div",{className:"tips-grid",children:[e.jsxs("div",{className:"tip-card",children:[e.jsx("div",{className:"tip-icon",style:{background:"#e3f2fd"},children:e.jsx(f,{style:{color:"#2196f3"}})}),e.jsxs("div",{children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0"},children:"Share on Social Media"}),e.jsx("p",{style:{margin:0,color:"#666",fontSize:"0.9rem"},children:"Post your referral link on Facebook, Twitter, and Instagram"})]})]}),e.jsxs("div",{className:"tip-card",children:[e.jsx("div",{className:"tip-icon",style:{background:"#e8f5e9"},children:e.jsx(u,{style:{color:"#4caf50"}})}),e.jsxs("div",{children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0"},children:"Email Your Contacts"}),e.jsx("p",{style:{margin:0,color:"#666",fontSize:"0.9rem"},children:"Send personalized emails to your professional network"})]})]}),e.jsxs("div",{className:"tip-card",children:[e.jsx("div",{className:"tip-icon",style:{background:"#fff3e0"},children:e.jsx(b,{style:{color:"#ff9800"}})}),e.jsxs("div",{children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0"},children:"WhatsApp Groups"}),e.jsx("p",{style:{margin:0,color:"#666",fontSize:"0.9rem"},children:"Share in relevant WhatsApp groups and communities"})]})]}),e.jsxs("div",{className:"tip-card",children:[e.jsx("div",{className:"tip-icon",style:{background:"#f3e5f5"},children:e.jsx(p,{style:{color:"#9c27b0"}})}),e.jsxs("div",{children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0"},children:"Tell Satisfied Clients"}),e.jsx("p",{style:{margin:0,color:"#666",fontSize:"0.9rem"},children:"Ask happy clients to refer their friends and family"})]})]})]})]}),e.jsx("style",{jsx:!0,children:`
        .reward-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
          color: white;
          border-radius: 20px;
          font-weight: 600;
        }
        
        .program-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        
        .detail-section {
          padding: 1rem;
        }
        
        .detail-section h4 {
          margin: 0 0 1rem 0;
          color: #1a237e;
        }
        
        .steps {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .step {
          display: flex;
          gap: 1rem;
        }
        
        .step-number {
          width: 30px;
          height: 30px;
          background: #1a237e;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          flex-shrink: 0;
        }
        
        .step-content {
          flex: 1;
        }
        
        .step-content strong {
          display: block;
          margin-bottom: 0.3rem;
        }
        
        .step-content p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }
        
        .terms-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .terms-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.8rem;
          font-size: 0.9rem;
          color: #666;
        }
        
        .referral-link-section {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .link-container {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
        }
        
        .link-display {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .link-input {
          flex: 1;
          padding: 0.8rem 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 0.9rem;
          background: white;
          color: #666;
        }
        
        .copy-btn {
          padding: 0.8rem 1.5rem;
          background: #1a237e;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
        }
        
        .copy-btn:hover {
          background: #283593;
          transform: translateY(-2px);
        }
        
        .copy-btn.copied {
          background: #4caf50;
        }
        
        .link-note {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }
        
        .qr-code-section {
          padding: 2rem;
          background: white;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
          text-align: center;
        }
        
        .qr-code-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .qr-code {
          padding: 2rem;
          background: white;
          border-radius: 12px;
          border: 2px dashed #ddd;
        }
        
        .qr-instructions {
          margin: 0;
          color: #666;
          max-width: 300px;
        }
        
        .share-methods {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
        }
        
        .share-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .share-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 80px;
        }
        
        .share-btn:hover {
          border-color: #1a237e;
          transform: translateY(-2px);
        }
        
        .share-btn.active {
          background: #1a237e;
          color: white;
          border-color: #1a237e;
        }
        
        .share-btn svg {
          font-size: 1.5rem;
        }
        
        .share-btn span {
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .referrals-table {
          width: 100%;
        }
        
        .table-header {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #e0e0e0;
        }
        
        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 2fr 1fr;
          gap: 1rem;
          padding: 1rem;
          align-items: center;
        }
        
        .table-body .table-row {
          border-bottom: 1px solid #e0e0e0;
          transition: all 0.3s ease;
        }
        
        .table-body .table-row:hover {
          background: #f8f9fa;
        }
        
        .referral-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .referral-avatar {
          width: 40px;
          height: 40px;
          background: #1a237e;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.2rem;
        }
        
        .referral-name {
          font-weight: 600;
          margin-bottom: 0.2rem;
        }
        
        .referral-email {
          font-size: 0.8rem;
          color: #666;
        }
        
        .referral-date {
          display: flex;
          align-items: center;
          color: #666;
          font-size: 0.9rem;
        }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .status-icon {
          font-size: 1rem;
        }
        
        .booking-info {
          display: flex;
          flex-direction: column;
        }
        
        .service-name {
          font-weight: 600;
          margin-bottom: 0.2rem;
        }
        
        .booking-date {
          font-size: 0.8rem;
          color: #666;
        }
        
        .no-booking {
          color: #666;
          font-style: italic;
        }
        
        .earnings {
          font-weight: 600;
          font-size: 1.1rem;
        }
        
        .earnings.positive {
          color: #4caf50;
        }
        
        .earnings.pending {
          color: #ff9800;
        }
        
        .table-summary {
          display: flex;
          justify-content: space-around;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
          margin-top: 1rem;
        }
        
        .summary-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        
        .summary-item strong {
          color: #666;
          font-size: 0.9rem;
        }
        
        .earnings-total {
          font-size: 1.5rem;
          font-weight: 700;
          color: #4caf50;
        }
        
        .earnings-pending {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ff9800;
        }
        
        .leaderboard {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin: 1rem 0;
          max-height: 400px;
          overflow-y: auto;
        }
        
        .leaderboard-entry {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .leaderboard-entry:hover {
          background: #f8f9fa;
        }
        
        .leaderboard-entry.current-user {
          background: #e8f0fe;
          border-left: 4px solid #1a237e;
        }
        
        .rank {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          min-width: 40px;
        }
        
        .rank-number {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1a237e;
        }
        
        .rank-medal {
          font-size: 1.2rem;
        }
        
        .entry-info {
          flex: 1;
        }
        
        .entry-name {
          font-weight: 600;
          margin-bottom: 0.3rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .you-badge {
          background: #1a237e;
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
        }
        
        .entry-stats {
          display: flex;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #666;
        }
        
        .entry-earnings {
          text-align: right;
        }
        
        .earnings-amount {
          font-weight: 700;
          color: #4caf50;
          font-size: 1.1rem;
        }
        
        .earnings-label {
          font-size: 0.7rem;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .leaderboard-stats {
          display: flex;
          justify-content: space-around;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
          margin-top: 1rem;
        }
        
        .leaderboard-stats .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .leaderboard-stats .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: #1a237e;
        }
        
        .leaderboard-stats .stat-label {
          color: #666;
          margin-top: 0.5rem;
          font-size: 0.9rem;
        }
        
        .tips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }
        
        .tip-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
          transition: all 0.3s ease;
        }
        
        .tip-card:hover {
          border-color: #1a237e;
          box-shadow: 0 4px 12px rgba(26, 35, 126, 0.1);
        }
        
        .tip-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        
        @media (max-width: 1200px) {
          .provider-card[style*="grid-column: span 2"] {
            grid-column: span 1;
          }
          
          .program-details {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 768px) {
          .table-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          
          .share-buttons {
            flex-direction: column;
          }
          
          .share-btn {
            flex-direction: row;
            justify-content: center;
          }
          
          .table-summary {
            flex-direction: column;
            gap: 1rem;
          }
          
          .leaderboard-stats {
            flex-direction: column;
            gap: 1rem;
          }
          
          .tips-grid {
            grid-template-columns: 1fr;
          }
        }
      `})]})};export{G as default};
