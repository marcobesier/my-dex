import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import config from '../config.json';
import { 
  loadProvider, 
  loadNetwork, 
  loadAccount,
  loadToken 
} from '../store/interactions.js';

function App() {

  const dispatch = useDispatch()

  const loadBlockchainData = async () => {
    await loadAccount(dispatch)

    // Connect to blockchain
    const provider = loadProvider(dispatch)
    const chainId = await loadNetwork(provider, dispatch)

    // Token smart contract
    await loadToken(provider, config[chainId].MT.address, dispatch)
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return ( 
    <div className="App">
      <div>
        
        {/* Navbar */}

        <main className='exchange grid'>
          <section className='exchange__section--left grid'>

            {/* Markets */}

            {/* Balance */}

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