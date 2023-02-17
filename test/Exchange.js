const { ethers } = require("hardhat")
const { expect } = require("chai")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 18)
}

describe("Exchange", () => {
  let deployer, feeAccount, exchange, token1, user1

  const feePercent = 10

  beforeEach(async () => {
    const accounts = await ethers.getSigners()
    deployer = accounts[0]
    feeAccount = accounts[1]
    user1 = accounts[2]

    const Exchange = await ethers.getContractFactory("Exchange")
    exchange = await Exchange.deploy(feeAccount.address, feePercent)

    const Token = await ethers.getContractFactory("Token")
    token1 = await Token.deploy("My Token", "MT", 1000000)

    await token1.connect(deployer).transfer(user1.address, tokens(100))
  })

  describe("Deployment", () => {

    it("Tracks the fee account", async () => {
      expect(await exchange.feeAccount()).to.equal(feeAccount.address)
    })

    it("Tracks the fee percent", async () => {
      expect(await exchange.feePercent()).to.equal(feePercent)
    })

  })

  describe("Depositing Tokens", () => {

    let receipt
    let amount = tokens(10)

    beforeEach(async () => {
      // Approve tokens
      await token1.connect(user1).approve(exchange.address, amount)
      // Deposit tokens
      const transaction = await exchange.connect(user1).depositToken(token1.address, amount)
      receipt = await transaction.wait()
    })

    it("Tracks the token deposit", async () => {
      // Ensure the tokens were transferred to the exchange
      expect(await token1.balanceOf(exchange.address)).to.equal(amount)
      expect(await token1.balanceOf(user1.address)).to.equal(tokens(90))
      // Ensure exchange keeps track of the deposits
      expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount)
      expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
    })

    it("Emits a Deposit event", async () => {
      const event = receipt.events[1]
      expect(event.event).to.equal("Deposit")

      const args = event.args
      expect(args._token).to.equal(token1.address)
      expect(args._user).to.equal(user1.address)
      expect(args._amount).to.equal(amount)
      expect(args._balance).to.equal(amount)
    })

  })

})