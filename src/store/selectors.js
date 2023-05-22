import { createSelector } from "reselect";
import { get, groupBy, reject } from "lodash";
import { ethers } from "ethers";
import moment from "moment";

const tokens = state => get(state, "tokens.contracts")
const allOrders = state => get(state, "exchange.allOrders.data", [])
const cancelledOrders = state => get(state, "exchange.cancelledOrders.data", [])
const filledOrders = state => get(state, "exchange.filledOrders.data", [])

const openOrders = state => {
  const all = allOrders(state)
  const filled = filledOrders(state)
  const cancelled = cancelledOrders(state)

  const openOrders = reject(all, (order) => {
    const orderFilled = filled.some((o) => o._id.toString() === order._id.toString())
    const orderCancelled = cancelled.some((o) => o._id.toString() === order._id.toString())
    return (orderFilled || orderCancelled)
  })

  return openOrders
}

const decorateOrder = (order, tokens) => {
  let token0Amount, token1Amount

  // Reminder: MT should be considered token0, mETH/mDAI should be considered token1
  if (order._tokenGive === tokens[0].address) {
    token0Amount = order._amountGive // The amount of MT we're giving
    token1Amount = order._amountGet // The amount of mETH/mDAI we want
  } else {
    token0Amount = order._amountGet // The amount of MT we want
    token1Amount = order._amountGive // The amount of mETH/mDAI we're giving
  }

  // Calculate token price and round it to 5 decimal places
  const precision = 100000
  let tokenPrice = token1Amount / token0Amount
  tokenPrice = Math.round(tokenPrice * precision) / precision

  return ({
    ...order,
    _token0Amount: ethers.utils.formatUnits(token0Amount, 18),
    _token1Amount: ethers.utils.formatUnits(token1Amount, 18),
    _tokenPrice: tokenPrice,
    _formattedTimestamp: moment.unix(order._timestamp).format()
  })
}

export const orderBookSelector = createSelector(openOrders, tokens, (orders, tokens) => {

  if (!tokens[0] || !tokens[1] || !orders[0]) { return }

  // Filter orders by selected tokens
  orders = orders.filter((o) => o._tokenGet === tokens[0].address || o._tokenGet === tokens[1].address)
  orders = orders.filter((o) => o._tokenGive === tokens[0].address || o._tokenGive === tokens[1].address)

  // Decorate orders
  orders = decorateOrderBookOrders(orders, tokens)

  // Group orders by order type
  orders = groupBy(orders, "_orderType")

  // Fetch buy orders
  const buyOrders = get(orders, "buy", [])

  // Sort buy orders by token price (from highest price to lowest price)
  orders = {
    ...orders,
    buyOrders: buyOrders.sort((a, b) => b._tokenPrice - a._tokenPrice)
  }
  
  // Fetch sell orders
  const sellOrders = get(orders, "sell", [])

  // Sort sell orders by token price (from highest price to lowest price)
  orders = {
    ...orders,
    sellOrders: sellOrders.sort((a, b) => b._tokenPrice - a._tokenPrice)
  }

  return orders 
})

const decorateOrderBookOrders = (orders, tokens) => {
  return (
    orders.map((order) => {
      order = decorateOrder(order, tokens)
      order = decorateOrderBookOrder(order, tokens)
      return order
    })
  )
}

const GREEN = "#25CE8F"
const RED = "#F45353"

const decorateOrderBookOrder = (order, tokens) => {
  const orderType = order._tokenGive === tokens[1].address ? "buy" : "sell"

  return ({
    ...order,
    _orderType: orderType,
    _orderTypeClass: orderType === "buy" ? GREEN : RED,
    _orderFillAction: orderType === "buy" ? "sell" : "buy"
  })
}