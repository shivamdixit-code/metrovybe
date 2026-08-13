import Link from "next/link";
import { Home, Search, Heart, UserRound, Plus } from "lucide-react";

export function BottomNav({active="home"}:{active?:string}){
  const items=[["home","Home","/","home"],["explore","Explore","/explore","search"],["list","List","/list","plus"],["saved","Saved","/saved","heart"],["profile","Profile","/profile","user"]];
  const icon=(name:string)=>{
    if(name==="home") return <Home size={23}/>;
    if(name==="search") return <Search size={23}/>;
    if(name==="heart") return <Heart size={23}/>;
    if(name==="user") return <UserRound size={23}/>;
    return <Plus size={34}/>;
  };
  return <nav className="bottom-nav">{items.map(([id,label,href,ic])=>
    <Link key={id} href={href} className={`nav-item ${active===id?"active":""}`}>
      {id==="list"?<span className="nav-add">{icon(ic)}</span>:<span className="nav-icon">{icon(ic)}</span>}
      <span>{label}</span>
    </Link>
  )}</nav>
}