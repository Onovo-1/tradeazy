import { useState, useEffect, useCallback } from "react";
import { formatNaira } from "../../utils/formatters";
import { subscriptionApi } from "../../api/subscriptionApi"; // <-- We need to create this
import { useAuth } from "../../context/AuthContext";

export default function Rent() {
  const { user } = useAuth();
  const [paying, setPaying] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // Real state from backend
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [history, setHistory] = useState([]);

  const plans = [
    { name: "MONTHLY", displayName: "Monthly", price: 5000, days: "30", badge: "BASIC" },
    { name: "QUARTERLY", displayName: "Quarterly", price: 13500, days: "90", badge: "SAVE 10%" },
    { name: "YEARLY", displayName: "Yearly", price: 50000, days: "365", badge: "BEST VALUE" },
  ];

  // 1. Load real data from backend
  const loadSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [current, hist] = await Promise.all([
        subscriptionApi.getCurrent().catch(() => null),
        subscriptionApi.history().catch(() => ({ content: [] })),
      ]);
      setActiveSubscription(current);
      setHistory(hist.content || []);
    } catch (err) {
      setError("Failed to load subscription info.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  // 2. Format helpers
  const formatDate = (isoString) => {
    if (!isoString) return "—";
    const d = new Date(isoString);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.slice(0, 16);
    value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(value);
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); 
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 1) {
      let month = parseInt(value.slice(0, 2));
      if (value.length === 1 && parseInt(value[0]) > 1) value = "0" + value;
      else if (value.length >= 2 && month > 12) value = "12" + value.slice(2);
    }
    if (value.length > 2) value = value.slice(0, 2) + "/" + value.slice(2);
    setExpiry(value);
  };

  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    setCvv(value.slice(0, 4));
  };

  // 3. Pay handler - Talks to Backend
  const handlePayClick = (plan) => {
    if (activeSubscription) {
      alert("You already have an active subscription.");
      return;
    }
    setSelectedPlan(plan);
    setModalOpen(true);
    setPaymentSuccess(false);
    setCardNumber("");
    setExpiry("");
    setCvv("");
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;
    
    setPaying(true);
    setError(null);
    try {
      await subscriptionApi.renew(selectedPlan.name);
      setPaymentSuccess(true);
      
      // Reload data from backend to reflect the real new status
      await loadSubscription();
      
      setTimeout(() => {
        setModalOpen(false);
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  // 4. Validation
  const isCardComplete = cardNumber.replace(/\s/g, "").length === 16;
  const isCvvComplete = cvv.length >= 3;
  
  let isExpiryValid = false;
  let expiryErrorMsg = "";
  if (expiry.length === 5) {
    const month = parseInt(expiry.slice(0, 2));
    const year = parseInt(expiry.slice(3, 5));
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth) || month === 0) {
      isExpiryValid = false;
      expiryErrorMsg = "Card has expired";
    } else {
      isExpiryValid = true;
    }
  }

  const isFormValid = isCardComplete && isExpiryValid && isCvvComplete;

  if (loading) return <div className="p-8 text-center text-gray-500">Loading subscription…</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rent Subscription</h1>
        <p className="text-gray-500 text-sm mt-1">Your monthly fee to list products on Tradeazy.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {/* Current Subscription Banner */}
      <div className={`border rounded-xl p-5 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center ${
        activeSubscription 
          ? "bg-green-50 border-green-200" 
          : "bg-red-50 border-red-200"
      }`}>
        <div>
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-1 ${
            activeSubscription ? "text-green-800" : "text-red-800"
          }`}>Current Subscription</h3>
          
          {activeSubscription ? (
            <>
              <p className="text-xl font-extrabold text-green-900">
                {activeSubscription.plan} — ACTIVE
              </p>
              <p className="text-sm text-green-700 mt-1">
                Expiry date: {formatDate(activeSubscription.expiryDate)}
              </p>
            </>
          ) : (
            <p className="text-xl font-extrabold text-red-900">No Active Subscription</p>
          )}
        </div>
        
        {activeSubscription && (
          <div className="mt-4 md:mt-0 text-right">
            <p className="text-xs text-green-700 font-medium">Expires in</p>
            <p className="text-3xl font-extrabold text-green-700">{activeSubscription.daysRemaining} days</p>
          </div>
        )}
      </div>

      {/* Plans Grid */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Choose a plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {plans.map((plan) => (
          <div key={plan.name} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
            <p className="text-xs font-bold text-maroon-700 uppercase tracking-wider mb-2">{plan.badge}</p>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.displayName}</h3>
            <p className="text-3xl font-extrabold text-maroon-900 mb-1">₦{plan.price.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mb-6">for {plan.days} days</p>
            
            <button
              onClick={() => handlePayClick(plan)}
              disabled={!!activeSubscription}
              className={`mt-auto w-full font-bold py-2.5 rounded-lg transition ${
                activeSubscription
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-maroon-700 hover:bg-maroon-800 text-white"
              }`}
            >
              {activeSubscription ? "Active Plan" : "Pay Rent"}
            </button>
          </div>
        ))}
      </div>

      {/* Payment History Table */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Payment history</h2>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">Plan</th>
              <th className="px-6 py-4 font-semibold">Amount</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Start</th>
              <th className="px-6 py-4 font-semibold">Expiry</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {history.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No payment history yet.</td>
              </tr>
            ) : (
              history.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{record.plan}</td>
                  <td className="px-6 py-4 font-bold text-maroon-800">₦{record.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      record.status === "ACTIVE" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(record.startDate)}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(record.expiryDate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {modalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="bg-maroon-900 text-white px-6 py-5 relative">
              <h2 className="font-bold text-xl">Pay for Rent</h2>
              <p className="text-maroon-200 text-sm mt-1 uppercase">
                {selectedPlan.displayName} — {formatNaira(selectedPlan.price)}
              </p>
              <button 
                onClick={() => setModalOpen(false)}
                disabled={paying || paymentSuccess}
                className="absolute top-5 right-5 text-white/70 hover:text-white transition disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {paymentSuccess ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                  <p className="text-gray-500">Your {selectedPlan.displayName} plan is now active.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Card number</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="XXXX XXXX XXXX XXXX"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-maroon-500 placeholder-gray-400"
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Expiry</label>
                      <input
                        type="text"
                        required
                        value={expiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        className={`w-full px-4 py-3 border rounded-lg text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-maroon-500 placeholder-gray-400 ${
                          expiryErrorMsg ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                        }`}
                      />
                      {expiryErrorMsg && <p className="text-xs text-red-500 mt-1">{expiryErrorMsg}</p>}
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">CVV</label>
                      <input
                        type="text"
                        required
                        value={cvv}
                        onChange={handleCvvChange}
                        placeholder="123"
                        maxLength="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-maroon-500 placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={paying || !isFormValid}
                    className="w-full mt-6 bg-maroon-800 hover:bg-maroon-900 text-white font-bold py-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                  >
                    {paying ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      `Pay ${formatNaira(selectedPlan.price)}`
                    )}
                  </button>
                  
                  <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Secured by TradeazyPay. No real money is charged.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}