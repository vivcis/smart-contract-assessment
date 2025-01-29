import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "./abi.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css"; 

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

const App = () => {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState(null);
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
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts[0]) {
        setAccount(accounts[0].toString());
        fetchBalance();
        showSuccess("Wallet connected successfully!");
      }
    } catch (error) {
      showError("Failed to connect wallet.");
    }
  }

  function disconnectWallet() {
    setAccount("");
    setBalance(null);
    showSuccess("Wallet disconnected.");
  }

  function getContract(signerOrProvider) {
    return new ethers.Contract(contractAddress, abi, signerOrProvider);
  }

  async function checkWalletConnection() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();

        if (accounts.length > 0) {
          setAccount(accounts[0]); 
          fetchBalance();
        } else {
          setAccount("");
          setBalance(null);
        }
      } catch (error) {
        showError("Failed to check wallet connection.");
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

  async function deposit(event) {
    event.preventDefault();

    if (!depositAmount || isNaN(depositAmount) || Number(depositAmount) <= 0) {
      showError("Enter a valid deposit amount.");
      return;
    }

    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);

      const tx = await contract.deposit(ethers.parseEther(depositAmount));
      await tx.wait();
      setDepositAmount("");
      fetchBalance();
      showSuccess("Deposit successful!");
    } catch (error) {
      showError("Deposit failed.");
    }
  }

  async function withdraw(event) {
    event.preventDefault();

    if (!withdrawAmount || isNaN(withdrawAmount) || Number(withdrawAmount) <= 0) {
      showError("Enter a valid withdrawal amount.");
      return;
    }

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
  }

  return (
    <div className="app-container">
     <h1 className="app-title">Ether-Bank</h1>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

     <p className="wallet-info">
      Connected Wallet: {typeof account === "string" && account ? account : "Not Connected"}</p>

      {account ? (
        <button className="btn disconnect-btn" onClick={disconnectWallet}>
          Disconnect Wallet
        </button>
      ) : (
        <button className="btn connect-btn" onClick={requestAccounts}>
          Connect Wallet
        </button>
      )}

      <h2 className="balance">Balance: {balance} ETH</h2>

      <form className="form" onSubmit={deposit}>
        <h3 className="form-title">Deposit</h3>
        <input
          className="input-field"
          type="text"
          placeholder="Amount in ETH"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
        />
        <button className="btn submit-btn" type="submit">Deposit</button>
      </form>

      <form className="form" onSubmit={withdraw}>
        <h3 className="form-title">Withdraw</h3>
        <input
          className="input-field"
          type="text"
          placeholder="Amount in ETH"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
        />
        <button className="btn submit-btn" type="submit">Withdraw</button>
      </form>
    </div>
  );
};

export default App;
