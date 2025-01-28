


import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "./abi.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS ;
//const contractAddress = "0x8802Ab90dF807bC18BBc007B953aC9150E88F51f";

const App = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const showSuccess = (message) => toast.success(message);

  const showError = (message) => toast.error(message);

  async function requestAccounts() {
    if (!window.ethereum) {
      showError("MetaMask is required to use this app.");
      return;
    }
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);
  }

  function getContract(signerOrProvider) {
    return new ethers.Contract(contractAddress, abi, signerOrProvider);
  }

  async function checkWalletConnection() {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        fetchBalance();
      }
    }
  }

  async function fetchBalance() {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = getContract(provider);

    const contractBalance = await contract.getBalance();
    setBalance(ethers.formatEther(contractBalance));
  }

  async function deposit() {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);

      const tx = await contract.deposit(ethers.parseEther(depositAmount), { value: ethers.parseEther(depositAmount) });
      await tx.wait();
      setDepositAmount("");
      fetchBalance();
      showSuccess("Deposit successful!");
    } catch (error) {
      showError("Deposit failed.");
    }
  }

  async function withdraw() {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);

      const tx = await contract.withdraw(ethers.parseEther(withdrawAmount));
      await tx.wait();
      setWithdrawAmount("");
      fetchBalance();
      showSuccess("Withdrawal successful!");
    } catch (error) {
      showError("Withdrawal failed.");
    }
    console.log("Contract Address:", import.meta.env.VITE_CONTRACT_ADDRESS);
    console.log(account);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Assessment DApp</h1>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <p>Connected Wallet: {account ? account : "Not Connected"}</p>
      <button onClick={requestAccounts} disabled={account}>
        {account ? "Wallet Connected" : "Connect Wallet"}
      </button>

      <h2>Balance: {balance} ETH</h2>

      <div>
        <h3>Deposit</h3>
        <input
          type="text"
          placeholder="Amount in ETH"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
        />
        <button onClick={deposit}>Deposit</button>
      </div>

      <div>
        <h3>Withdraw</h3>
        <input
          type="text"
          placeholder="Amount in ETH"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
        />
        <button onClick={withdraw}>Withdraw</button>
      </div>
    </div>
  );
};

export default App;
