import Link from "next/link";
import { Search } from "lucide-react";

export function Header(){
  return <header className="header">
    <div className="header-inner">
      <Link href="/" aria-label="MetroVybe home">
        <div className="logo">metro<span className="v">vybe</span><span className="logo-star">✦</span></div>
        <div className="tagline">YOUR CITY. YOUR VYBE.</div>
      </Link>
      <div className="searchbar">
        <Search size={23}/>
        <input placeholder="Search PGs, food, laundry..." />
        <span className="key">/</span>
      </div>
      <div className="header-actions">
        <Link className="btn" href="/profile">Log in</Link>
        <Link className="btn btn-green" href="/list">List a service ＋</Link>
      </div>
    </div>
  </header>
}