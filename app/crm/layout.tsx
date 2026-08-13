import Link from "next/link";
import type { ReactNode } from "react";

export default function CRMLayout({children}:{children:ReactNode}){
 return <div className="crm-shell">
  <aside className="crm-side"><div className="logo">metro<span className="v">vybe</span>✦</div><p style={{color:"#aaa"}}>ADMIN CRM</p>
   <Link className="crm-link active" href="/crm">Dashboard</Link><Link className="crm-link" href="/crm/customers">Customers</Link><Link className="crm-link" href="/crm/orders">Orders</Link><Link className="crm-link" href="/crm/listings">Listings</Link><Link className="crm-link" href="/crm/providers">Providers</Link><Link className="crm-link" href="/crm/payments">Payments</Link>
   <div style={{marginTop:30}}><Link className="crm-link" href="/">← Back to marketplace</Link></div>
  </aside><main className="crm-main">{children}</main>
 </div>
}