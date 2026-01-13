import{r as l,j as e}from"./index-DRyMwwkr.js";import{P as I}from"./ProviderPageTemplate-DE_zu0kM.js";import{g as q,h as o,i as j,j as P,k as S,f as H,l as F,m as T,n as U,a as Y,o as W,p,q as V,r as G,d as O}from"./index-CbNkEdQY.js";const J=()=>{const[a,m]=l.useState({plan:"free",status:"active",billingCycle:"monthly",price:0,nextBillingDate:"2024-02-10",autoRenew:!0,freeBookingsUsed:7,freeBookingsLimit:10,subscriptionStartDate:"2024-01-01",subscriptionEndDate:null,features:{marketplaceVisibility:!0,unlimitedBookings:!1,prioritySupport:!1,verifiedBadge:!1,advancedAnalytics:!1,boostCredits:0,customDomain:!1,apiAccess:!1}}),[g,X]=l.useState([{id:"free",name:"Free",price:0,billingCycle:"monthly",description:"Perfect for getting started",features:["Up to 10 bookings/month","Basic marketplace visibility","Standard support","Basic analytics","Email notifications"],limitations:["No verified badge","Limited booking capacity","Standard marketplace ranking","No boost credits","No custom domain"],popular:!1,recommendedFor:"New providers starting out"},{id:"professional",name:"Professional",price:3e3,billingCycle:"monthly",description:"Best for growing your business",features:["Unlimited bookings","Priority marketplace visibility","Verified provider badge","Priority support","Advanced analytics","5 boost credits/month","Custom service pages","Basic API access"],limitations:["No custom domain","Limited API calls","Standard commission rates"],popular:!0,recommendedFor:"Active providers with regular bookings"},{id:"business",name:"Business",price:8e3,billingCycle:"monthly",description:"For established service businesses",features:["Everything in Professional","Premium marketplace placement","Custom domain","Dedicated account manager","Full API access","20 boost credits/month","Reduced commission rates","White-label reports","Team accounts (up to 3)"],limitations:["Higher monthly cost","Annual commitment for best rates"],popular:!1,recommendedFor:"Established businesses with teams"},{id:"enterprise",name:"Enterprise",price:2e4,billingCycle:"monthly",description:"Custom solutions for large providers",features:["Everything in Business","Fully customizable","Unlimited team accounts","Custom commission rates","Dedicated support line","50 boost credits/month","Advanced security features","Custom integrations","SLA guarantees"],limitations:["Custom pricing","Minimum 12-month contract"],popular:!1,recommendedFor:"Large service companies & franchises"}]),[u,A]=l.useState([{id:1,date:"2024-01-10",description:"Professional Plan - Monthly",amount:3e3,status:"paid",invoiceUrl:"#",paymentMethod:"Card ****1234"},{id:2,date:"2023-12-10",description:"Professional Plan - Monthly",amount:3e3,status:"paid",invoiceUrl:"#",paymentMethod:"Card ****1234"},{id:3,date:"2023-11-10",description:"Free to Professional Upgrade",amount:3e3,status:"paid",invoiceUrl:"#",paymentMethod:"Card ****1234"},{id:4,date:"2023-10-01",description:"Free Plan",amount:0,status:"free",invoiceUrl:null,paymentMethod:"N/A"}]),[y,z]=l.useState([{id:1,type:"card",lastFour:"1234",brand:"Visa",expiry:"12/25",isDefault:!0},{id:2,type:"bank",bankName:"GTBank",accountNumber:"******7890",isDefault:!1}]),[D,d]=l.useState(!1),[r,v]=l.useState(null),[h,M]=l.useState(!1),[N,R]=l.useState(!1),[f,w]=l.useState(!1),n=g.find(s=>s.id===a.plan);l.useEffect(()=>{const i=setInterval(()=>{if(a.plan==="free"){const t=Math.min(a.freeBookingsUsed+1,a.freeBookingsLimit);t!==a.freeBookingsUsed&&m(c=>({...c,freeBookingsUsed:t}))}},6e4);return()=>clearInterval(i)},[a.plan,a.freeBookingsUsed,a.freeBookingsLimit]);const x=s=>{const i=g.find(t=>t.id===s);i&&(v(i),d(!0))},L=()=>{r&&(w(!0),setTimeout(()=>{m({...a,plan:r.id,price:r.price,features:{marketplaceVisibility:!0,unlimitedBookings:r.id!=="free",prioritySupport:r.id==="professional"||r.id==="business"||r.id==="enterprise",verifiedBadge:r.id==="professional"||r.id==="business"||r.id==="enterprise",advancedAnalytics:r.id==="professional"||r.id==="business"||r.id==="enterprise",boostCredits:r.id==="professional"?5:r.id==="business"?20:r.id==="enterprise"?50:0,customDomain:r.id==="business"||r.id==="enterprise",apiAccess:r.id==="professional"||r.id==="business"||r.id==="enterprise"},nextBillingDate:"2024-02-10"});const s={id:u.length+1,date:new Date().toISOString().split("T")[0],description:`${r.name} Plan - Upgrade`,amount:r.price,status:"paid",invoiceUrl:"#",paymentMethod:"Card ****1234"};A([s,...u]),w(!1),d(!1),v(null),alert(`Successfully upgraded to ${r.name} plan!`)},1500))},E=()=>{window.confirm("Are you sure you want to cancel your subscription? You will lose premium features immediately.")&&(m({...a,plan:"free",status:"cancelled",price:0,features:{marketplaceVisibility:!0,unlimitedBookings:!1,prioritySupport:!1,verifiedBadge:!1,advancedAnalytics:!1,boostCredits:0,customDomain:!1,apiAccess:!1}}),alert("Subscription cancelled. You have been downgraded to the Free plan."))},$=()=>{m({...a,autoRenew:!a.autoRenew})},k=s=>s.id==="professional"?"Save 10% with annual billing":s.id==="business"?"Save 15% with annual billing":s.id==="enterprise"?"Save 20% with annual billing":"",C=s=>{switch(s){case"free":return{color:"#757575",icon:e.jsx(o,{}),tagline:"Get started for free"};case"professional":return{color:"#2196f3",icon:e.jsx(F,{}),tagline:"Most popular choice"};case"business":return{color:"#9c27b0",icon:e.jsx(O,{}),tagline:"For growing businesses"};case"enterprise":return{color:"#4caf50",icon:e.jsx(G,{}),tagline:"Enterprise-grade features"};default:return{color:"#757575",icon:e.jsx(o,{}),tagline:""}}},B=a.freeBookingsUsed/a.freeBookingsLimit*100;return e.jsxs(I,{title:"Subscription & Billing",subtitle:"Manage your subscription plan and billing preferences",actions:e.jsxs("div",{style:{display:"flex",gap:"1rem",flexWrap:"wrap"},children:[e.jsxs("button",{className:"btn-secondary",onClick:()=>M(!h),children:[e.jsx(V,{style:{marginRight:"0.5rem"}}),h?"Hide History":"Billing History"]}),e.jsxs("button",{className:"btn-secondary",onClick:()=>R(!N),children:[e.jsx(p,{style:{marginRight:"0.5rem"}}),"Payment Methods"]})]}),children:[e.jsxs("div",{className:"provider-card",style:{marginBottom:"2rem"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Current Plan"}),e.jsxs("div",{className:`plan-badge ${a.plan}`,children:[C(a.plan).icon,e.jsxs("span",{children:[n.name," Plan"]})]})]}),e.jsxs("div",{className:"current-plan-overview",children:[e.jsxs("div",{className:"plan-summary",children:[e.jsxs("div",{className:"plan-price",children:[e.jsxs("div",{className:"price-amount",children:["₦",n.price.toLocaleString(),e.jsxs("span",{className:"price-period",children:["/",n.billingCycle]})]}),e.jsx("div",{className:"price-description",children:n.description})]}),e.jsxs("div",{className:"plan-status",children:[e.jsxs("div",{className:"status-item",children:[e.jsx("strong",{children:"Status:"}),e.jsx("span",{className:`status-badge ${a.status}`,children:a.status.charAt(0).toUpperCase()+a.status.slice(1)})]}),e.jsxs("div",{className:"status-item",children:[e.jsx("strong",{children:"Next Billing:"}),e.jsx("span",{children:a.nextBillingDate})]}),e.jsxs("div",{className:"status-item",children:[e.jsx("strong",{children:"Auto Renew:"}),e.jsxs("label",{className:"toggle-switch",children:[e.jsx("input",{type:"checkbox",checked:a.autoRenew,onChange:$}),e.jsx("span",{className:"toggle-slider"})]})]})]})]}),a.plan==="free"&&e.jsxs("div",{className:"free-plan-usage",children:[e.jsxs("div",{className:"usage-header",children:[e.jsx("h4",{style:{margin:0},children:"Free Bookings Usage"}),e.jsxs("span",{children:[a.freeBookingsUsed,"/",a.freeBookingsLimit," bookings used"]})]}),e.jsxs("div",{className:"usage-progress",children:[e.jsx("div",{className:"progress-bar",style:{background:`linear-gradient(to right, 
                      #4caf50 ${B}%, 
                      #e0e0e0 ${B}%)`}}),e.jsxs("div",{className:"progress-labels",children:[e.jsx("span",{children:"0"}),e.jsxs("span",{children:[a.freeBookingsLimit," bookings"]})]})]}),e.jsxs("div",{className:"usage-warning",children:[e.jsx(q,{style:{color:"#ff9800"}}),e.jsxs("div",{children:[e.jsxs("strong",{children:[a.freeBookingsLimit-a.freeBookingsUsed," free bookings remaining"]}),e.jsx("p",{style:{margin:"0.3rem 0 0",color:"#666"},children:"Upgrade to continue accepting bookings without limits"})]})]})]}),e.jsxs("div",{className:"current-features",children:[e.jsx("h4",{style:{marginBottom:"1rem"},children:"Current Plan Features"}),e.jsx("div",{className:"features-grid",children:Object.entries(a.features).map(([s,i])=>e.jsxs("div",{className:"feature-item",children:[e.jsx("div",{className:"feature-icon",children:i?e.jsx(o,{style:{color:"#4caf50"}}):e.jsx(j,{style:{color:"#f44336"}})}),e.jsxs("div",{className:"feature-info",children:[e.jsx("div",{className:"feature-name",children:s.replace(/([A-Z])/g," $1").replace(/^./,t=>t.toUpperCase())}),e.jsx("div",{className:"feature-status",children:i?"Included":"Not included"})]})]},s))})]}),e.jsxs("div",{className:"plan-actions",children:[a.plan==="free"?e.jsxs("button",{className:"btn-primary",onClick:()=>x("professional"),children:[e.jsx(P,{style:{marginRight:"0.5rem"}}),"Upgrade to Professional"]}):e.jsxs("div",{style:{display:"flex",gap:"1rem",flexWrap:"wrap"},children:[e.jsxs("button",{className:"btn-primary",onClick:()=>d(!0),children:[e.jsx(S,{style:{marginRight:"0.5rem"}}),"Change Plan"]}),e.jsx("button",{className:"btn-secondary",onClick:E,style:{background:a.status==="cancelled"?"#4caf50":"#f44336",color:"white"},children:a.status==="cancelled"?e.jsxs(e.Fragment,{children:[e.jsx(o,{style:{marginRight:"0.5rem"}}),"Cancelled"]}):e.jsxs(e.Fragment,{children:[e.jsx(j,{style:{marginRight:"0.5rem"}}),"Cancel Subscription"]})})]}),a.plan!=="free"&&e.jsxs("div",{className:"renewal-notice",children:[e.jsx(H,{style:{color:"#ff9800"}}),e.jsxs("div",{children:[e.jsxs("strong",{children:["Auto-renewal ",a.autoRenew?"enabled":"disabled"]}),e.jsxs("p",{style:{margin:"0.3rem 0 0",color:"#666"},children:["Next billing: ",a.nextBillingDate," • ₦",n.price.toLocaleString()]})]})]})]})]})]}),e.jsxs("div",{className:"provider-card",style:{marginBottom:"2rem"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Available Plans"}),e.jsx("p",{className:"card-subtitle",children:"Choose the perfect plan for your business needs"})]}),e.jsx("div",{className:"plans-grid",children:g.map(s=>{const i=C(s.id),t=s.id===a.plan;return e.jsxs("div",{className:`plan-card ${s.popular?"popular":""} ${t?"current":""}`,style:{borderColor:i.color},children:[s.popular&&e.jsxs("div",{className:"popular-badge",style:{background:i.color},children:[e.jsx(F,{})," Most Popular"]}),t&&e.jsxs("div",{className:"current-badge",style:{background:i.color},children:[e.jsx(o,{})," Current Plan"]}),e.jsxs("div",{className:"plan-header",children:[e.jsx("div",{className:"plan-icon",style:{color:i.color},children:i.icon}),e.jsxs("div",{children:[e.jsx("h3",{className:"plan-name",children:s.name}),e.jsx("p",{className:"plan-tagline",style:{color:i.color},children:i.tagline})]})]}),e.jsxs("div",{className:"plan-price-section",children:[e.jsxs("div",{className:"price",children:[e.jsx("span",{className:"currency",children:"₦"}),e.jsx("span",{className:"amount",children:s.price.toLocaleString()}),e.jsxs("span",{className:"period",children:["/",s.billingCycle]})]}),k(s)&&e.jsxs("div",{className:"savings-badge",children:[e.jsx(T,{})," ",k(s)]})]}),e.jsxs("div",{className:"plan-description",children:[e.jsx("p",{children:s.description}),e.jsxs("p",{className:"recommended-for",children:[e.jsx("strong",{children:"Recommended for:"})," ",s.recommendedFor]})]}),e.jsxs("div",{className:"plan-features",children:[e.jsx("h4",{style:{marginBottom:"1rem"},children:"Features"}),e.jsx("ul",{children:s.features.map((c,b)=>e.jsxs("li",{children:[e.jsx(o,{style:{color:"#4caf50"}}),e.jsx("span",{children:c})]},b))}),s.limitations&&s.limitations.length>0&&e.jsxs(e.Fragment,{children:[e.jsx("h4",{style:{margin:"1.5rem 0 1rem 0",color:"#666"},children:"Limitations"}),e.jsx("ul",{className:"limitations",children:s.limitations.map((c,b)=>e.jsxs("li",{children:[e.jsx(j,{style:{color:"#f44336"}}),e.jsx("span",{children:c})]},b))})]})]}),e.jsx("div",{className:"plan-actions",children:t?e.jsxs("button",{className:"btn-secondary",disabled:!0,style:{width:"100%"},children:[e.jsx(o,{style:{marginRight:"0.5rem"}}),"Current Plan"]}):s.id==="free"?e.jsx("button",{className:"btn-secondary",onClick:()=>x("free"),style:{width:"100%"},disabled:a.plan==="free",children:a.plan==="free"?"Current Plan":"Downgrade to Free"}):e.jsx("button",{className:"btn-primary",onClick:()=>x(s.id),style:{width:"100%",background:i.color,borderColor:i.color},children:a.plan==="free"?"Upgrade Now":a.price>s.price?"Downgrade":"Upgrade"})})]},s.id)})})]}),h&&e.jsxs("div",{className:"provider-card",style:{marginBottom:"2rem"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Billing History"}),e.jsxs("button",{className:"btn-secondary",onClick:()=>alert("Export all invoices"),children:[e.jsx(U,{style:{marginRight:"0.5rem"}}),"Export All"]})]}),e.jsxs("div",{className:"billing-table",children:[e.jsx("div",{className:"table-header",children:e.jsxs("div",{className:"table-row",children:[e.jsx("div",{className:"table-cell",children:"Date"}),e.jsx("div",{className:"table-cell",children:"Description"}),e.jsx("div",{className:"table-cell",children:"Amount"}),e.jsx("div",{className:"table-cell",children:"Status"}),e.jsx("div",{className:"table-cell",children:"Payment Method"}),e.jsx("div",{className:"table-cell",children:"Actions"})]})}),e.jsx("div",{className:"table-body",children:u.map(s=>e.jsxs("div",{className:"table-row",children:[e.jsx("div",{className:"table-cell",children:e.jsxs("div",{className:"invoice-date",children:[e.jsx(Y,{}),e.jsx("span",{children:s.date})]})}),e.jsx("div",{className:"table-cell",children:e.jsx("strong",{children:s.description})}),e.jsx("div",{className:"table-cell",children:e.jsx("div",{className:`invoice-amount ${s.amount===0?"free":""}`,children:s.amount===0?"Free":`₦${s.amount.toLocaleString()}`})}),e.jsx("div",{className:"table-cell",children:e.jsx("span",{className:`status-badge ${s.status}`,children:s.status.charAt(0).toUpperCase()+s.status.slice(1)})}),e.jsx("div",{className:"table-cell",children:e.jsx("div",{className:"payment-method",children:s.paymentMethod})}),e.jsx("div",{className:"table-cell",children:e.jsxs("div",{className:"invoice-actions",children:[s.invoiceUrl&&e.jsxs("button",{className:"btn-secondary",onClick:()=>window.open(s.invoiceUrl,"_blank"),children:[e.jsx(W,{style:{marginRight:"0.3rem"}}),"Invoice"]}),e.jsx("button",{className:"btn-secondary",onClick:()=>alert(`Download invoice ${s.id}`),children:e.jsx(U,{})})]})})]},s.id))})]})]}),N&&e.jsxs("div",{className:"provider-card",style:{marginBottom:"2rem"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Payment Methods"}),e.jsxs("button",{className:"btn-primary",children:[e.jsx(p,{style:{marginRight:"0.5rem"}}),"Add Payment Method"]})]}),e.jsx("div",{className:"payment-methods-list",children:y.map(s=>e.jsxs("div",{className:"payment-method-card",children:[e.jsxs("div",{className:"method-info",children:[e.jsx("div",{className:"method-icon",children:s.type==="card"?e.jsx(p,{style:{color:"#2196f3",fontSize:"2rem"}}):e.jsx(p,{style:{color:"#4caf50",fontSize:"2rem"}})}),e.jsxs("div",{className:"method-details",children:[e.jsx("h4",{style:{margin:"0 0 0.5rem 0"},children:s.type==="card"?`${s.brand} Card`:`${s.bankName} Account`}),e.jsxs("div",{className:"method-meta",children:[e.jsx("span",{className:"method-number",children:s.type==="card"?`**** ${s.lastFour}`:s.accountNumber}),s.type==="card"&&e.jsxs("span",{className:"method-expiry",children:["Expires ",s.expiry]})]})]})]}),e.jsxs("div",{className:"method-actions",children:[s.isDefault?e.jsxs("span",{className:"default-badge",children:[e.jsx(o,{})," Default"]}):e.jsx("button",{className:"btn-secondary",style:{fontSize:"0.9rem"},children:"Set as Default"}),e.jsxs("div",{style:{display:"flex",gap:"0.5rem"},children:[e.jsx("button",{className:"btn-secondary",children:"Edit"}),e.jsx("button",{className:"btn-secondary",style:{background:"#f44336",color:"white"},onClick:()=>{window.confirm("Remove this payment method?")&&z(y.filter(i=>i.id!==s.id))},children:"Remove"})]})]})]},s.id))})]}),e.jsxs("div",{className:"provider-card",children:[e.jsx("div",{className:"card-header",children:e.jsx("h3",{className:"card-title",children:"Frequently Asked Questions"})}),e.jsxs("div",{className:"faq-grid",children:[e.jsxs("div",{className:"faq-item",children:[e.jsx("h4",{children:"How do I upgrade my plan?"}),e.jsx("p",{children:`Click the "Upgrade" button on any plan card. You'll be prompted to confirm and enter payment details if needed.`})]}),e.jsxs("div",{className:"faq-item",children:[e.jsx("h4",{children:"What happens when I cancel?"}),e.jsx("p",{children:"You immediately lose premium features and revert to the Free plan. You can continue using free features."})]}),e.jsxs("div",{className:"faq-item",children:[e.jsx("h4",{children:"Can I change plans anytime?"}),e.jsx("p",{children:"Yes! You can upgrade or downgrade at any time. Changes take effect immediately."})]}),e.jsxs("div",{className:"faq-item",children:[e.jsx("h4",{children:"How are boost credits used?"}),e.jsx("p",{children:"Boost credits push your profile higher in search results. Each boost lasts 7 days and consumes 1 credit."})]}),e.jsxs("div",{className:"faq-item",children:[e.jsx("h4",{children:"What payment methods are accepted?"}),e.jsx("p",{children:"We accept debit/credit cards and bank transfers. All payments are secure and encrypted."})]}),e.jsxs("div",{className:"faq-item",children:[e.jsx("h4",{children:"Do you offer annual discounts?"}),e.jsx("p",{children:"Yes! Pay annually to save 10-20% depending on your plan. The discount is applied at checkout."})]})]})]}),D&&r&&e.jsx("div",{className:"modal-overlay",children:e.jsxs("div",{className:"modal-content",style:{maxWidth:"600px"},children:[e.jsxs("div",{className:"modal-header",children:[e.jsxs("h3",{children:["Upgrade to ",r.name," Plan"]}),e.jsx("button",{className:"modal-close",onClick:()=>d(!1),children:"×"})]}),e.jsxs("div",{className:"modal-body",children:[e.jsxs("div",{className:"upgrade-summary",children:[e.jsxs("div",{className:"current-plan",children:[e.jsx("strong",{children:"Current:"})," ",n.name," Plan (₦",n.price.toLocaleString(),"/month)"]}),e.jsxs("div",{className:"new-plan",children:[e.jsx("strong",{children:"New:"})," ",r.name," Plan (₦",r.price.toLocaleString(),"/month)"]}),e.jsxs("div",{className:"price-difference",children:[e.jsx("strong",{children:"Price Change:"}),e.jsxs("span",{className:`difference ${r.price>n.price?"increase":"decrease"}`,children:[r.price>n.price?"+":"","₦",(r.price-n.price).toLocaleString(),"/month"]})]})]}),e.jsxs("div",{className:"feature-comparison",children:[e.jsx("h4",{style:{marginBottom:"1rem"},children:"What You Get:"}),e.jsx("div",{className:"features-list",children:r.features.map((s,i)=>{const t=n.features.includes(s)||a.features[s.toLowerCase().replace(/ /g,"_")];return e.jsxs("div",{className:"feature-comparison-item",children:[e.jsx("div",{className:"feature-name",children:s}),e.jsx("div",{className:"feature-status",children:t?e.jsx("span",{className:"already-have",children:"Already have"}):e.jsxs("span",{className:"new-feature",children:[e.jsx(P,{style:{marginRight:"0.3rem"}}),"New"]})})]},i)})})]}),e.jsxs("div",{className:"payment-section",children:[e.jsx("h4",{style:{marginBottom:"1rem"},children:"Payment Details"}),e.jsxs("div",{className:"payment-summary",children:[e.jsxs("div",{className:"summary-item",children:[e.jsx("span",{children:"Plan Price"}),e.jsxs("span",{children:["₦",r.price.toLocaleString()]})]}),e.jsxs("div",{className:"summary-item",children:[e.jsx("span",{children:"Billing Cycle"}),e.jsx("span",{children:"Monthly"})]}),e.jsxs("div",{className:"summary-item total",children:[e.jsx("span",{children:"Total Due Now"}),e.jsxs("span",{children:["₦",r.price.toLocaleString()]})]})]}),e.jsxs("div",{className:"payment-method-select",children:[e.jsx("label",{className:"form-label",children:"Payment Method"}),e.jsxs("select",{className:"form-control",children:[e.jsx("option",{children:"Card ****1234 (Default)"}),e.jsx("option",{children:"Add New Payment Method"})]})]}),e.jsx("div",{className:"terms-agreement",children:e.jsxs("label",{style:{display:"flex",alignItems:"flex-start",gap:"0.5rem"},children:[e.jsx("input",{type:"checkbox",defaultChecked:!0}),e.jsxs("span",{children:["I agree to the ",e.jsx("a",{href:"#",style:{color:"#1a237e"},children:"Terms of Service"})," and authorize RentEasy to charge my payment method ₦",r.price.toLocaleString()," monthly until I cancel."]})]})})]})]}),e.jsxs("div",{className:"modal-footer",children:[e.jsx("button",{className:"btn-secondary",onClick:()=>d(!1),disabled:f,children:"Cancel"}),e.jsx("button",{className:"btn-primary",onClick:L,disabled:f,style:{minWidth:"150px"},children:f?e.jsxs(e.Fragment,{children:[e.jsx(S,{className:"spin",style:{marginRight:"0.5rem"}}),"Processing..."]}):"Upgrade Now"})]})]})}),e.jsx("style",{jsx:!0,children:`
        .plan-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
        }
        
        .plan-badge.free {
          background: #f5f5f5;
          color: #757575;
        }
        
        .plan-badge.professional {
          background: #e3f2fd;
          color: #1565c0;
        }
        
        .plan-badge.business {
          background: #f3e5f5;
          color: #7b1fa2;
        }
        
        .plan-badge.enterprise {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .current-plan-overview {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .plan-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 2rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
        }
        
        .plan-price {
          display: flex;
          flex-direction: column;
        }
        
        .price-amount {
          font-size: 3rem;
          font-weight: 700;
          color: #1a237e;
          line-height: 1;
        }
        
        .price-period {
          font-size: 1rem;
          color: #666;
          font-weight: 500;
        }
        
        .price-description {
          color: #666;
          margin-top: 0.5rem;
        }
        
        .plan-status {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }
        
        .status-badge {
          padding: 0.3rem 0.8rem;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .status-badge.active {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .status-badge.paid {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .status-badge.free {
          background: #f5f5f5;
          color: #757575;
        }
        
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 34px;
        }
        
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        
        input:checked + .toggle-slider {
          background-color: #4caf50;
        }
        
        input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }
        
        .free-plan-usage {
          padding: 1.5rem;
          background: #fff8e1;
          border-radius: 12px;
          border-left: 4px solid #ff9800;
        }
        
        .usage-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .usage-progress {
          margin: 1.5rem 0;
        }
        
        .usage-progress .progress-bar {
          height: 10px;
          border-radius: 5px;
          margin-bottom: 0.5rem;
        }
        
        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: #666;
        }
        
        .usage-warning {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #ff9800;
        }
        
        .current-features {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .feature-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        
        .feature-icon {
          font-size: 1.2rem;
        }
        
        .feature-info {
          flex: 1;
        }
        
        .feature-name {
          font-weight: 600;
          margin-bottom: 0.3rem;
        }
        
        .feature-status {
          font-size: 0.8rem;
          color: #666;
        }
        
        .plan-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
        }
        
        .renewal-notice {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: #fff3e0;
          border-radius: 8px;
          border-left: 4px solid #ff9800;
        }
        
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 1.5rem;
        }
        
        .plan-card {
          padding: 2rem;
          border: 2px solid #e0e0e0;
          border-radius: 16px;
          position: relative;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }
        
        .plan-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        .plan-card.popular {
          border-width: 3px;
          transform: scale(1.02);
        }
        
        .plan-card.current {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        
        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          padding: 0.5rem 1.5rem;
          border-radius: 20px;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .current-badge {
          position: absolute;
          top: -12px;
          right: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          color: white;
          font-weight: 600;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .plan-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .plan-icon {
          font-size: 2rem;
        }
        
        .plan-name {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        .plan-tagline {
          margin: 0.3rem 0 0;
          font-weight: 600;
        }
        
        .plan-price-section {
          margin-bottom: 1.5rem;
        }
        
        .price {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a237e;
          line-height: 1;
        }
        
        .currency {
          font-size: 1.5rem;
          vertical-align: top;
        }
        
        .amount {
          font-size: 2.5rem;
        }
        
        .period {
          font-size: 1rem;
          color: #666;
          font-weight: 500;
        }
        
        .savings-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #e8f5e9;
          color: #2e7d32;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          margin-top: 0.5rem;
        }
        
        .plan-description {
          margin-bottom: 1.5rem;
          color: #666;
        }
        
        .recommended-for {
          margin: 1rem 0 0;
          padding: 0.8rem;
          background: #f8f9fa;
          border-radius: 8px;
          font-size: 0.9rem;
        }
        
        .plan-features {
          flex: 1;
          margin-bottom: 1.5rem;
        }
        
        .plan-features ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .plan-features li {
          display: flex;
          align-items: flex-start;
          gap: 0.8rem;
          margin-bottom: 0.8rem;
          font-size: 0.9rem;
        }
        
        .plan-features li span {
          flex: 1;
        }
        
        .limitations li {
          color: #666;
        }
        
        .billing-table {
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
          grid-template-columns: 1fr 2fr 1fr 1fr 1.5fr 1fr;
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
        
        .table-cell {
          padding: 0.5rem;
        }
        
        .invoice-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
        }
        
        .invoice-amount {
          font-weight: 600;
          color: #1a237e;
        }
        
        .invoice-amount.free {
          color: #666;
        }
        
        .payment-method {
          font-size: 0.9rem;
          color: #666;
        }
        
        .invoice-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .payment-methods-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 1rem;
        }
        
        .payment-method-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        
        .payment-method-card:hover {
          border-color: #1a237e;
          box-shadow: 0 4px 12px rgba(26, 35, 126, 0.1);
        }
        
        .method-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .method-details {
          flex: 1;
        }
        
        .method-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.9rem;
          color: #666;
        }
        
        .method-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        
        .default-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #e8f5e9;
          color: #2e7d32;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 1rem;
        }
        
        .faq-item {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
        }
        
        .faq-item h4 {
          margin: 0 0 1rem 0;
          color: #1a237e;
        }
        
        .faq-item p {
          margin: 0;
          color: #666;
          line-height: 1.6;
        }
        
        /* Modal Styles */
        .upgrade-summary {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }
        
        .current-plan, .new-plan, .price-difference {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.8rem 0;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .price-difference {
          border-bottom: none;
          padding-top: 1rem;
        }
        
        .difference.increase {
          color: #f44336;
          font-weight: 600;
        }
        
        .difference.decrease {
          color: #4caf50;
          font-weight: 600;
        }
        
        .feature-comparison {
          margin-bottom: 1.5rem;
        }
        
        .features-list {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
        }
        
        .feature-comparison-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .feature-comparison-item:last-child {
          border-bottom: none;
        }
        
        .already-have {
          color: #666;
          font-size: 0.9rem;
        }
        
        .new-feature {
          color: #4caf50;
          font-weight: 600;
          display: flex;
          align-items: center;
        }
        
        .payment-section {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
        }
        
        .payment-summary {
          margin-bottom: 1.5rem;
        }
        
        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.8rem 0;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .summary-item.total {
          border-bottom: none;
          padding-top: 1rem;
          font-weight: 600;
          font-size: 1.1rem;
          color: #1a237e;
        }
        
        .terms-agreement {
          margin-top: 1.5rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 1200px) {
          .plans-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .plans-grid {
            grid-template-columns: 1fr;
          }
          
          .plan-summary {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .table-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          
          .payment-method-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .method-actions {
            width: 100%;
            justify-content: space-between;
          }
          
          .plan-actions {
            flex-direction: column;
            align-items: stretch;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .faq-grid {
            grid-template-columns: 1fr;
          }
        }
      `})]})};export{J as default};
