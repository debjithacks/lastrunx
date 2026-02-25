'use client'

import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Trophy, Users, Clock, Zap, Target, Search, Filter, Gamepad2, Banknote, ShieldCheck, PlayCircle, ArrowRight, Wallet, CreditCard, X, Eye, CheckCircle, Loader2 } from 'lucide-react'
import ConfirmationModal from '@/components/ConfirmationModal'

interface Tournament {
  id: string
  game: string
  title: string
  description?: string
  image: string
  entryFee: string | number
  prizePool: string | number
  players: string
  currentPlayers?: number
  maxPlayers?: number
  startTime: string
  status?: string
  mode?: string
  skill?: string
  isLive?: boolean
}

export default function TournamentsPage() {
  const { data: session, update: updateSession } = useSession()
  const router = useRouter()
  const [selectedGame, setSelectedGame] = useState('all')
  const [isVisible, setIsVisible] = useState(false)
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [userWallet, setUserWallet] = useState(0)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'wallet' | 'online' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [processingMessage, setProcessingMessage] = useState('')
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', type: 'info' as 'success' | 'error' | 'warning' | 'info' })

  useEffect(() => {
    setIsVisible(true)
    fetchTournaments()
    if (session) {
      fetchUserWallet()
    }
  }, [selectedGame, session])

  const fetchTournaments = async () => {
    try {
      const res = await fetch(`/api/tournaments?game=${selectedGame}`)
      const data = await res.json()
      
      if (res.ok && data.tournaments) {
        console.log('Fetched tournaments:', data.tournaments)
        setTournaments(data.tournaments)
      } else {
        console.error('Failed to fetch tournaments:', data.error)
        setTournaments([])
      }
    } catch (error) {
      console.error('Failed to fetch tournaments:', error)
      setTournaments([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUserWallet = async () => {
    try {
      const res = await fetch('/api/user/profile')
      const data = await res.json()
      if (res.ok && data.user) {
        setUserWallet(Number(data.user.walletBalance))
      }
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error)
    }
  }

  const handleJoinNow = (tournament: Tournament) => {
    if (!session) {
      router.push('/login')
      return
    }
    setSelectedTournament(tournament)
    setShowPaymentModal(true)
  }

  const handlePaymentMethodSelect = async (method: 'wallet' | 'online') => {
    if (!selectedTournament) return
    
    setSelectedPaymentMethod(method)
    setIsProcessing(true)
    setProcessingMessage('Processing your payment...')

    try {
      if (method === 'wallet') {
        // Pay with wallet
        const res = await fetch(`/api/tournaments/${selectedTournament.id}/join`, {
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
          setConfirmModal({ isOpen: true, message: data.error || 'Unable to join tournament. Please try again.', type: 'error' })
        }
      } else {
        // Pay online with Razorpay
        const orderRes = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Number(selectedTournament.entryFee),
            tournamentId: selectedTournament.id,
            type: 'TOURNAMENT_FEE',
          }),
        })

        const orderData = await orderRes.json()

        if (!orderRes.ok) {
          setIsProcessing(false)
          setConfirmModal({ isOpen: true, message: orderData.error || 'Unable to process payment request. Please try again.', type: 'error' })
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
          description: `Entry Fee for ${selectedTournament.title}`,
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
              setConfirmModal({ isOpen: true, message: verifyData.error || 'Payment verification failed. Please contact support.', type: 'error' })
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
      console.error('Payment error:', error)
      setIsProcessing(false)
      setConfirmModal({ isOpen: true, message: 'Payment Processing Error\n\nUnable to complete your transaction. Please try again.', type: 'error' })
    } finally {
      setSelectedPaymentMethod(null)
    }
  }

  const games = ['all', 'BGMI', 'Free Fire Max', 'COD Mobile', 'Mobile Legends', 'Clash Royale']

  const filteredTournaments = selectedGame === 'all'
    ? tournaments
    : tournaments.filter(t => t.game === selectedGame)

  const formatStartTime = (startTime: string) => {
    const date = new Date(startTime)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`
    } else {
      return 'Starting soon'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 md:py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 border border-red-100 rounded-full mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Live Tournaments</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Tournament Arena
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Choose your game, prove your skill, and win real cash prize pools.
          </p>
        </div>

        {/* Filter */}
        <div className="flex justify-center mb-10 overflow-x-auto pb-4 no-scrollbar">
          <div className="inline-flex items-center p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm gap-1">
            {games.map((game) => (
              <button
                key={game}
                onClick={() => setSelectedGame(game)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${selectedGame === game
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                {game === 'all' ? 'All Games' : game}
              </button>
            ))}
          </div>
        </div>

        {/* Tournament Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Tournaments Found</h3>
              <p className="text-gray-500">Check back later for upcoming tournaments!</p>
            </div>
          ) : (
            filteredTournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-indigo-100"
            >
              {/* Image Section */}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={tournament.image || '/images/games/bgmi.avif'}
                  alt={tournament.game}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="px-2.5 py-1 bg-white/20 backdrop-blur-md border border-white/10 rounded-lg text-xs font-medium text-white flex items-center gap-1.5">
                    <Gamepad2 className="w-3.5 h-3.5" />
                    {tournament.game}
                  </div>
                  {tournament.status === 'LIVE' && (
                    <div className="px-2.5 py-1 bg-red-500/90 backdrop-blur-md border border-white/10 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 animate-pulse">
                      LIVE
                    </div>
                  )}
                </div>

                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-300">
                    <ShieldCheck className="w-4 h-4" />
                    100% Skill
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-900 mb-5 group-hover:text-indigo-600 transition-colors">
                  {tournament.title}
                </h3>

                <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-6">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                      <Banknote className="w-3.5 h-3.5" />
                      Entry Fee
                    </p>
                    <p className="text-sm font-bold text-slate-900">₹{tournament.entryFee}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      Prize Pool
                    </p>
                    <p className="text-sm font-bold text-emerald-600">₹{tournament.prizePool}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      Players
                    </p>
                    <p className="text-sm font-bold text-slate-900">{tournament.players}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Starts In
                    </p>
                    <p className="text-sm font-bold text-indigo-600">{formatStartTime(tournament.startTime)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link href={`/tournaments/${tournament.id}`} className="w-full">
                    <button className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 hover:border-indigo-300 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>Details</span>
                    </button>
                  </Link>
                  <button
                    onClick={() => handleJoinNow(tournament)}
                    className="w-full py-3 px-4 bg-slate-900 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:translate-y-[-2px]"
                  >
                    <span>Join Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
          )}
        </div>
      </div>

      {/* Razorpay Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

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
              You have successfully joined <span className="font-semibold text-indigo-600">{selectedTournament?.title}</span>
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

      {/* Payment Modal */}
      {showPaymentModal && selectedTournament && !isProcessing && !showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Select Payment Method</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Tournament Info */}
            <div className="mb-6 p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-600 mb-1">Tournament Entry Fee</p>
              <p className="text-3xl font-bold text-indigo-600">₹{selectedTournament.entryFee}</p>
              <p className="text-sm text-slate-500 mt-1">{selectedTournament.title}</p>
            </div>

            {/* Payment Options */}
            <div className="space-y-3">
              {/* Wallet Payment */}
              <button
                onClick={() => handlePaymentMethodSelect('wallet')}
                disabled={userWallet < Number(selectedTournament.entryFee) || selectedPaymentMethod !== null}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                  userWallet < Number(selectedTournament.entryFee)
                    ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-60'
                    : 'bg-white border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <Wallet className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">Pay with Wallet</p>
                      <p className={`text-sm ${
                        userWallet < Number(selectedTournament.entryFee)
                          ? 'text-red-500'
                          : 'text-emerald-600'
                      }`}>
                        Balance: ₹{userWallet.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {userWallet < Number(selectedTournament.entryFee) && (
                    <span className="text-xs text-red-500 font-medium">Insufficient</span>
                  )}
                </div>
              </button>

              {/* Online Payment */}
              <button
                onClick={() => handlePaymentMethodSelect('online')}
                disabled={selectedPaymentMethod !== null}
                className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-500 bg-white hover:bg-indigo-50 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <CreditCard className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900">Pay Online</p>
                    <p className="text-sm text-slate-500">UPI, Cards, Net Banking</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Processing State */}
            {selectedPaymentMethod && (
              <div className="mt-4 text-center text-sm text-slate-500">
                Processing payment...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  )
}
