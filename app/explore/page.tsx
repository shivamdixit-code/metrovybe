import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { listings } from "@/lib/data";
import { MapPin, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

export default function Explore(){
 const pins=[["18%","32%"],["44%","55%"],["70%","25%"],["76%","68%"],["30%","76%"]];
 return <div className="page"><Header/><main className="shell inner">
  <h1 className="page-title">EXPLORE NEAR YOU.</h1><p className="subtle">Find PGs, food, laundry and everyday services around your location.</p>
  <div className="filterbar"><button className="filter">📍 Near me</button><button className="filter">Stay</button><button className="filter">Eat</button><button className="filter">Live</button><button className="filter">Move</button><button className="filter">Go</button><button className="filter"><SlidersHorizontal size={15} style={{verticalAlign:"-3px"}}/> Filters</button></div>
  <div className="grid-2">
   <div className="map">{pins.map((p,i)=><div key={i} className="map-pin" style={{left:p[0],top:p[1],background:["#39ff14","#ff4fd8","#55e6e8","#ff8a3d","#a78bfa"][i]}}><span>●</span></div>)}</div>
   <div className="listing-list">{listings.map(x=><Link href={`/listing/${x.id}`} className="panel mini" key={x.id}>
     <div className="mini-img">{x.emoji}</div><div><b>{x.title}</b><div className="meta"><MapPin size={13} style={{verticalAlign:"-2px"}}/> {x.location}</div><div className="tags">{x.tags.slice(0,2).map(t=><span className="tag" key={t}>{t}</span>)}</div></div><strong>{x.price}</strong>
   </Link>)}</div>
  </div>
 </main><BottomNav active="explore"/></div>
}