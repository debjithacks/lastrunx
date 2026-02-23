'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Script from 'next/script'
import { 
  Trophy, Users, Clock, Banknote, ShieldCheck, 
  ArrowLeft, Gamepad2, Calendar, MapPin, Award, Wallet,
  Smartphone, CreditCard, X, CheckCircle, Loader2
} from 'lucide-react'

export default function TournamentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, update: updateSession } = useSession()
  const [tournament, setTournament] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [userWallet, setUserWallet] = useState(0)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'wallet' | 'online' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [processingMessage, setProcessingMessage] = useState('')

  useEffect(() => {
    fetchTournament()
    if (session) {
      fetchUserWallet()
    }
  }, [params.id, session])

  const fetchUserWallet = async () => {
    try {
      const res = await fetch('/api/user/profile')
      const data = await res.json()
      if (res.ok && data.user) {
        setUserWallet(Number(data.user.walletBalance))
      }
    } catch (error) {
      console.error('Failed to fetch wallet:', error)
    }
  }

  const fetchTournament = async () => {
    try {
      const res = await fetch(`/api/tournaments/${params.id}`)
      const data = await res.json()

      if (res.ok && data.tournament) {
        // Transform the data to match our display needs
        const t = data.tournament
        const currentPlayers = t._count?.registrations || 0
        setTournament({
          ...t,
          players: `${currentPlayers}/${t.maxPlayers}`,
          currentPlayers: currentPlayers,
        })
      } else {
        console.error('Tournament not found')
      }
    } catch (error) {
      console.error('Failed to fetch tournament:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinTournament = () => {
    if (!session) {
      router.push('/login')
      return
    }
    setShowPaymentModal(true)
  }

  const handlePaymentMethodSelect = async (method: 'wallet' | 'online') => {
    setSelectedPaymentMethod(method)
    setJoining(true)
    setIsProcessing(true)
    setProcessingMessage('Processing your payment...')

    try {
      if (method === 'wallet') {
        // Pay with wallet
        const res = await fetch(`/api/tournaments/${params.id}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentMethod: 'wallet' }),
        })

        const data = await res.json()

        if (res.ok) {
          // Update session to reflect new wallet balance
          await updateSession()
          
          setIsProcessing(false)
          setShowSuccess(true)
          setShowPaymentModal(false)
          
          // Auto redirect after 2 seconds
          setTimeout(() => {
            router.push('/my-tournaments')
          }, 2000)
        } else {
          setIsProcessing(false)
          alert('❌ ' + (data.error || 'Unable to join tournament. Please try again.'))
        }
      } else {
        // Pay online with Razorpay
        const orderRes = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Number(tournament.entryFee),
            tournamentId: params.id,
            type: 'TOURNAMENT_FEE',
          }),
        })

        const orderData = await orderRes.json()

        if (!orderRes.ok) {
          setIsProcessing(false)
          alert('❌ ' + (orderData.error || 'Unable to process payment request. Please try again.'))
          setSelectedPaymentMethod(null)
          return
        }
        
        setIsProcessing(false)

        // Initialize Razorpay
        const options = {
          key: orderData.key,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'LastRunX',
          description: `Entry Fee for ${tournament.title}`,
          order_id: orderData.orderId,
          handler: async function (response: any) {
            // Verify payment and join tournament
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                tournamentId: params.id,
              }),
            })

            const verifyData = await verifyRes.json()

            if (verifyRes.ok) {
              // Update session
              await updateSession()
              
              setShowSuccess(true)
              setShowPaymentModal(false)
              
              // Auto redirect after 2 seconds
              setTimeout(() => {
                router.push('/my-tournaments')
              }, 2000)
            } else {
              alert('❌ ' + (verifyData.error || 'Payment verification failed. Please contact support.'))
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
      }
    } catch (error) {
      setIsProcessing(false)
      alert('❌ Payment Processing Error\n\nUnable to complete your transaction. Please try again.')
    } finally {
      setJoining(false)
      setSelectedPaymentMethod(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Tournament Not Found</h1>
          <Link href="/tournaments" className="text-indigo-600 hover:underline">
            Back to Tournaments
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link 
          href="/tournaments"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Tournaments</span>
        </Link>

        {/* Tournament Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="relative h-64 bg-gradient-to-br from-indigo-500 to-purple-600">
            {tournament.image && (
              <img 
                src={tournament.image} 
                alt={tournament.title}
                className="w-full h-full object-cover opacity-40"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-4xl font-bold mb-2">{tournament.title}</h1>
                <p className="text-xl">{tournament.game}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Tournament Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-gray-500 mb-2">
                  <Banknote className="w-5 h-5" />
                  <span className="text-sm font-medium">Entry Fee</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">₹{tournament.entryFee}</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-gray-500 mb-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-medium">Prize Pool</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600">₹{tournament.prizePool}</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-gray-500 mb-2">
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium">Players</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{tournament.players}</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-gray-500 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium">Starts In</span>
                </div>
                <p className="text-2xl font-bold text-indigo-600">
                  {new Date(tournament.startTime).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Description */}
            {tournament.description && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3">About Tournament</h2>
                <p className="text-gray-600">{tournament.description}</p>
              </div>
            )}

            {/* Tournament Details */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Gamepad2 className="w-6 h-6 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Mode</p>
                  <p className="font-semibold">{tournament.mode}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Tournament Type</p>
                  <p className="font-semibold">100% Skill Based</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-semibold">
                    {new Date(tournament.startTime).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Award className="w-6 h-6 text-amber-600" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold capitalize">{tournament.status}</p>
                </div>
              </div>
            </div>

            {/* Join Button */}
            <button
              onClick={handleJoinTournament}
              disabled={joining || tournament.currentPlayers >= tournament.maxPlayers}
              className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-lg font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {joining ? 'Joining...' : tournament.currentPlayers >= tournament.maxPlayers ? 'Tournament Full' : `Join Tournament - ₹${tournament.entryFee}`}
            </button>

            {!session && (
              <p className="text-center text-sm text-gray-500 mt-4">
                Please{' '}
                <Link href="/login" className="text-indigo-600 hover:underline">
                  login
                </Link>
                {' '}to join this tournament
              </p>
            )}
          </div>
        </div>

        {/* Payment Method Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Choose Payment Method</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tournament Info */}
              <div className="bg-indigo-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Tournament Entry Fee</p>
                <p className="text-3xl font-bold text-indigo-600">₹{tournament?.entryFee}</p>
              </div>

              {/* Payment Options */}
              <div className="space-y-3">
                {/* Wallet Payment */}
                <button
                  onClick={() => handlePaymentMethodSelect('wallet')}
                  disabled={joining || userWallet < Number(tournament?.entryFee)}
                  className="w-full p-4 border-2 border-gray-200 hover:border-indigo-500 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 group-hover:bg-indigo-200 rounded-lg flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900">Pay with Wallet</p>
                      <p className="text-sm text-gray-600">
                        Balance: ₹{userWallet.toFixed(2)}
                      </p>
                    </div>
                    {userWallet < Number(tournament?.entryFee) && (
                      <span className="text-xs text-red-500 font-medium">Insufficient Balance</span>
                    )}
                  </div>
                </button>

                {/* Online Payment */}
                <button
                  onClick={() => handlePaymentMethodSelect('online')}
                  disabled={joining}
                  className="w-full p-4 border-2 border-gray-200 hover:border-indigo-500 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900">Pay Online</p>
                      <p className="text-sm text-gray-600">UPI, Cards, Net Banking</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Loading State */}
              {joining && (
                <div className="mt-6 flex items-center justify-center gap-2 text-indigo-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                  <span className="text-sm font-medium">Processing payment...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Processing Modal */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
              <div className="mb-6">
                <Loader2 className="w-16 h-16 text-indigo-600 mx-auto animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Processing Payment</h3>
              <p className="text-slate-600">{processingMessage}</p>
              <div className="mt-6 flex justify-center gap-2">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="mb-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-12 h-12 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Registration Successful! 🎉</h3>
              <p className="text-slate-600 mb-6">
                You have successfully joined <span className="font-semibold text-indigo-600">{tournament?.title}</span>
              </p>
              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-slate-600 mb-2">What's Next?</p>
                <ul className="text-left text-sm text-slate-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-0.5">✓</span>
                    <span>Check your email for tournament details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-0.5">✓</span>
                    <span>View your tournaments in "My Tournaments"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-0.5">✓</span>
                    <span>Get ready and good luck!</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm text-slate-500">Redirecting to My Tournaments...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
