import Link from "next/link";
import { Heart, MapPin, Star } from "lucide-react";

export type Listing={id:string;title:string;category:string;emoji:string;price:string;period:string;location:string;rating:number;reviews:number;tags:string[];color:string};

export function ListingCard({item}:{item:Listing}){
 return <article className="card">
   <div className="card-image">
     <div className="fake-img">{item.emoji}</div>
     <span className="badge" style={{background:item.color}}>FEATURED</span>
     <button className="heart" aria-label="Save"><Heart size={23}/></button>
   </div>
   <div className="card-body">
     <div className="card-title-row">
       <div className="card-title">{item.title}</div>
       <div className="price">{item.price}<small>{item.period}</small></div>
     </div>
     <div className="meta"><MapPin size={14} style={{verticalAlign:"-2px"}}/> {item.location}
       <span className="rating"><Star className="star" size={14} fill="currentColor" style={{verticalAlign:"-2px"}}/> {item.rating} ({item.reviews})</span>
     </div>
     <div className="tags">{item.tags.map(t=><span className="tag" key={t}>{t}</span>)}</div>
     <Link href={`/listing/${item.id}`} style={{display:"block",marginTop:13,fontWeight:900}}>View listing →</Link>
   </div>
 </article>
}