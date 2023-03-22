import { useEffect } from 'react';
import { ethers } from 'ethers';
import '../App.css';
import TOKEN_ABI from '../abis/Token.json';
import config from '../config.json';

function App() {

  const loadBlockchainData = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    console.log(accounts[0])

    // Connect to blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const { chainId } = await provider.getNetwork()
    console.log(chainId)

    // Token smart contract
    const MT = new ethers.Contract(config[chainId].MT.address, TOKEN_ABI, provider)
    console.log(MT.address)
    const MTSymbol = await MT.symbol()
    console.log(MTSymbol)
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