import{r as l,j as e}from"./index-DRyMwwkr.js";import{P as F}from"./ProviderPageTemplate-DE_zu0kM.js";import{$ as h,b as d,L as g,Y as P,a2 as A,X as z,a3 as T,W as L,a4 as R,Z as D}from"./index-CbNkEdQY.js";const W=()=>{const[r,m]=l.useState([{id:1,title:"Modern Apartment Painting",description:"Complete interior painting for 3-bedroom apartment in Lekki",category:"Painting",type:"image",url:"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",date:"2024-01-10",rating:4.8,views:245,tags:["interior","modern","apartment"],featured:!0},{id:2,title:"Office Deep Cleaning",description:"Commercial cleaning for 10-story office building",category:"Cleaning",type:"image",url:"https://images.unsplash.com/photo-1581578731548-c64695cc6952?w-400",date:"2024-01-05",rating:4.9,views:189,tags:["commercial","office","deep-clean"],featured:!0},{id:3,title:"Kitchen Renovation",description:"Complete kitchen remodeling with modern fixtures",category:"Renovation",type:"image",url:"https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400",date:"2023-12-20",rating:4.7,views:312,tags:["kitchen","renovation","modern"],featured:!1},{id:4,title:"Garden Landscape Design",description:"Landscaping and garden setup for residential property",category:"Landscaping",type:"video",url:"https://example.com/video1.mp4",thumbnail:"https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400",date:"2023-12-15",rating:4.6,views:156,tags:["garden","landscaping","outdoor"],featured:!1},{id:5,title:"Plumbing System Upgrade",description:"Complete plumbing system replacement",category:"Plumbing",type:"document",url:"https://example.com/report1.pdf",thumbnail:"https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=400",date:"2023-12-10",rating:4.5,views:98,tags:["plumbing","system","upgrade"],featured:!1},{id:6,title:"Electrical Wiring Project",description:"New electrical wiring for residential building",category:"Electrical",type:"image",url:"https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400",date:"2023-11-28",rating:4.8,views:201,tags:["electrical","wiring","safety"],featured:!0}]),[f]=l.useState(["All","Painting","Cleaning","Renovation","Plumbing","Electrical","Landscaping"]),[p,j]=l.useState("All"),[o,b]=l.useState(""),[u,v]=l.useState("date"),[x,w]=l.useState(!1),[a,i]=l.useState({title:"",description:"",category:"",type:"image",file:null,tags:"",featured:!1}),[N,n]=l.useState(!1),y=r.filter(t=>p!=="All"&&t.category!==p||x&&!t.featured?!1:o?t.title.toLowerCase().includes(o.toLowerCase())||t.description.toLowerCase().includes(o.toLowerCase())||t.tags.some(s=>s.toLowerCase().includes(o.toLowerCase())):!0).sort((t,s)=>{switch(u){case"date":return new Date(s.date)-new Date(t.date);case"rating":return s.rating-t.rating;case"views":return s.views-t.views;case"title":return t.title.localeCompare(s.title);default:return 0}}),C=()=>{if(!a.title||!a.category){alert("Please fill in required fields");return}const t={id:r.length+1,title:a.title,description:a.description,category:a.category,type:a.type,url:a.type==="image"?"https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400":a.type==="video"?"https://example.com/video.mp4":"https://example.com/document.pdf",thumbnail:a.type==="video"||a.type==="document"?"https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400":null,date:new Date().toISOString().split("T")[0],rating:0,views:0,tags:a.tags.split(",").map(s=>s.trim()).filter(s=>s),featured:a.featured};m([t,...r]),n(!1),i({title:"",description:"",category:"",type:"image",file:null,tags:"",featured:!1})},k=t=>{window.confirm("Are you sure you want to delete this portfolio item?")&&m(r.filter(s=>s.id!==t))},S=t=>{m(r.map(s=>s.id===t?{...s,featured:!s.featured}:s))},I=t=>{switch(t){case"image":return e.jsx(h,{});case"video":return e.jsx(D,{});case"document":return e.jsx(R,{});default:return e.jsx(h,{})}},c={totalItems:r.length,featuredItems:r.filter(t=>t.featured).length,totalViews:r.reduce((t,s)=>t+s.views,0),averageRating:(r.reduce((t,s)=>t+s.rating,0)/r.length).toFixed(1)};return e.jsxs(F,{title:"Portfolio",subtitle:"Showcase your work to attract more clients",actions:e.jsxs("button",{className:"btn-primary",onClick:()=>n(!0),children:[e.jsx(L,{style:{marginRight:"0.5rem"}}),"Add Portfolio Item"]}),children:[e.jsxs("div",{className:"provider-grid",style:{marginBottom:"2rem"},children:[e.jsxs("div",{className:"provider-card stats-card",style:{background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",style:{color:"white"},children:"Total Items"}),e.jsx(h,{style:{color:"white",fontSize:"1.5rem"}})]}),e.jsx("div",{className:"stats-number",style:{color:"white"},children:c.totalItems}),e.jsx("div",{className:"stats-label",style:{color:"rgba(255,255,255,0.9)"},children:"Portfolio items"})]}),e.jsxs("div",{className:"provider-card stats-card",style:{background:"linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",style:{color:"white"},children:"Featured"}),e.jsx(d,{style:{color:"white",fontSize:"1.5rem"}})]}),e.jsx("div",{className:"stats-number",style:{color:"white"},children:c.featuredItems}),e.jsx("div",{className:"stats-label",style:{color:"rgba(255,255,255,0.9)"},children:"Featured items"})]}),e.jsxs("div",{className:"provider-card stats-card",style:{background:"linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",style:{color:"white"},children:"Total Views"}),e.jsx(g,{style:{color:"white",fontSize:"1.5rem"}})]}),e.jsx("div",{className:"stats-number",style:{color:"white"},children:c.totalViews}),e.jsx("div",{className:"stats-label",style:{color:"rgba(255,255,255,0.9)"},children:"Total portfolio views"})]}),e.jsxs("div",{className:"provider-card stats-card",style:{background:"linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",style:{color:"white"},children:"Avg. Rating"}),e.jsx(d,{style:{color:"white",fontSize:"1.5rem"}})]}),e.jsx("div",{className:"stats-number",style:{color:"white"},children:c.averageRating}),e.jsx("div",{className:"stats-label",style:{color:"rgba(255,255,255,0.9)"},children:"Average rating"})]})]}),e.jsxs("div",{className:"provider-card",style:{marginBottom:"2rem"},children:[e.jsx("div",{className:"card-header",children:e.jsx("h3",{className:"card-title",children:"Filter Portfolio"})}),e.jsxs("div",{style:{display:"flex",gap:"1rem",flexWrap:"wrap",alignItems:"center"},children:[e.jsx("div",{style:{flex:1,minWidth:"300px"},children:e.jsxs("div",{style:{position:"relative"},children:[e.jsx(P,{style:{position:"absolute",left:"1rem",top:"50%",transform:"translateY(-50%)",color:"#666"}}),e.jsx("input",{type:"text",placeholder:"Search portfolio items...",className:"form-control",style:{paddingLeft:"2.5rem"},value:o,onChange:t=>b(t.target.value)})]})}),e.jsx("div",{className:"category-filter",children:e.jsx("select",{className:"form-control",value:p,onChange:t=>j(t.target.value),style:{minWidth:"150px"},children:f.map(t=>e.jsx("option",{value:t,children:t},t))})}),e.jsx("div",{className:"sort-filter",children:e.jsxs("select",{className:"form-control",value:u,onChange:t=>v(t.target.value),style:{minWidth:"150px"},children:[e.jsx("option",{value:"date",children:"Newest First"}),e.jsx("option",{value:"rating",children:"Highest Rated"}),e.jsx("option",{value:"views",children:"Most Viewed"}),e.jsx("option",{value:"title",children:"Title (A-Z)"})]})}),e.jsxs("label",{style:{display:"flex",alignItems:"center",gap:"0.5rem",cursor:"pointer"},children:[e.jsx("input",{type:"checkbox",checked:x,onChange:t=>w(t.target.checked),style:{width:"18px",height:"18px"}}),e.jsx("span",{children:"Show Featured Only"})]})]})]}),e.jsx("div",{className:"portfolio-grid",children:y.length===0?e.jsxs("div",{className:"empty-state",style:{gridColumn:"1 / -1"},children:[e.jsx("div",{className:"empty-state-icon",children:"🖼️"}),e.jsx("h3",{children:"No portfolio items found"}),e.jsx("p",{children:"Try changing your filters or add new portfolio items"}),e.jsx("button",{className:"btn-primary",onClick:()=>n(!0),children:"Add Your First Item"})]}):y.map(t=>e.jsxs("div",{className:"portfolio-item",children:[e.jsxs("div",{className:"item-header",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.5rem"},children:[I(t.type),e.jsx("span",{className:"item-type",children:t.type.toUpperCase()})]}),e.jsxs("div",{style:{display:"flex",gap:"0.5rem"},children:[e.jsx("button",{className:"item-action-btn",onClick:()=>S(t.id),title:t.featured?"Remove from featured":"Mark as featured",children:e.jsx(d,{style:{color:t.featured?"#ffd700":"#ccc"}})}),e.jsx("button",{className:"item-action-btn",title:"Edit",onClick:()=>alert(`Edit item ${t.id}`),children:e.jsx(A,{})}),e.jsx("button",{className:"item-action-btn",onClick:()=>k(t.id),title:"Delete",children:e.jsx(z,{})})]})]}),e.jsxs("div",{className:"item-thumbnail",children:[e.jsx("img",{src:t.thumbnail||t.url,alt:t.title,onError:s=>{s.target.onerror=null,s.target.src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400"}}),t.featured&&e.jsxs("div",{className:"featured-badge",children:[e.jsx(d,{})," Featured"]})]}),e.jsxs("div",{className:"item-info",children:[e.jsx("h4",{className:"item-title",children:t.title}),e.jsx("p",{className:"item-description",children:t.description}),e.jsxs("div",{className:"item-meta",children:[e.jsx("span",{className:"item-category",children:t.category}),e.jsx("span",{className:"item-date",children:t.date})]}),e.jsx("div",{className:"item-tags",children:t.tags.map(s=>e.jsx("span",{className:"tag",children:s},s))}),e.jsxs("div",{className:"item-stats",children:[e.jsxs("div",{className:"stat",children:[e.jsx(d,{}),e.jsx("span",{children:t.rating})]}),e.jsxs("div",{className:"stat",children:[e.jsx(g,{}),e.jsxs("span",{children:[t.views," views"]})]})]}),e.jsxs("div",{className:"item-actions",children:[e.jsxs("button",{className:"btn-secondary",onClick:()=>alert(`View details of ${t.title}`),children:[e.jsx(g,{style:{marginRight:"0.3rem"}}),"View"]}),e.jsxs("button",{className:"btn-secondary",onClick:()=>alert(`Share ${t.title}`),children:[e.jsx(T,{style:{marginRight:"0.3rem"}}),"Share"]})]})]})]},t.id))}),N&&e.jsx("div",{className:"modal-overlay",children:e.jsxs("div",{className:"modal-content",children:[e.jsxs("div",{className:"modal-header",children:[e.jsx("h3",{children:"Add Portfolio Item"}),e.jsx("button",{className:"modal-close",onClick:()=>n(!1),children:"×"})]}),e.jsx("div",{className:"modal-body",children:e.jsxs("div",{className:"provider-grid",children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Title *"}),e.jsx("input",{type:"text",className:"form-control",value:a.title,onChange:t=>i({...a,title:t.target.value}),placeholder:"e.g., Modern Apartment Painting"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Category *"}),e.jsxs("select",{className:"form-control",value:a.category,onChange:t=>i({...a,category:t.target.value}),children:[e.jsx("option",{value:"",children:"Select Category"}),f.filter(t=>t!=="All").map(t=>e.jsx("option",{value:t,children:t},t))]})]}),e.jsxs("div",{className:"form-group",style:{gridColumn:"span 2"},children:[e.jsx("label",{className:"form-label",children:"Description"}),e.jsx("textarea",{className:"form-control",rows:"3",value:a.description,onChange:t=>i({...a,description:t.target.value}),placeholder:"Describe your work..."})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Type"}),e.jsxs("select",{className:"form-control",value:a.type,onChange:t=>i({...a,type:t.target.value}),children:[e.jsx("option",{value:"image",children:"Image"}),e.jsx("option",{value:"video",children:"Video"}),e.jsx("option",{value:"document",children:"Document"})]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Tags"}),e.jsx("input",{type:"text",className:"form-control",value:a.tags,onChange:t=>i({...a,tags:t.target.value}),placeholder:"e.g., modern, apartment, painting"}),e.jsx("small",{className:"form-text",children:"Separate tags with commas"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Upload File"}),e.jsx("input",{type:"file",className:"form-control",onChange:t=>i({...a,file:t.target.files[0]}),accept:a.type==="image"?"image/*":a.type==="video"?"video/*":".pdf,.doc,.docx"})]}),e.jsx("div",{className:"form-group",style:{gridColumn:"span 2"},children:e.jsxs("label",{style:{display:"flex",alignItems:"center",gap:"0.5rem"},children:[e.jsx("input",{type:"checkbox",checked:a.featured,onChange:t=>i({...a,featured:t.target.checked})}),e.jsx("span",{children:"Mark as featured item"})]})})]})}),e.jsxs("div",{className:"modal-footer",children:[e.jsx("button",{className:"btn-secondary",onClick:()=>n(!1),children:"Cancel"}),e.jsx("button",{className:"btn-primary",onClick:C,children:"Add Item"})]})]})}),e.jsx("style",{jsx:!0,children:`
        .portfolio-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        
        .portfolio-item {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          border: 1px solid #e0e0e0;
        }
        
        .portfolio-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
          border-color: #1a237e;
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: #f8f9fa;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .item-type {
          font-size: 0.8rem;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
        }
        
        .item-action-btn {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          border: 1px solid #ddd;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .item-action-btn:hover {
          background: #f8f9fa;
          border-color: #1a237e;
          color: #1a237e;
        }
        
        .item-thumbnail {
          position: relative;
          height: 200px;
          overflow: hidden;
        }
        
        .item-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .portfolio-item:hover .item-thumbnail img {
          transform: scale(1.05);
        }
        
        .featured-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: linear-gradient(135deg, #ffd700 0%, #ff9800 100%);
          color: white;
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .item-info {
          padding: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .item-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #1a237e;
        }
        
        .item-description {
          margin: 0 0 1rem 0;
          color: #666;
          font-size: 0.9rem;
          line-height: 1.5;
          flex: 1;
        }
        
        .item-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding: 0.5rem 0;
          border-top: 1px solid #e0e0e0;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .item-category {
          background: #e8f0fe;
          color: #1a237e;
          padding: 0.3rem 0.8rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .item-date {
          color: #666;
          font-size: 0.8rem;
        }
        
        .item-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .tag {
          background: #f0f0f0;
          color: #666;
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
          font-size: 0.8rem;
        }
        
        .item-stats {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .stat {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          color: #666;
          font-size: 0.9rem;
        }
        
        .item-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: auto;
        }
        
        .item-actions button {
          flex: 1;
          padding: 0.5rem;
          font-size: 0.9rem;
        }
        
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        
        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .modal-header h3 {
          margin: 0;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: #666;
          line-height: 1;
        }
        
        .modal-body {
          padding: 1.5rem;
        }
        
        .modal-footer {
          padding: 1.5rem;
          border-top: 1px solid #e0e0e0;
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }
        
        .form-text {
          display: block;
          margin-top: 0.3rem;
          color: #666;
          font-size: 0.8rem;
        }
        
        @media (max-width: 768px) {
          .portfolio-grid {
            grid-template-columns: 1fr;
          }
          
          .item-actions {
            flex-direction: column;
          }
          
          .modal-content {
            margin: 1rem;
          }
        }
      `})]})};export{W as default};
