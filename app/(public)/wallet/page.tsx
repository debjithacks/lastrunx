'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Script from 'next/script'
import Link from 'next/link'
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, History, 
  CreditCard, Plus, Loader2, CheckCircle, XCircle, X,
  TrendingUp, Calendar
} from 'lucide-react'

interface Transaction {
  id: string
  type: string
  amount: string
  status: string
  description: string
  createdAt: string
}

export default function WalletPage() {
  const { data: session, status, update: updateSession } = useSession()
  const router = useRouter()
  const [balance, setBalance] = useState('0')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddMoney, setShowAddMoney] = useState(false)
  const [amount, setAmount] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchWalletData()
    }
  }, [status, router])

  const fetchWalletData = async () => {
    try {
      const [profileRes, transactionsRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/transactions')
      ])

      const profileData = await profileRes.json()
      const transactionsData = await transactionsRes.json()

      if (profileRes.ok && profileData.user) {
        setBalance(profileData.user.walletBalance)
      }

      if (transactionsRes.ok && transactionsData.transactions) {
        setTransactions(transactionsData.transactions)
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMoney = async () => {
    const amountNum = parseFloat(amount)
    if (!amountNum || amountNum < 100) {
      alert('Minimum amount is ₹100')
      return
    }

    setProcessing(true)

    try {
      // Create Razorpay order
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountNum,
          type: 'DEPOSIT',
        }),
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        alert('Error: ' + (orderData.error || 'Unable to process request'))
        setProcessing(false)
        return
      }

      setProcessing(false)

      // Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LastRunX',
        description: 'Add money to wallet',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Verify payment
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })

          const verifyData = await verifyRes.json()

          if (verifyRes.ok) {
            // Update session
            await updateSession()
            setShowAddMoney(false)
            setAmount('')
            fetchWalletData()
            alert('✅ Money added successfully!')
          } else {
            alert('❌ Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: session?.user?.username || '',
          email: session?.user?.email || '',
        },
        theme: {
          color: '#4F46E5',
        },
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Payment error:', error)
      setProcessing(false)
      alert('❌ Error processing payment. Please try again.')
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
      case 'REFUND':
      case 'PRIZE_PAYOUT':
        return <ArrowDownLeft className="w-5 h-5 text-green-600" />
      case 'WITHDRAWAL':
      case 'TOURNAMENT_FEE':
        return <ArrowUpRight className="w-5 h-5 text-red-600" />
      default:
        return <History className="w-5 h-5 text-slate-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      SUCCESS: 'bg-green-50 text-green-700 border-green-100',
      PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-100',
      FAILED: 'bg-red-50 text-red-700 border-red-100',
    }
    return styles[status as keyof typeof styles] || styles.PENDING
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-slate-500 font-medium">Loading wallet...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Wallet className="w-6 h-6 text-indigo-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Wallet</h1>
            </div>
            <p className="text-slate-500">Manage your funds and transactions</p>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-8 mb-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <Wallet className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <p className="text-indigo-200 text-sm font-medium mb-2">Available Balance</p>
              <p className="text-5xl font-bold mb-6">₹{parseFloat(balance).toFixed(2)}</p>
              <button
                onClick={() => setShowAddMoney(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Money
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-500 font-medium">Total Deposits</p>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                ₹{transactions.filter(t => t.type === 'DEPOSIT' && t.status === 'SUCCESS')
                  .reduce((acc, t) => acc + parseFloat(t.amount), 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-500 font-medium">Total Spent</p>
                <ArrowUpRight className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                ₹{transactions.filter(t => t.type === 'TOURNAMENT_FEE' && t.status === 'SUCCESS')
                  .reduce((acc, t) => acc + parseFloat(t.amount), 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-500 font-medium">Transactions</p>
                <History className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{transactions.length}</p>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5" />
                Transaction History
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <div className="p-12 text-center">
                  <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No transactions yet</p>
                  <p className="text-sm text-slate-400 mt-1">Your transaction history will appear here</p>
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-50 rounded-xl">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{transaction.description}</p>
                          <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(transaction.createdAt).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          ['DEPOSIT', 'REFUND', 'PRIZE_PAYOUT'].includes(transaction.type) 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {['DEPOSIT', 'REFUND', 'PRIZE_PAYOUT'].includes(transaction.type) ? '+' : '-'}
                          ₹{parseFloat(transaction.amount).toFixed(2)}
                        </p>
                        <span className={`inline-block text-xs px-2 py-1 rounded-full border mt-1 ${getStatusBadge(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Add Money Modal */}
        {showAddMoney && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-zoom-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-6 h-6 text-indigo-600" />
                  Add Money
                </h3>
                <button
                  onClick={() => setShowAddMoney(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Amount (Minimum ₹100)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg font-semibold"
                  min="100"
                />
              </div>

              {/* Quick amounts */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {[100, 500, 1000, 5000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt.toString())}
                    className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors text-sm font-semibold"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <button
                onClick={handleAddMoney}
                disabled={processing}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Add Money
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
