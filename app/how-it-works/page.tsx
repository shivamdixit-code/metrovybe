import { Header } from "@/components/Header"; import { BottomNav } from "@/components/BottomNav";
export default function How(){return <div className="page"><Header/><main className="shell inner"><h1 className="page-title">HOW IT WORKS.</h1><div className="cards">
 {["EXPLORE","COMPARE","CONNECT","LIVE BETTER"].map((x,i)=><div className="panel" key={x}><div style={{fontSize:50}}>0{i+1}</div><h2>{x}</h2><p className="subtle">Discover useful local services, compare options and connect with providers around you.</p></div>)}
 </div></main><BottomNav/></div>}