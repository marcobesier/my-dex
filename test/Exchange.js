const { ethers } = require("hardhat")
const { expect } = require("chai")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 18)
}

describe("Exchange", () => {
  let deployer, feeAccount, exchange, token1, token2, user1

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
    token2 = await Token.deploy("Mock Dai", "mDAI", 1000000)

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

  describe("Checking Balances", () => {

    let amount = tokens(1)

    beforeEach(async () => {
      await token1.connect(user1).approve(exchange.address, amount)
      await exchange.connect(user1).depositToken(token1.address, amount)
    })

    it("Returns user balance", async () => {
      expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
    })
  })

  describe("Withdrawing Tokens", () => {

    let receipt
    let amount = tokens(10)

    beforeEach(async () => {
      // Deposit tokens before withdrawing
      // Approve tokens
      await token1.connect(user1).approve(exchange.address, amount)
      // Deposit tokens
      await exchange.connect(user1).depositToken(token1.address, amount)

      // Withdraw tokens
      const transaction = await exchange.connect(user1).withdrawToken(token1.address, amount)
      receipt = await transaction.wait()
    })

    it("Withdraws tokens", async () => {
      // Ensure the tokens were transferred to the user
      expect(await token1.balanceOf(exchange.address)).to.equal(0)
      expect(await token1.balanceOf(user1.address)).to.equal(tokens(100))
      // Ensure exchange keeps track of the withdrawal
      expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0)
    })

    it("Emits a Withdraw event", async () => {
      const event = receipt.events[1]
      expect(event.event).to.equal("Withdraw")

      const args = event.args
      expect(args._token).to.equal(token1.address)
      expect(args._user).to.equal(user1.address)
      expect(args._amount).to.equal(amount)
      expect(args._balance).to.equal(0)
    })

  })

  describe("Making Orders", () => {

    let receipt
    let amount = tokens(1)

    describe("Successful Orders", () => {

      beforeEach(async () => {

        await token1.connect(user1).approve(exchange.address, amount)
        await exchange.connect(user1).depositToken(token1.address, amount)
  
        // user1 wants to get 1 mDAI for 1 MT
        const transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount)
        receipt = await transaction.wait()
      })

      it("Counts orders", async () => {
        expect(await exchange.orderCount()).to.equal(1)
      })

      it("Instantiates and stores the orders correctly", async () => {
        const orderId = 1
        const { id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp } = { ...(await exchange.orders(orderId)) }

        expect(id).to.equal(1)
        expect(user).to.equal(user1.address)
        expect(tokenGet).to.equal(token2.address)
        expect(amountGet).to.equal(amount)
        expect(tokenGive).to.equal(token1.address)
        expect(amountGive).to.equal(amount)
        // This is unix time. Since the value depends on when we execute the test, it's hard
        // to test for a specific time value. Instead, we just make sure it exists by requiring
        // it to be at least 1.
        expect(timestamp).to.be.at.least(1)
      })

      it("Emits an Order event", async () => {
        const event = receipt.events[0]
        expect(event.event).to.equal("Order")
  
        const args = event.args
        expect(args._id).to.equal(1)
        expect(args._user).to.equal(user1.address)
        expect(args._tokenGet).to.equal(token2.address)
        expect(args._amountGet).to.equal(amount)
        expect(args._tokenGive).to.equal(token1.address)
        expect(args._amountGive).to.equal(amount)
        expect(args._timestamp).to.be.at.least(1)
      })

    })

    describe("Failing Orders", () => {
      
      it("Rejects order if user has insufficient balance", async () => {
        await expect(exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount)).to.be.revertedWith("Insufficient balance")
      })

    })

  })

})