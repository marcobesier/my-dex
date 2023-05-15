import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import config from '../config.json';
import { 
  loadProvider, 
  loadNetwork, 
  loadAccount,
  loadTokens,
  loadExchange,
  subscribeToEvents
} from '../store/interactions.js';

import Navbar from './Navbar.js';
import Markets from './Markets.js';
import Balance from './Balance.js';

function App() {

  const dispatch = useDispatch()

  const loadBlockchainData = async () => {

    // Connect to blockchain
    const provider = loadProvider(dispatch)
    const chainId = await loadNetwork(provider, dispatch)

    // Reload page when network changes
    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })

    // Fetch account and balance from MetaMask if they're changed
    window.ethereum.on('accountsChanged', async () => {
      await loadAccount(provider, dispatch)
    })

    // Token smart contract
    const MT = config[chainId].MT.address
    const mETH = config[chainId].mETH.address
    await loadTokens(provider, [MT, mETH], dispatch)

    // Exchange contract
    const exchangeAddress = config[chainId].exchange.address
    const exchange = await loadExchange(provider, exchangeAddress, dispatch)

    // Listen to events
    subscribeToEvents(exchange, dispatch)
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return ( 
    <div className="App">
      <div>
        
        <Navbar />

        <main className='exchange grid'>
          <section className='exchange__section--left grid'>

            <Markets />

            <Balance />

            {/* Order */}

          </section>
          <section className='exchange__section--right grid'>

            {/* PriceChart */}

            {/* Transactions */}

            {/* Trades */}

            {/* OrderBook */}

          </section>
        </main>

        {/* Alert */}

      </div>
    </div>
  );
}

export default App;