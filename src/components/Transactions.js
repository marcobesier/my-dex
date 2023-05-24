import { useSelector } from "react-redux"
import { myOpenOrdersSelector } from "../store/selectors"
import Banner from "./Banner"

const Transactions = () => {
  const symbols = useSelector(state => state.tokens.symbols)
  const myOpenOrders = useSelector(myOpenOrdersSelector)

  return (
    <div className="component exchange__transactions">
      <div>
        <div className="component__header flex-between">
          <h2>My Orders</h2>

          <div className="tabs">
            <button className="tab tab--active">Orders</button>
            <button className="tab">Trades</button>
          </div>
        </div>

        {!myOpenOrders || myOpenOrders.length === 0 ? (
          <Banner text="No open orders" />
        ):(
          <table>
            <thead>
              <tr>
                <th>{symbols && symbols[0]}</th>
                <th>{symbols && symbols[1]}/{symbols && symbols[0]}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {myOpenOrders && myOpenOrders.map((order, index) => {
                return (
                  <tr key={index}>
                    <td style={{ color: `${order._orderTypeClass}`}}>{order._token0Amount}</td>
                    <td>{order._tokenPrice}</td>
                    <td>{/* Add cancel-order button here (later) */}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

      </div>

      {/* <div>
        <div className="component__header flex-between">
          <h2>My Transactions</h2>
          
          <div className="tabs">
            <button className="tab tab--active">Orders</button>
            <button className="tab">Trades</button>
          </div> 
        </div>

        <table>
          <thead>
            <tr>
              <th></th>
              <th></th>
              <th></th> 
            </tr>
          </thead>
          <tbody>
            <tr>
              <td></td>
              <td></td>
              <td></td> 
            </tr>
          </tbody>
        </table>

      </div> */}
    </div>
  )
}

export default Transactions