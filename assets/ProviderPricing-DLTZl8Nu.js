import{r as c,j as e}from"./index-DRyMwwkr.js";import{P as E}from"./ProviderPageTemplate-DE_zu0kM.js";import{a5 as j,a6 as y,b as C,a7 as H,B as W,a2 as P,X as w,a8 as B,W as L}from"./index-CbNkEdQY.js";const V=()=>{const[o,u]=c.useState([{id:1,name:"Basic Cleaning",description:"Standard cleaning for small apartments",price:15e3,currency:"₦",type:"fixed",duration:"2-3 hours",features:["Dusting and wiping surfaces","Vacuuming and mopping","Kitchen and bathroom cleaning","Trash removal"],popular:!0,active:!0,serviceCategory:"Cleaning"},{id:2,name:"Deep Cleaning",description:"Thorough cleaning for all spaces",price:3e4,currency:"₦",type:"fixed",duration:"4-6 hours",features:["Everything in Basic","Window cleaning","Appliance cleaning","Carpet shampooing","Disinfection"],popular:!1,active:!0,serviceCategory:"Cleaning"},{id:3,name:"Painting Service",description:"Professional painting per square meter",price:2500,currency:"₦",type:"per_unit",unit:"per m²",features:["Surface preparation","Primer application","Two coats of paint","Cleanup"],popular:!0,active:!0,serviceCategory:"Painting"},{id:4,name:"Plumbing Consultation",description:"Hourly rate for plumbing services",price:5e3,currency:"₦",type:"hourly",minHours:1,features:["Diagnosis of issues","Minor repairs","Parts recommendation","Maintenance advice"],popular:!1,active:!0,serviceCategory:"Plumbing"},{id:5,name:"Monthly Maintenance",description:"Monthly package for regular maintenance",price:45e3,currency:"₦",type:"monthly",duration:"Monthly",features:["4 visits per month","Regular cleaning","Minor repairs","Priority support","20% discount on parts"],popular:!1,active:!1,serviceCategory:"Maintenance"}]),[d,h]=c.useState([{id:1,name:"First Time Customer",code:"WELCOME10",type:"percentage",value:10,minAmount:0,maxUses:100,used:45,validUntil:"2024-03-31",active:!0},{id:2,name:"Bulk Booking",code:"BULK15",type:"percentage",value:15,minAmount:5e4,maxUses:50,used:12,validUntil:"2024-06-30",active:!0},{id:3,name:"Referral Discount",code:"REFER20",type:"fixed",value:5e3,minAmount:2e4,maxUses:1e3,used:89,validUntil:"2024-12-31",active:!0}]),[k,m]=c.useState(!1),[D,p]=c.useState(!1),[x,b]=c.useState(null),[g,N]=c.useState(null),[s,t]=c.useState({name:"",description:"",price:"",currency:"₦",type:"fixed",unit:"",minHours:1,duration:"",features:"",popular:!1,active:!0,serviceCategory:""}),[l,n]=c.useState({name:"",code:"",type:"percentage",value:"",minAmount:"",maxUses:"",validUntil:"",active:!0}),S=["Cleaning","Painting","Plumbing","Electrical","Maintenance","Renovation","Landscaping"],A=()=>{if(!s.name||!s.price||!s.serviceCategory){alert("Please fill in required fields");return}const a=s.features.split(`
`).filter(i=>i.trim());if(x)u(i=>i.map(r=>r.id===x.id?{...r,...s,price:parseInt(s.price),features:a,minHours:s.type==="hourly"?parseInt(s.minHours):void 0,unit:s.type==="per_unit"?s.unit:void 0}:r));else{const i={id:o.length+1,name:s.name,description:s.description,price:parseInt(s.price),currency:s.currency,type:s.type,unit:s.type==="per_unit"?s.unit:void 0,minHours:s.type==="hourly"?parseInt(s.minHours):void 0,duration:s.duration,features:a,popular:s.popular,active:s.active,serviceCategory:s.serviceCategory};u([...o,i])}m(!1),b(null),t({name:"",description:"",price:"",currency:"₦",type:"fixed",unit:"",minHours:1,duration:"",features:"",popular:!1,active:!0,serviceCategory:""})},U=()=>{if(!l.name||!l.code||!l.value){alert("Please fill in required fields");return}if(g)h(a=>a.map(i=>i.id===g.id?{...i,...l,value:parseInt(l.value),minAmount:parseInt(l.minAmount)||0,maxUses:parseInt(l.maxUses)||1e3}:i));else{const a={id:d.length+1,name:l.name,code:l.code,type:l.type,value:parseInt(l.value),minAmount:parseInt(l.minAmount)||0,maxUses:parseInt(l.maxUses)||1e3,used:0,validUntil:l.validUntil,active:l.active};h([...d,a])}p(!1),N(null),n({name:"",code:"",type:"percentage",value:"",minAmount:"",maxUses:"",validUntil:"",active:!0})},M=a=>{b(a),t({name:a.name,description:a.description,price:a.price.toString(),currency:a.currency,type:a.type,unit:a.unit||"",minHours:a.minHours||1,duration:a.duration||"",features:a.features.join(`
`),popular:a.popular,active:a.active,serviceCategory:a.serviceCategory}),m(!0)},I=a=>{N(a),n({name:a.name,code:a.code,type:a.type,value:a.value.toString(),minAmount:a.minAmount.toString(),maxUses:a.maxUses.toString(),validUntil:a.validUntil,active:a.active}),p(!0)},T=a=>{u(i=>i.map(r=>r.id===a?{...r,active:!r.active}:r))},z=a=>{h(i=>i.map(r=>r.id===a?{...r,active:!r.active}:r))},F=a=>{navigator.clipboard.writeText(a),alert(`Copied: ${a}`)},f=(a,i)=>Math.round(a/i*100),v={totalPlans:o.length,activePlans:o.filter(a=>a.active).length,popularPlans:o.filter(a=>a.popular).length,totalDiscounts:d.length,activeDiscounts:d.filter(a=>a.active).length};return e.jsxs(E,{title:"Pricing & Packages",subtitle:"Manage your service packages and discounts",actions:e.jsxs("div",{style:{display:"flex",gap:"1rem"},children:[e.jsxs("button",{className:"btn-secondary",onClick:()=>p(!0),children:[e.jsx(j,{style:{marginRight:"0.5rem"}}),"Add Discount"]}),e.jsxs("button",{className:"btn-primary",onClick:()=>m(!0),children:[e.jsx(L,{style:{marginRight:"0.5rem"}}),"Add Pricing Plan"]})]}),children:[e.jsxs("div",{className:"provider-grid",style:{marginBottom:"2rem"},children:[e.jsxs("div",{className:"provider-card",children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Total Plans"}),e.jsx(j,{style:{color:"#1a237e",fontSize:"1.5rem"}})]}),e.jsx("div",{style:{fontSize:"2.5rem",fontWeight:"700",color:"#1a237e",textAlign:"center"},children:v.totalPlans}),e.jsx("div",{style:{textAlign:"center",color:"#666",marginTop:"0.5rem"},children:"Pricing plans"})]}),e.jsxs("div",{className:"provider-card",children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Active Plans"}),e.jsx(y,{style:{color:"#4caf50",fontSize:"1.5rem"}})]}),e.jsx("div",{style:{fontSize:"2.5rem",fontWeight:"700",color:"#4caf50",textAlign:"center"},children:v.activePlans}),e.jsx("div",{style:{textAlign:"center",color:"#666",marginTop:"0.5rem"},children:"Currently active"})]}),e.jsxs("div",{className:"provider-card",children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Popular Plans"}),e.jsx(C,{style:{color:"#ff9800",fontSize:"1.5rem"}})]}),e.jsx("div",{style:{fontSize:"2.5rem",fontWeight:"700",color:"#ff9800",textAlign:"center"},children:v.popularPlans}),e.jsx("div",{style:{textAlign:"center",color:"#666",marginTop:"0.5rem"},children:"Marked as popular"})]}),e.jsxs("div",{className:"provider-card",children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Active Discounts"}),e.jsx(H,{style:{color:"#9c27b0",fontSize:"1.5rem"}})]}),e.jsx("div",{style:{fontSize:"2.5rem",fontWeight:"700",color:"#9c27b0",textAlign:"center"},children:v.activeDiscounts}),e.jsx("div",{style:{textAlign:"center",color:"#666",marginTop:"0.5rem"},children:"Discount codes"})]})]}),e.jsxs("div",{className:"provider-card",style:{marginBottom:"2rem"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Pricing Plans"}),e.jsx("p",{className:"card-subtitle",children:"Manage your service packages and pricing"})]}),e.jsx("div",{className:"pricing-plans-grid",children:o.map(a=>e.jsxs("div",{className:`pricing-plan ${a.popular?"popular":""}`,children:[a.popular&&e.jsxs("div",{className:"popular-badge",children:[e.jsx(C,{})," Most Popular"]}),e.jsxs("div",{className:"plan-header",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"plan-name",children:a.name}),e.jsx("p",{className:"plan-description",children:a.description})]}),e.jsxs("div",{style:{textAlign:"right"},children:[e.jsxs("div",{className:"plan-price",children:[a.currency,a.price.toLocaleString(),a.type==="hourly"&&e.jsx("span",{className:"plan-unit",children:"/hour"}),a.type==="per_unit"&&e.jsxs("span",{className:"plan-unit",children:["/",a.unit]}),a.type==="monthly"&&e.jsx("span",{className:"plan-unit",children:"/month"})]}),e.jsx("div",{className:"plan-type",children:a.type.replace("_"," ")})]})]}),e.jsxs("div",{className:"plan-details",children:[e.jsxs("div",{className:"detail-item",children:[e.jsx(j,{}),e.jsx("span",{children:a.serviceCategory})]}),a.duration&&e.jsxs("div",{className:"detail-item",children:[e.jsx(W,{}),e.jsx("span",{children:a.duration})]}),e.jsxs("div",{className:"detail-item",children:[e.jsx(y,{style:{color:a.active?"#4caf50":"#f44336"}}),e.jsx("span",{children:a.active?"Active":"Inactive"})]})]}),e.jsxs("div",{className:"plan-features",children:[e.jsx("h5",{children:"Features:"}),e.jsx("ul",{children:a.features.map((i,r)=>e.jsxs("li",{children:[e.jsx(y,{style:{color:"#4caf50",fontSize:"0.9rem"}}),e.jsx("span",{children:i})]},r))})]}),e.jsxs("div",{className:"plan-actions",children:[e.jsx("button",{className:`status-toggle ${a.active?"active":"inactive"}`,onClick:()=>T(a.id),children:a.active?"Active":"Inactive"}),e.jsxs("div",{style:{display:"flex",gap:"0.5rem"},children:[e.jsx("button",{className:"btn-secondary",onClick:()=>M(a),children:e.jsx(P,{})}),e.jsx("button",{className:"btn-secondary",onClick:()=>{window.confirm("Delete this pricing plan?")&&u(o.filter(i=>i.id!==a.id))},style:{background:"#f44336",color:"white"},children:e.jsx(w,{})})]})]})]},a.id))})]}),e.jsxs("div",{className:"provider-card",children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Discount Codes"}),e.jsx("p",{className:"card-subtitle",children:"Create and manage promotional discounts"})]}),e.jsxs("div",{className:"discounts-table",children:[e.jsx("div",{className:"table-header",children:e.jsxs("div",{className:"table-row",children:[e.jsx("div",{className:"table-cell",style:{width:"20%"},children:"Discount Name"}),e.jsx("div",{className:"table-cell",style:{width:"15%"},children:"Code"}),e.jsx("div",{className:"table-cell",style:{width:"15%"},children:"Type & Value"}),e.jsx("div",{className:"table-cell",style:{width:"15%"},children:"Usage"}),e.jsx("div",{className:"table-cell",style:{width:"15%"},children:"Valid Until"}),e.jsx("div",{className:"table-cell",style:{width:"10%"},children:"Status"}),e.jsx("div",{className:"table-cell",style:{width:"10%"},children:"Actions"})]})}),e.jsx("div",{className:"table-body",children:d.map(a=>e.jsxs("div",{className:"table-row",children:[e.jsxs("div",{className:"table-cell",children:[e.jsx("strong",{children:a.name}),e.jsxs("div",{style:{fontSize:"0.8rem",color:"#666"},children:["Min: ₦",a.minAmount.toLocaleString()]})]}),e.jsx("div",{className:"table-cell",children:e.jsxs("div",{className:"discount-code",children:[e.jsx("code",{children:a.code}),e.jsx("button",{className:"copy-btn",onClick:()=>F(a.code),title:"Copy code",children:e.jsx(B,{})})]})}),e.jsxs("div",{className:"table-cell",children:[e.jsx("div",{style:{fontWeight:"600"},children:a.type==="percentage"?`${a.value}%`:`₦${a.value.toLocaleString()}`}),e.jsx("div",{style:{fontSize:"0.8rem",color:"#666"},children:a.type==="percentage"?"Percentage":"Fixed Amount"})]}),e.jsxs("div",{className:"table-cell",children:[e.jsxs("div",{style:{marginBottom:"0.3rem"},children:[a.used," / ",a.maxUses]}),e.jsx("div",{className:"usage-bar",children:e.jsx("div",{className:"usage-fill",style:{width:`${f(a.used,a.maxUses)}%`,background:f(a.used,a.maxUses)>80?"#f44336":f(a.used,a.maxUses)>50?"#ff9800":"#4caf50"}})})]}),e.jsx("div",{className:"table-cell",children:new Date(a.validUntil)>new Date?e.jsx("span",{style:{color:"#4caf50",fontWeight:"600"},children:new Date(a.validUntil).toLocaleDateString()}):e.jsx("span",{style:{color:"#f44336",fontWeight:"600"},children:"Expired"})}),e.jsx("div",{className:"table-cell",children:e.jsx("button",{className:`status-toggle ${a.active?"active":"inactive"}`,onClick:()=>z(a.id),children:a.active?"Active":"Inactive"})}),e.jsx("div",{className:"table-cell",children:e.jsxs("div",{style:{display:"flex",gap:"0.5rem"},children:[e.jsx("button",{className:"btn-secondary",onClick:()=>I(a),children:e.jsx(P,{})}),e.jsx("button",{className:"btn-secondary",onClick:()=>{window.confirm("Delete this discount?")&&h(d.filter(i=>i.id!==a.id))},style:{background:"#f44336",color:"white"},children:e.jsx(w,{})})]})})]},a.id))})]})]}),k&&e.jsx("div",{className:"modal-overlay",children:e.jsxs("div",{className:"modal-content",style:{maxWidth:"700px"},children:[e.jsxs("div",{className:"modal-header",children:[e.jsx("h3",{children:x?"Edit Pricing Plan":"Add New Pricing Plan"}),e.jsx("button",{className:"modal-close",onClick:()=>m(!1),children:"×"})]}),e.jsx("div",{className:"modal-body",children:e.jsxs("div",{className:"provider-grid",children:[e.jsxs("div",{className:"form-group",style:{gridColumn:"span 2"},children:[e.jsx("label",{className:"form-label",children:"Plan Name *"}),e.jsx("input",{type:"text",className:"form-control",value:s.name,onChange:a=>t({...s,name:a.target.value}),placeholder:"e.g., Basic Cleaning Package"})]}),e.jsxs("div",{className:"form-group",style:{gridColumn:"span 2"},children:[e.jsx("label",{className:"form-label",children:"Description"}),e.jsx("input",{type:"text",className:"form-control",value:s.description,onChange:a=>t({...s,description:a.target.value}),placeholder:"Brief description of the plan"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Service Category *"}),e.jsxs("select",{className:"form-control",value:s.serviceCategory,onChange:a=>t({...s,serviceCategory:a.target.value}),children:[e.jsx("option",{value:"",children:"Select Category"}),S.map(a=>e.jsx("option",{value:a,children:a},a))]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Pricing Type"}),e.jsxs("select",{className:"form-control",value:s.type,onChange:a=>t({...s,type:a.target.value}),children:[e.jsx("option",{value:"fixed",children:"Fixed Price"}),e.jsx("option",{value:"hourly",children:"Hourly Rate"}),e.jsx("option",{value:"per_unit",children:"Per Unit"}),e.jsx("option",{value:"monthly",children:"Monthly"})]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Price *"}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.5rem"},children:[e.jsx("span",{style:{fontWeight:"600"},children:s.currency}),e.jsx("input",{type:"number",className:"form-control",value:s.price,onChange:a=>t({...s,price:a.target.value}),placeholder:"0"})]})]}),s.type==="per_unit"&&e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Unit"}),e.jsx("input",{type:"text",className:"form-control",value:s.unit,onChange:a=>t({...s,unit:a.target.value}),placeholder:"e.g., m², room, item"})]}),s.type==="hourly"&&e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Minimum Hours"}),e.jsx("input",{type:"number",className:"form-control",value:s.minHours,onChange:a=>t({...s,minHours:a.target.value}),min:"1"})]}),(s.type==="fixed"||s.type==="monthly")&&e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Duration"}),e.jsx("input",{type:"text",className:"form-control",value:s.duration,onChange:a=>t({...s,duration:a.target.value}),placeholder:"e.g., 2-3 hours, Monthly"})]}),e.jsxs("div",{className:"form-group",style:{gridColumn:"span 2"},children:[e.jsx("label",{className:"form-label",children:"Features (one per line)"}),e.jsx("textarea",{className:"form-control",rows:"4",value:s.features,onChange:a=>t({...s,features:a.target.value}),placeholder:"List features of this plan..."})]}),e.jsx("div",{className:"form-group",children:e.jsxs("label",{style:{display:"flex",alignItems:"center",gap:"0.5rem"},children:[e.jsx("input",{type:"checkbox",checked:s.popular,onChange:a=>t({...s,popular:a.target.checked})}),e.jsx("span",{children:"Mark as Popular Plan"})]})}),e.jsx("div",{className:"form-group",children:e.jsxs("label",{style:{display:"flex",alignItems:"center",gap:"0.5rem"},children:[e.jsx("input",{type:"checkbox",checked:s.active,onChange:a=>t({...s,active:a.target.checked})}),e.jsx("span",{children:"Active"})]})})]})}),e.jsxs("div",{className:"modal-footer",children:[e.jsx("button",{className:"btn-secondary",onClick:()=>m(!1),children:"Cancel"}),e.jsx("button",{className:"btn-primary",onClick:A,children:x?"Update Plan":"Add Plan"})]})]})}),D&&e.jsx("div",{className:"modal-overlay",children:e.jsxs("div",{className:"modal-content",style:{maxWidth:"600px"},children:[e.jsxs("div",{className:"modal-header",children:[e.jsx("h3",{children:g?"Edit Discount":"Add New Discount"}),e.jsx("button",{className:"modal-close",onClick:()=>p(!1),children:"×"})]}),e.jsx("div",{className:"modal-body",children:e.jsxs("div",{className:"provider-grid",children:[e.jsxs("div",{className:"form-group",style:{gridColumn:"span 2"},children:[e.jsx("label",{className:"form-label",children:"Discount Name *"}),e.jsx("input",{type:"text",className:"form-control",value:l.name,onChange:a=>n({...l,name:a.target.value}),placeholder:"e.g., First Time Customer Discount"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Discount Code *"}),e.jsx("input",{type:"text",className:"form-control",value:l.code,onChange:a=>n({...l,code:a.target.value.toUpperCase()}),placeholder:"e.g., WELCOME10",style:{textTransform:"uppercase"}})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Discount Type"}),e.jsxs("select",{className:"form-control",value:l.type,onChange:a=>n({...l,type:a.target.value}),children:[e.jsx("option",{value:"percentage",children:"Percentage"}),e.jsx("option",{value:"fixed",children:"Fixed Amount"})]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Discount Value *"}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.5rem"},children:[l.type==="fixed"&&e.jsx("span",{children:"₦"}),e.jsx("input",{type:"number",className:"form-control",value:l.value,onChange:a=>n({...l,value:a.target.value}),placeholder:l.type==="percentage"?"10":"5000"}),l.type==="percentage"&&e.jsx("span",{children:"%"})]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Minimum Amount"}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.5rem"},children:[e.jsx("span",{children:"₦"}),e.jsx("input",{type:"number",className:"form-control",value:l.minAmount,onChange:a=>n({...l,minAmount:a.target.value}),placeholder:"0"})]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Maximum Uses"}),e.jsx("input",{type:"number",className:"form-control",value:l.maxUses,onChange:a=>n({...l,maxUses:a.target.value}),placeholder:"100"})]}),e.jsxs("div",{className:"form-group",style:{gridColumn:"span 2"},children:[e.jsx("label",{className:"form-label",children:"Valid Until"}),e.jsx("input",{type:"date",className:"form-control",value:l.validUntil,onChange:a=>n({...l,validUntil:a.target.value})})]}),e.jsx("div",{className:"form-group",children:e.jsxs("label",{style:{display:"flex",alignItems:"center",gap:"0.5rem"},children:[e.jsx("input",{type:"checkbox",checked:l.active,onChange:a=>n({...l,active:a.target.checked})}),e.jsx("span",{children:"Active"})]})})]})}),e.jsxs("div",{className:"modal-footer",children:[e.jsx("button",{className:"btn-secondary",onClick:()=>p(!1),children:"Cancel"}),e.jsx("button",{className:"btn-primary",onClick:U,children:g?"Update Discount":"Add Discount"})]})]})}),e.jsx("style",{jsx:!0,children:`
        .pricing-plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        
        .pricing-plan {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          padding: 1.5rem;
          position: relative;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        
        .pricing-plan:hover {
          border-color: #1a237e;
          box-shadow: 0 8px 15px rgba(26, 35, 126, 0.1);
        }
        
        .pricing-plan.popular {
          border-color: #ff9800;
          background: linear-gradient(135deg, #fff8e1 0%, #fff3e0 100%);
        }
        
        .popular-badge {
          position: absolute;
          top: -12px;
          right: 1.5rem;
          background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }
        
        .plan-name {
          margin: 0 0 0.5rem 0;
          font-size: 1.3rem;
          font-weight: 700;
          color: #1a237e;
        }
        
        .plan-description {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }
        
        .plan-price {
          font-size: 1.8rem;
          font-weight: 700;
          color: #1a237e;
          line-height: 1;
        }
        
        .plan-unit {
          font-size: 1rem;
          color: #666;
          font-weight: 500;
        }
        
        .plan-type {
          font-size: 0.8rem;
          color: #666;
          text-transform: capitalize;
          margin-top: 0.3rem;
        }
        
        .plan-details {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          flex-wrap: wrap;
        }
        
        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #666;
        }
        
        .plan-features {
          flex: 1;
          margin-bottom: 1.5rem;
        }
        
        .plan-features h5 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }
        
        .plan-features ul {
          margin: 0;
          padding-left: 1.2rem;
        }
        
        .plan-features li {
          margin-bottom: 0.5rem;
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          color: #666;
          font-size: 0.9rem;
        }
        
        .plan-features li span {
          flex: 1;
        }
        
        .plan-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }
        
        .status-toggle {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .status-toggle.active {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .status-toggle.inactive {
          background: #f5f5f5;
          color: #757575;
        }
        
        .status-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        /* Discounts Table */
        .discounts-table {
          width: 100%;
        }
        
        .table-header {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #e0e0e0;
        }
        
        .table-body .table-row {
          border-bottom: 1px solid #e0e0e0;
          transition: all 0.3s ease;
        }
        
        .table-body .table-row:hover {
          background: #f8f9fa;
        }
        
        .table-row {
          display: flex;
          padding: 1rem;
        }
        
        .table-cell {
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .discount-code {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .discount-code code {
          background: #f0f0f0;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          font-family: monospace;
          font-weight: 600;
          color: #1a237e;
        }
        
        .copy-btn {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .copy-btn:hover {
          color: #1a237e;
        }
        
        .usage-bar {
          height: 6px;
          background: #e0e0e0;
          border-radius: 3px;
          overflow: hidden;
        }
        
        .usage-fill {
          height: 100%;
          transition: width 0.3s ease;
        }
        
        @media (max-width: 768px) {
          .pricing-plans-grid {
            grid-template-columns: 1fr;
          }
          
          .table-row {
            flex-direction: column;
            gap: 1rem;
          }
          
          .table-cell {
            width: 100% !important;
          }
          
          .plan-header {
            flex-direction: column;
            gap: 1rem;
          }
          
          .plan-actions {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `})]})};export{V as default};
