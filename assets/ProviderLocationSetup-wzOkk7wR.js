import{r as d,j as e}from"./index-DRyMwwkr.js";import{P as R}from"./ProviderPageTemplate-DE_zu0kM.js";import{C as p,h as v,a9 as j,aa as h,ab as U,ac as E,B as Y,ad as k,a2 as D,X as V,i as q,V as B,W as O}from"./index-CbNkEdQY.js";const X=()=>{const[i,g]=d.useState([{id:1,name:"Lagos Mainland",center:{lat:6.5244,lng:3.3792},radius:10,radiusUnit:"km",type:"radius",address:"Lagos Mainland, Lagos",priceAdjustment:0,description:"Mainland areas including Ikeja, Surulere, Yaba",active:!0,coverage:85,estimatedTravelTime:"30-45 mins"},{id:2,name:"Lagos Island",center:{lat:6.455,lng:3.3841},radius:8,radiusUnit:"km",type:"radius",address:"Lagos Island, Lagos",priceAdjustment:1500,description:"Island areas including VI, Ikoyi, Lekki",active:!0,coverage:75,estimatedTravelTime:"45-60 mins"},{id:3,name:"Ibadan Central",center:{lat:7.3775,lng:3.947},radius:15,radiusUnit:"km",type:"radius",address:"Ibadan, Oyo State",priceAdjustment:5e3,description:"Central Ibadan areas",active:!1,coverage:60,estimatedTravelTime:"1-2 hours"},{id:4,name:"Custom Zone 1",type:"custom",points:[{lat:6.5244,lng:3.3792},{lat:6.5344,lng:3.3892},{lat:6.5144,lng:3.3992}],address:"Custom defined area",priceAdjustment:2e3,description:"Manually defined service zone",active:!0,coverage:40,estimatedTravelTime:"20-30 mins"}]),[c,C]=d.useState({lat:6.5244,lng:3.3792,address:"Lagos, Nigeria"}),[s,t]=d.useState({name:"",type:"radius",centerLat:"",centerLng:"",radius:"",radiusUnit:"km",address:"",priceAdjustment:"",description:"",active:!0}),[x,L]=d.useState(!1),[S,o]=d.useState(!1),[u,f]=d.useState(null),[b,N]=d.useState("radius");d.useEffect(()=>{(()=>{navigator.geolocation&&navigator.geolocation.getCurrentPosition(r=>{C({lat:r.coords.latitude,lng:r.coords.longitude,address:"Your current location"})},()=>{console.log("Geolocation not available or denied")})})()},[]);const M=()=>{if(!s.name||!s.address){alert("Please fill in required fields");return}if(u)g(a=>a.map(r=>r.id===u.id?{...r,...s,radius:s.radius?parseInt(s.radius):void 0,center:s.centerLat&&s.centerLng?{lat:parseFloat(s.centerLat),lng:parseFloat(s.centerLng)}:r.center,priceAdjustment:parseInt(s.priceAdjustment)||0}:r));else{const a={id:i.length+1,name:s.name,type:s.type,center:s.centerLat&&s.centerLng?{lat:parseFloat(s.centerLat),lng:parseFloat(s.centerLng)}:c,radius:s.radius?parseInt(s.radius):10,radiusUnit:s.radiusUnit,address:s.address,priceAdjustment:parseInt(s.priceAdjustment)||0,description:s.description,active:s.active,coverage:Math.floor(Math.random()*30)+50,estimatedTravelTime:`${Math.floor(Math.random()*30)+20}-${Math.floor(Math.random()*30)+40} mins`};g([...i,a])}o(!1),f(null),t({name:"",type:"radius",centerLat:"",centerLng:"",radius:"",radiusUnit:"km",address:"",priceAdjustment:"",description:"",active:!0})},T=a=>{f(a),t({name:a.name,type:a.type,centerLat:a.center?.lat?.toString()||"",centerLng:a.center?.lng?.toString()||"",radius:a.radius?.toString()||"",radiusUnit:a.radiusUnit||"km",address:a.address,priceAdjustment:a.priceAdjustment?.toString()||"",description:a.description,active:a.active}),o(!0)},I=a=>{g(r=>r.map(n=>n.id===a?{...n,active:!n.active}:n))},F=()=>{t({...s,centerLat:c.lat.toString(),centerLng:c.lng.toString()})},m={totalAreas:i.length,activeAreas:i.filter(a=>a.active).length,totalCoverage:i.reduce((a,r)=>a+(r.active?r.coverage:0),0),averageRadius:Math.round(i.reduce((a,r)=>a+(r.radius||0),0)/i.length)},z=(a,r,n,l)=>{const y=(n-a)*Math.PI/180,w=(l-r)*Math.PI/180,A=Math.sin(y/2)*Math.sin(y/2)+Math.cos(a*Math.PI/180)*Math.cos(n*Math.PI/180)*Math.sin(w/2)*Math.sin(w/2);return 6371*(2*Math.atan2(Math.sqrt(A),Math.sqrt(1-A)))},$=(a,r)=>{const n=i.filter(l=>l.active);for(const l of n)if(l.type==="radius"&&l.center&&z(a,r,l.center.lat,l.center.lng)<=l.radius)return l;return null};return e.jsxs(R,{title:"Service Area Setup",subtitle:"Define where you provide your services",actions:e.jsxs("div",{style:{display:"flex",gap:"1rem"},children:[e.jsxs("button",{className:"btn-secondary",onClick:()=>L(!x),children:[e.jsx(k,{style:{marginRight:"0.5rem"}}),x?"Hide Map":"Show Map"]}),e.jsxs("button",{className:"btn-primary",onClick:()=>o(!0),children:[e.jsx(O,{style:{marginRight:"0.5rem"}}),"Add Service Area"]})]}),children:[e.jsxs("div",{className:"provider-grid",style:{marginBottom:"2rem"},children:[e.jsxs("div",{className:"provider-card stats-card",style:{background:"linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",style:{color:"white"},children:"Service Areas"}),e.jsx(p,{style:{color:"white",fontSize:"1.5rem"}})]}),e.jsx("div",{className:"stats-number",style:{color:"white"},children:m.totalAreas}),e.jsx("div",{className:"stats-label",style:{color:"rgba(255,255,255,0.9)"},children:"Defined areas"})]}),e.jsxs("div",{className:"provider-card stats-card",style:{background:"linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",style:{color:"white"},children:"Active Areas"}),e.jsx(v,{style:{color:"white",fontSize:"1.5rem"}})]}),e.jsx("div",{className:"stats-number",style:{color:"white"},children:m.activeAreas}),e.jsx("div",{className:"stats-label",style:{color:"rgba(255,255,255,0.9)"},children:"Currently active"})]}),e.jsxs("div",{className:"provider-card stats-card",style:{background:"linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",style:{color:"white"},children:"Coverage"}),e.jsx(j,{style:{color:"white",fontSize:"1.5rem"}})]}),e.jsxs("div",{className:"stats-number",style:{color:"white"},children:[m.totalCoverage,"%"]}),e.jsx("div",{className:"stats-label",style:{color:"rgba(255,255,255,0.9)"},children:"Total area coverage"})]}),e.jsxs("div",{className:"provider-card stats-card",style:{background:"linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",style:{color:"white"},children:"Avg. Radius"}),e.jsx(h,{style:{color:"white",fontSize:"1.5rem"}})]}),e.jsxs("div",{className:"stats-number",style:{color:"white"},children:[m.averageRadius,"km"]}),e.jsx("div",{className:"stats-label",style:{color:"rgba(255,255,255,0.9)"},children:"Average service radius"})]})]}),x&&e.jsxs("div",{className:"provider-card",style:{marginBottom:"2rem"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("h3",{className:"card-title",children:"Service Area Map"}),e.jsxs("div",{style:{display:"flex",gap:"0.5rem"},children:[e.jsx("button",{className:`map-type-btn ${b==="radius"?"active":""}`,onClick:()=>N("radius"),children:"Radius View"}),e.jsx("button",{className:`map-type-btn ${b==="coverage"?"active":""}`,onClick:()=>N("coverage"),children:"Coverage View"})]})]}),e.jsxs("div",{className:"map-preview",children:[e.jsx("div",{className:"map-container",children:e.jsxs("div",{className:"map-background",children:[i.filter(a=>a.active).map(a=>e.jsx("div",{className:`map-area ${a.type}`,style:{left:`${((a.center?.lng||0)+180)/360*100}%`,top:`${(90-(a.center?.lat||0))/180*100}%`,width:a.radius?`${a.radius*2}px`:"60px",height:a.radius?`${a.radius*2}px`:"60px"},title:a.name},a.id)),e.jsx("div",{className:"current-location",style:{left:`${((c.lng||0)+180)/360*100}%`,top:`${(90-(c.lat||0))/180*100}%`},title:"Your Location"})]})}),e.jsxs("div",{className:"map-legend",children:[e.jsxs("div",{className:"legend-item",children:[e.jsx("div",{className:"legend-color",style:{background:"#4caf50"}}),e.jsx("span",{children:"Active Service Area"})]}),e.jsxs("div",{className:"legend-item",children:[e.jsx("div",{className:"legend-color",style:{background:"#ff9800"}}),e.jsx("span",{children:"Your Location"})]}),e.jsxs("div",{className:"legend-item",children:[e.jsx("div",{className:"legend-color",style:{background:"#f44336"}}),e.jsx("span",{children:"Outside Service Area"})]})]})]}),e.jsxs("div",{className:"map-stats",children:[e.jsxs("div",{className:"map-stat",children:[e.jsx(p,{}),e.jsxs("div",{children:[e.jsx("strong",{children:i.filter(a=>a.active).length}),e.jsx("span",{children:"Active Areas"})]})]}),e.jsxs("div",{className:"map-stat",children:[e.jsx(j,{}),e.jsxs("div",{children:[e.jsxs("strong",{children:[m.totalCoverage,"%"]}),e.jsx("span",{children:"City Coverage"})]})]}),e.jsxs("div",{className:"map-stat",children:[e.jsx(U,{}),e.jsxs("div",{children:[e.jsx("strong",{children:"15-45 min"}),e.jsx("span",{children:"Avg. Travel Time"})]})]})]})]}),e.jsxs("div",{className:"provider-card",children:[e.jsxs("div",{className:"card-header",children:[e.jsxs("h3",{className:"card-title",children:["Service Areas (",i.length,")"]}),e.jsx("p",{className:"card-subtitle",children:"Manage your service coverage zones"})]}),e.jsx("div",{className:"service-areas-list",children:i.map(a=>{const n=$(c.lat,c.lng)?.id===a.id;return e.jsxs("div",{className:`service-area-item ${a.active?"active":"inactive"}`,children:[e.jsxs("div",{className:"area-header",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1rem"},children:[e.jsx("div",{className:"area-icon",children:e.jsx(p,{})}),e.jsxs("div",{children:[e.jsx("h4",{style:{margin:0},children:a.name}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1rem",marginTop:"0.3rem"},children:[e.jsx("span",{className:"area-type",children:a.type}),n&&a.active&&e.jsxs("span",{className:"in-area-badge",children:[e.jsx(h,{})," You're in this area"]})]})]})]}),e.jsx("div",{className:"area-status",children:e.jsx("button",{className:`status-toggle ${a.active?"active":"inactive"}`,onClick:()=>I(a.id),children:a.active?"Active":"Inactive"})})]}),e.jsxs("div",{className:"area-details",children:[e.jsxs("div",{className:"detail-row",children:[e.jsxs("div",{className:"detail-item",children:[e.jsx(p,{}),e.jsxs("div",{children:[e.jsx("strong",{children:"Location"}),e.jsx("span",{children:a.address})]})]}),a.type==="radius"&&e.jsxs("div",{className:"detail-item",children:[e.jsx(j,{}),e.jsxs("div",{children:[e.jsx("strong",{children:"Radius"}),e.jsxs("span",{children:[a.radius," ",a.radiusUnit]})]})]}),e.jsxs("div",{className:"detail-item",children:[e.jsx(E,{}),e.jsxs("div",{children:[e.jsx("strong",{children:"Travel Time"}),e.jsx("span",{children:a.estimatedTravelTime})]})]})]}),e.jsxs("div",{className:"detail-row",children:[e.jsxs("div",{className:"detail-item",children:[e.jsx(Y,{}),e.jsxs("div",{children:[e.jsx("strong",{children:"Coverage"}),e.jsxs("div",{className:"coverage-bar",children:[e.jsx("div",{className:"coverage-fill",style:{width:`${a.coverage}%`}}),e.jsxs("span",{className:"coverage-text",children:[a.coverage,"%"]})]})]})]}),e.jsxs("div",{className:"detail-item",children:[e.jsx(k,{}),e.jsxs("div",{children:[e.jsx("strong",{children:"Price Adjustment"}),e.jsxs("span",{className:`price-adjustment ${a.priceAdjustment>0?"positive":a.priceAdjustment<0?"negative":"neutral"}`,children:[a.priceAdjustment>0?"+":"",a.priceAdjustment?`₦${a.priceAdjustment.toLocaleString()}`:"None"]})]})]})]}),a.description&&e.jsx("div",{className:"area-description",children:e.jsx("p",{style:{margin:0},children:a.description})})]}),e.jsxs("div",{className:"area-actions",children:[e.jsxs("div",{style:{display:"flex",gap:"0.5rem"},children:[e.jsxs("button",{className:"btn-secondary",onClick:()=>T(a),children:[e.jsx(D,{})," Edit"]}),e.jsxs("button",{className:"btn-secondary",onClick:()=>{window.confirm("Delete this service area?")&&g(i.filter(l=>l.id!==a.id))},style:{background:"#f44336",color:"white"},children:[e.jsx(V,{})," Delete"]})]}),e.jsx("div",{className:"area-meta",children:a.active?e.jsxs("span",{className:"meta-badge active",children:[e.jsx(v,{})," Accepting bookings"]}):e.jsxs("span",{className:"meta-badge inactive",children:[e.jsx(q,{})," Not accepting bookings"]})})]})]},a.id)})})]}),e.jsxs("div",{className:"provider-card",style:{marginTop:"2rem"},children:[e.jsx("div",{className:"card-header",children:e.jsx("h3",{className:"card-title",children:"Test Service Availability"})}),e.jsxs("div",{className:"test-location",children:[e.jsx("div",{className:"test-form",children:e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Check if you service a location"}),e.jsxs("div",{className:"location-input-group",children:[e.jsx("input",{type:"text",className:"form-control",placeholder:"Enter an address or coordinates",defaultValue:"Lagos, Nigeria"}),e.jsxs("button",{className:"btn-primary",children:[e.jsx(h,{})," Check"]})]})]})}),e.jsxs("div",{className:"test-result",children:[e.jsxs("div",{className:"result-header",children:[e.jsx(p,{}),e.jsxs("div",{children:[e.jsx("h4",{style:{margin:0},children:"Lagos, Nigeria"}),e.jsx("p",{style:{margin:"0.3rem 0 0",color:"#666"},children:"6.5244° N, 3.3792° E"})]})]}),e.jsxs("div",{className:"result-details",children:[e.jsxs("div",{className:"result-item",children:[e.jsx("strong",{children:"Service Available:"}),e.jsxs("span",{className:"result-badge available",children:[e.jsx(v,{})," Yes"]})]}),e.jsxs("div",{className:"result-item",children:[e.jsx("strong",{children:"Service Area:"}),e.jsx("span",{children:"Lagos Mainland"})]}),e.jsxs("div",{className:"result-item",children:[e.jsx("strong",{children:"Price Adjustment:"}),e.jsx("span",{children:"No additional charge"})]}),e.jsxs("div",{className:"result-item",children:[e.jsx("strong",{children:"Estimated Travel:"}),e.jsx("span",{children:"30-45 minutes"})]})]})]})]})]}),S&&e.jsx("div",{className:"modal-overlay",children:e.jsxs("div",{className:"modal-content",style:{maxWidth:"700px"},children:[e.jsxs("div",{className:"modal-header",children:[e.jsx("h3",{children:u?"Edit Service Area":"Add New Service Area"}),e.jsx("button",{className:"modal-close",onClick:()=>o(!1),children:"×"})]}),e.jsx("div",{className:"modal-body",children:e.jsxs("div",{className:"provider-grid",children:[e.jsxs("div",{className:"form-group",style:{gridColumn:"span 2"},children:[e.jsx("label",{className:"form-label",children:"Area Name *"}),e.jsx("input",{type:"text",className:"form-control",value:s.name,onChange:a=>t({...s,name:a.target.value}),placeholder:"e.g., Lagos Mainland, Ikeja Zone"})]}),e.jsxs("div",{className:"form-group",style:{gridColumn:"span 2"},children:[e.jsx("label",{className:"form-label",children:"Address *"}),e.jsx("input",{type:"text",className:"form-control",value:s.address,onChange:a=>t({...s,address:a.target.value}),placeholder:"Full address of the area center"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Area Type"}),e.jsxs("select",{className:"form-control",value:s.type,onChange:a=>t({...s,type:a.target.value}),children:[e.jsx("option",{value:"radius",children:"Radius (Circular)"}),e.jsx("option",{value:"custom",children:"Custom Polygon"})]})]}),s.type==="radius"&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Center Latitude"}),e.jsxs("div",{className:"input-with-action",children:[e.jsx("input",{type:"number",step:"any",className:"form-control",value:s.centerLat,onChange:a=>t({...s,centerLat:a.target.value}),placeholder:"e.g., 6.5244"}),e.jsx("button",{className:"input-action-btn",onClick:F,title:"Use current location",children:e.jsx(h,{})})]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Center Longitude"}),e.jsx("input",{type:"number",step:"any",className:"form-control",value:s.centerLng,onChange:a=>t({...s,centerLng:a.target.value}),placeholder:"e.g., 3.3792"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Radius"}),e.jsxs("div",{className:"input-with-unit",children:[e.jsx("input",{type:"number",className:"form-control",value:s.radius,onChange:a=>t({...s,radius:a.target.value}),placeholder:"10"}),e.jsxs("select",{className:"unit-select",value:s.radiusUnit,onChange:a=>t({...s,radiusUnit:a.target.value}),children:[e.jsx("option",{value:"km",children:"km"}),e.jsx("option",{value:"mi",children:"miles"})]})]})]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Price Adjustment"}),e.jsxs("div",{className:"input-with-prefix",children:[e.jsx("span",{className:"input-prefix",children:"₦"}),e.jsx("input",{type:"number",className:"form-control",value:s.priceAdjustment,onChange:a=>t({...s,priceAdjustment:a.target.value}),placeholder:"0"})]}),e.jsx("small",{className:"form-text",children:"Additional charge or discount for this area"})]}),e.jsxs("div",{className:"form-group",style:{gridColumn:"span 2"},children:[e.jsx("label",{className:"form-label",children:"Description"}),e.jsx("textarea",{className:"form-control",rows:"3",value:s.description,onChange:a=>t({...s,description:a.target.value}),placeholder:"Describe this service area..."})]}),e.jsx("div",{className:"form-group",children:e.jsxs("label",{style:{display:"flex",alignItems:"center",gap:"0.5rem"},children:[e.jsx("input",{type:"checkbox",checked:s.active,onChange:a=>t({...s,active:a.target.checked})}),e.jsx("span",{children:"Active (Accepting bookings)"})]})})]})}),e.jsxs("div",{className:"modal-footer",children:[e.jsx("button",{className:"btn-secondary",onClick:()=>o(!1),children:"Cancel"}),e.jsxs("button",{className:"btn-primary",onClick:M,children:[e.jsx(B,{style:{marginRight:"0.5rem"}}),u?"Update Area":"Add Area"]})]})]})}),e.jsx("style",{jsx:!0,children:`
        .map-preview {
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        
        .map-container {
          height: 400px;
          background: #e3f2fd;
          border-radius: 8px;
          position: relative;
          overflow: hidden;
          margin-bottom: 1rem;
        }
        
        .map-background {
          width: 100%;
          height: 100%;
          position: relative;
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        }
        
        .map-area {
          position: absolute;
          border-radius: 50%;
          background: rgba(76, 175, 80, 0.3);
          border: 2px solid #4caf50;
          transform: translate(-50%, -50%);
        }
        
        .map-area.radius {
          background: rgba(33, 150, 243, 0.3);
          border-color: #2196f3;
        }
        
        .map-area.custom {
          background: rgba(156, 39, 176, 0.3);
          border-color: #9c27b0;
          border-radius: 4px;
        }
        
        .current-location {
          position: absolute;
          width: 12px;
          height: 12px;
          background: #ff9800;
          border: 2px solid white;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 10px rgba(0,0,0,0.3);
        }
        
        .map-legend {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .legend-color {
          width: 20px;
          height: 20px;
          border-radius: 4px;
        }
        
        .map-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .map-stat {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        
        .map-stat svg {
          font-size: 2rem;
          color: #1a237e;
        }
        
        .map-type-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .map-type-btn.active {
          background: #1a237e;
          color: white;
          border-color: #1a237e;
        }
        
        .service-areas-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .service-area-item {
          padding: 1.5rem;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        
        .service-area-item.active {
          border-color: #4caf50;
          background: linear-gradient(135deg, #f1f8e9 0%, #e8f5e9 100%);
        }
        
        .service-area-item.inactive {
          border-color: #f5f5f5;
          background: #fafafa;
          opacity: 0.8;
        }
        
        .area-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .area-icon {
          width: 50px;
          height: 50px;
          background: #1a237e;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        
        .area-type {
          background: #e8f0fe;
          color: #1a237e;
          padding: 0.3rem 0.8rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        
        .in-area-badge {
          background: #4caf50;
          color: white;
          padding: 0.3rem 0.8rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        
        .area-details {
          margin: 1.5rem 0;
        }
        
        .detail-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .detail-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        
        .detail-item svg {
          color: #1a237e;
          font-size: 1.2rem;
          margin-top: 0.2rem;
        }
        
        .detail-item div {
          flex: 1;
        }
        
        .detail-item strong {
          display: block;
          margin-bottom: 0.3rem;
          color: #333;
        }
        
        .detail-item span {
          color: #666;
        }
        
        .coverage-bar {
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          position: relative;
          margin-top: 0.5rem;
        }
        
        .coverage-fill {
          height: 100%;
          background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        
        .coverage-text {
          position: absolute;
          right: 0;
          top: -20px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #333;
        }
        
        .price-adjustment {
          font-weight: 600;
          font-size: 1.1rem;
        }
        
        .price-adjustment.positive {
          color: #4caf50;
        }
        
        .price-adjustment.negative {
          color: #f44336;
        }
        
        .price-adjustment.neutral {
          color: #666;
        }
        
        .area-description {
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border-left: 4px solid #1a237e;
          margin-top: 1rem;
        }
        
        .area-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #e0e0e0;
        }
        
        .meta-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .meta-badge.active {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .meta-badge.inactive {
          background: #f5f5f5;
          color: #757575;
        }
        
        .test-location {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .location-input-group {
          display: flex;
          gap: 0.5rem;
        }
        
        .location-input-group .form-control {
          flex: 1;
        }
        
        .test-result {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
        }
        
        .result-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .result-header svg {
          font-size: 2rem;
          color: #1a237e;
        }
        
        .result-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }
        
        .result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.8rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        
        .result-badge {
          padding: 0.3rem 0.8rem;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        
        .result-badge.available {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .input-with-action {
          position: relative;
        }
        
        .input-action-btn {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .input-action-btn:hover {
          color: #1a237e;
        }
        
        .input-with-unit {
          display: flex;
          gap: 0.5rem;
        }
        
        .input-with-unit .form-control {
          flex: 1;
        }
        
        .unit-select {
          width: 80px;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 0.8rem;
          background: white;
        }
        
        .input-with-prefix {
          position: relative;
        }
        
        .input-prefix {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          font-weight: 600;
        }
        
        .input-with-prefix .form-control {
          padding-left: 2.5rem;
        }
        
        @media (max-width: 768px) {
          .detail-row {
            grid-template-columns: 1fr;
          }
          
          .area-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          
          .area-actions {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          
          .location-input-group {
            flex-direction: column;
          }
          
          .map-stats {
            grid-template-columns: 1fr;
          }
        }
      `})]})};export{X as default};
