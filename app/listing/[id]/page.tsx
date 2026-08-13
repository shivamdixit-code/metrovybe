import { listings } from "@/lib/data";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function Listing({params}:{params:Promise<{id:string}>}){
 const {id}=await params; const item=listings.find(x=>x.id===id); if(!item) notFound();
 return <div className="page"><Header/><main className="shell inner">
  <Link href="/explore" style={{fontWeight:900}}>← Back to explore</Link>
  <div className="grid-2" style={{marginTop:20}}>
   <div className="panel"><div className="fake-img" style={{height:450,fontSize:150}}>{item.emoji}</div></div>
   <div className="panel">
    <span className="badge" style={{position:"static",display:"inline-block",background:item.color}}>FEATURED</span>
    <h1 className="page-title" style={{fontSize:52,marginTop:18}}>{item.title}</h1>
    <p>{item.location} · ⭐ {item.rating} ({item.reviews} reviews)</p>
    <h2 style={{fontSize:30}}>{item.price}<small>{item.period}</small></h2>
    <div className="tags">{item.tags.map(t=><span className="tag" key={t}>{t}</span>)}</div>
    <p style={{lineHeight:1.6}}>A trusted MetroVybe listing with verified details, transparent pricing and an easy way to contact the provider.</p>
    <button className="btn btn-green" style={{width:"100%",marginTop:15}}>Book / Enquire →</button>
   </div>
  </div>
 </main><BottomNav active="explore"/></div>
}