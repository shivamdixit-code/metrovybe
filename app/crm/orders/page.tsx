import { orders } from "@/lib/data";

export default function Orders() {
  return (
    <div>
      <h1 className="page-title">ORDERS.</h1>

      <p className="subtle">
        Manage customer orders and their current status.
      </p>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customer}</td>
                <td>{o.service}</td>
                <td>{o.amount}</td>
                <td>{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
