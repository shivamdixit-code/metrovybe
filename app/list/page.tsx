import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

export default function ListPage(){return <div className="page"><Header/><main className="shell inner">
 <h1 className="page-title">LIST A SERVICE.</h1><p className="subtle">Put your PG, tiffin, laundry, moving or local service in front of people nearby.</p>
 <div className="panel" style={{maxWidth:850,marginTop:25}}>
  <div className="form-grid">
   <div className="field"><label>Service name</label><input placeholder="e.g. Premium Student PG"/></div>
   <div className="field"><label>Category</label><select><option>Stay</option><option>Eat</option><option>Live</option><option>Move</option><option>Go</option></select></div>
   <div className="field"><label>Price</label><input placeholder="₹8,500"/></div>
   <div className="field"><label>Area / location</label><input placeholder="Sector 62, Noida"/></div>
   <div className="field full"><label>Description</label><textarea placeholder="Tell customers what makes your service useful..."/></div>
   <div className="field"><label>Phone / WhatsApp</label><input placeholder="+91"/></div>
   <div className="field"><label>Availability</label><input placeholder="Mon-Sun"/></div>
  </div>
  <button className="btn btn-green" style={{marginTop:20}}>Submit listing →</button>
 </div>
 </main><BottomNav active="list"/></div>}