import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SaveERC20", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployERC20TokenFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, accountOne, accountTwo, accountThree] = await ethers.getSigners();

    const BFAToken = await ethers.getContractFactory("BFAToken");
    const bfaToken = await BFAToken.deploy("1000");

    bfaToken.connect(owner).transfer(accountOne.address, ethers.parseEther("10"));
    bfaToken.connect(owner).transfer(accountTwo.address, ethers.parseEther("10"));
    bfaToken.connect(owner).transfer(accountThree.address, ethers.parseEther("10"));

    const SaveERC20 = await ethers.getContractFactory("SaveERC20");
    const saveErc20 = await SaveERC20.deploy(bfaToken.getAddress());

    return { bfaToken, saveErc20, owner, accountOne, accountTwo, accountThree };
  }

  describe("Deployment", function () {
    it("Should deploy both contract with the right parameters", async function () {
      const { bfaToken, saveErc20 } = await loadFixture(deployERC20TokenFixture);

      expect(await bfaToken.name()).to.equal("BFA Token");
      expect(await bfaToken.symbol()).to.equal("BFA");
      expect((await saveErc20.checkContractBalance()).toString()).to.equal("0");
    });
  });
  describe("deposit function", function () {
    it("Should save 5 BFA tokens to the contract", async function () {
      const { bfaToken, saveErc20, accountOne } = await loadFixture(deployERC20TokenFixture);

      await bfaToken.connect(accountOne).approve(saveErc20.getAddress(), ethers.parseEther("5"));
      await saveErc20.connect(accountOne).deposit(ethers.parseEther("5"));

      await expect((await saveErc20.checkUserBalance(accountOne.address)).toString()).to.equal(ethers.parseEther("5").toString());
    });

    it("Should update the balance of the contract", async function () {
      const { bfaToken, saveErc20, accountOne } = await loadFixture(deployERC20TokenFixture);
      await bfaToken.connect(accountOne).approve(saveErc20.getAddress(), ethers.parseEther("5"));
      await saveErc20.connect(accountOne).deposit(ethers.parseEther("5"));

      await expect((await saveErc20.checkContractBalance()).toString()).to.equal(ethers.parseEther("5").toString());
    });
    it("Should update the balance of the user", async function () {
      const { bfaToken, saveErc20, accountOne } = await loadFixture(deployERC20TokenFixture);
      await bfaToken.connect(accountOne).approve(saveErc20.getAddress(), ethers.parseEther("5"));
      await saveErc20.connect(accountOne).deposit(ethers.parseEther("5"));

      await expect((await saveErc20.checkUserBalance(accountOne.address)).toString()).to.equal(ethers.parseEther("5").toString());
    });
    it("Should not allow to deposit more than the user has", async function () {
      const { bfaToken, saveErc20, accountOne } = await loadFixture(deployERC20TokenFixture);
      await bfaToken.connect(accountOne).approve(saveErc20.getAddress(), ethers.parseEther("10"));
      await expect(saveErc20.connect(accountOne).deposit(ethers.parseEther("20"))).to.be.revertedWith("Insufficient balance");
    });
    it("Should emit a SavingSuccessful event", async function () {
      const { bfaToken, saveErc20, accountOne } = await loadFixture(deployERC20TokenFixture);
      await bfaToken.connect(accountOne).approve(saveErc20.getAddress(), ethers.parseEther("5"));
      await expect(saveErc20.connect(accountOne).deposit(ethers.parseEther("5")))
        .to.emit(saveErc20, "SavingSuccessful")
        .withArgs(accountOne.address, ethers.parseEther("5"));
    });
  });
  describe("withdraw function", function () {
    it("Should withdraw 5 BFA tokens from the contract to account", async function () {
      const { bfaToken, saveErc20, accountOne } = await loadFixture(deployERC20TokenFixture);
      await bfaToken.connect(accountOne).approve(saveErc20.getAddress(), ethers.parseEther("5"));
      await saveErc20.connect(accountOne).deposit(ethers.parseEther("5"));
      await saveErc20.connect(accountOne).withdraw(ethers.parseEther("2"));

      await expect((await bfaToken.balanceOf(accountOne.address)).toString()).to.equal(ethers.parseEther("7"));
    });
    it("Should update the balance of the contract", async function () {
      const { bfaToken, saveErc20, accountOne } = await loadFixture(deployERC20TokenFixture);
      await bfaToken.connect(accountOne).approve(saveErc20.getAddress(), ethers.parseEther("5"));
      await saveErc20.connect(accountOne).deposit(ethers.parseEther("5"));
      await saveErc20.connect(accountOne).withdraw(ethers.parseEther("3"));

      await expect((await saveErc20.checkContractBalance()).toString()).to.equal(ethers.parseEther("2").toString());
    });
  });
});

