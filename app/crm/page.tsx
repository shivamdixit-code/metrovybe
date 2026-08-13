import { orders } from "@/lib/data";
export default function CRM(){
 return <><h1 className="page-title">CRM DASHBOARD.</h1><p className="subtle">Manage MetroVybe customers, orders and listings.</p>
 <div className="stats" style={{marginTop:25}}><div className="stat"><span>Customers</span><b>1,284</b></div><div className="stat"><span>Orders</span><b>342</b></div><div className="stat"><span>Listings</span><b>486</b></div><div className="stat"><span>Revenue</span><b>₹8.4L</b></div></div>
 <div className="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Service</th><th>Amount</th><th>Status</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><b>{o.id}</b></td><td>{o.customer}</td><td>{o.service}</td><td>{o.amount}</td><td>{o.status}</td></tr>)}</tbody></table></div></>
}