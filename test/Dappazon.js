const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("Dappazon", async () => {
  let dappazon
  let deployer, buyer
  let ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK

  //Deploy contract
  beforeEach(async () => {
    //setup accounts
    [deployer, buyer] = await ethers.getSigners()

    const Dappazon = await ethers.getContractFactory("Dappazon")
    dappazon = await Dappazon.deploy()

    ID = 1
    NAME = "Shoes"
    CATEGORY = "Clothing"
    IMAGE = "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg"
    COST = tokens(1)
    RATING = 4
    STOCK = 5
  })
  
  describe("Deployment", () => {
    it('Sets the owner', async () => {
      const owner = await dappazon.owner()
      expect(owner).to.equal(deployer.address)
    })
  })
  describe("Listing", () => {
    let transaction

    beforeEach(async () => {
      transaction = await dappazon.connect(deployer).list(
        ID, 
        NAME,
        CATEGORY,
        IMAGE,
        COST,
        RATING,
        STOCK
      )
      await transaction.wait()
    })
      it('Returns item id', async () => {
        const item = await dappazon.items(1)
        expect(item.id).to.equal(ID)
      })
      it('Returns item name', async () => {
        const item = await dappazon.items(1)
        expect(item.name).to.equal(NAME)
      })
      it('Returns item category', async () => {
        const item = await dappazon.items(1)
        expect(item.category).to.equal(CATEGORY)
      })
      it('Returns item category', async () => {
        const item = await dappazon.items(1)
        expect(item.image).to.equal(IMAGE)
      })
      it('Returns item cost', async () => {
        const item = await dappazon.items(1)
        expect(item.cost).to.equal(COST)
      })
      it('Returns item rating', async () => {
        const item = await dappazon.items(1)
        expect(item.rating).to.equal(RATING)
      })
      it('Returns item stock', async () => {
        const item = await dappazon.items(1)
        expect(item.stock).to.equal(STOCK)
      })
      it('Emits List event', () => {
        expect(transaction).to.emit(dappazon, "List")
      })
    })

    describe("Buying", () => {
      let transaction
  
      beforeEach(async () => {
        //list an item
        transaction = await dappazon.connect(deployer).list(
          ID, 
          NAME,
          CATEGORY,
          IMAGE,
          COST,
          RATING,
          STOCK
        )
        await transaction.wait()

        // Buy an item
        transaction = await dappazon.connect(buyer).buy(ID, { value: COST })
      })
        it('Updates buyers order count', async () => {
          const result = await dappazon.orderCount(buyer.address)
          expect(result).to.equal(1)
        })
        it('Adds the order', async () => {
          const order = await dappazon.orders(buyer.address, 1)

          expect(order.time).to.be.greaterThan(0)
          expect(order.item.name).to.equal(NAME)
        })
        it("updates the contract balance", async () => {
          const result = await ethers.provider.getBalance(dappazon.address)
          expect(result).to.equal(COST)
        })
        it('Emits buy event', () => {
          expect(transaction).to.emit(dappazon, "Buy")
        })
    })
    describe("Withdrawing", () => {
      let balanceBefore

      beforeEach(async () => {
        //List item
        let transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)
        await transaction.wait()
        // Get Deployer balance before
        balanceBefore = await ethers.provider.getBalance(deployer.address)
        //Withdraw
        transaction = await dappazon.connect(deployer).withdraw()
        await transaction.wait()
      })

      it('Updates the owner balance', async () => {
        const balanceAfter = await ethers.provider.getBalance(deployer.address)
        expect(balanceAfter).to.be.greaterThan(balanceBefore)
      })

      it('Updates the contract balance', async () => {
        const result = await ethers.provider.getBalance(dappazon.address)
        expect(result).to.equal(0)
      })
    })

})
