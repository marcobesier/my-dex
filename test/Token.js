const { ethers } = require("hardhat")
const { expect } = require("chai")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 18)
}

describe("Token", () => {

  let token

  beforeEach(async () => {
    const Token = await ethers.getContractFactory("Token")
    token = await Token.deploy("My Token", "MT", 1000000)
  })

  describe("Deployment", () => {

    const name = "My Token"
    const symbol = "MT"
    const decimals = 18
    const totalSupply = tokens(1000000)

    it("Returns the correct name", async () => {
      expect(await token.name()).to.equal(name)
    })
  
    it("Returns the correct symbol", async () => {
      expect(await token.symbol()).to.equal(symbol)
    })
  
    it("Returns the correct decimals", async () => {
      expect(await token.decimals()).to.equal(decimals)
    })
  
    it("Returns the correct total supply", async () => {
      expect(await token.totalSupply()).to.equal(totalSupply)
    })

  })

})