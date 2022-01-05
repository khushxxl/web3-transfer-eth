/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'

import { contractABI, contractAddress } from '../utils/constants'

export const TransactionContext = React.createContext()

const { ethereum } = window

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer,
  )
  return transactionContract
}

export const TransactionProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState('')

  const [isLoading, setisLoading] = useState(false)
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem('transactionCount'),
  )

  const [transactions, setTransactions] = useState([])

  const [formData, setFormData] = useState({
    addressTo: '',
    amount: '',
    keyword: '',
    message: '',
  })

  const handleChange = (e, name) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }))
  }

  const getAllTransactions = async () => {
    try {
      if (!ethereum) return alert('Please install MetaMask.')
      const transactionContract = await getEthereumContract()
      const availabeTransactions = await transactionContract.getAllTransactions()

      const structuredTransactions = availabeTransactions.map(
        (transaction) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(
            transaction.timestamp.toNumber() * 1000,
          ).toLocaleString(),

          message: transaction.message,
          keyword: transaction.keyword,
          amoount: parseInt(transaction.amount._hex) / 10 ** 18,
        }),
      )

      setTransactions(structuredTransactions)

      console.log(transactions)
    } catch (error) {
      console.log(error)
    }
  }

  const checkIfWalletisConnected = async () => {
    if (!ethereum) return alert('Please install Metamask')

    const accounts = await ethereum.request({ method: 'eth_accounts' })

    try {
      if (accounts.length) {
        setCurrentAccount(accounts[0])
        getAllTransactions()
      } else {
        console.log('No Accounts Detected')
      }
    } catch (error) {
      console.log(error)
    }

    console.log(accounts)
  }

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert('Please install MetaMask.')
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      setCurrentAccount(accounts[0])
      console.log(currentAccount)
    } catch (error) {
      console.log(error)

      throw new Error('No ethereum object')
    }
  }

  const checkIfTransactionExists = async () => {
    try {
      const transactionContract = await getEthereumContract()
      const transactionCount = await transactionContract.getTransactionCount()

      window.localStorage.setItem('transactionCount', transactionCount)
    } catch (error) {
      console.log(error)

      throw new Error('No ethereum object')
    }
  }

  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert('Please install MetaMask.')

      const { addressTo, amount, keyword, message } = formData
      console.log(formData)

      const transactionContract = await getEthereumContract()

      const parsedAmount = ethers.utils.parseEther(amount)

      await ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: '0x5208',
            value: parsedAmount._hex,
          },
        ],
      })
      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        parsedAmount,
        message,
        keyword,
      )

      setisLoading(true)
      console.log(`Loading to : ${transactionHash.hash}`)
      await transactionHash.wait()
      setisLoading(false)
      console.log(`Successfully added  to : ${transactionHash.hash}`)

      const transactionCount = await transactionContract.getTransactionCount()

      setTransactionCount(transactionCount.toNumber())

      window.reload()

      //send
    } catch (error) {
      console.log(error)

      throw new Error('No ethereum object')
    }
  }

  useEffect(() => {
    checkIfWalletisConnected()
    checkIfTransactionExists()
  }, [])
  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        formData,
        setFormData,
        handleChange,
        sendTransaction,
        transactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}
