import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchBookings, fetchInvoice, cancelBooking, payBooking, submitFeedback } from '../../redux/bookingSlice';
import Loading from '../../components/Loading';
import { FaDownload } from 'react-icons/fa';
import { openRazorpayCheckout } from '../../utils/razorpay';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default function MyBookings() {
  const dispatch = useDispatch();
  const { bookings, loading } = useSelector((s) => s.bookings);
  const [downloadingId, setDownloadingId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [feedback, setFeedback] = useState({});

  useEffect(() => { dispatch(fetchBookings()); }, [dispatch]);

  const downloadInvoice = async (id) => {
    setDownloadingId(id);
    const result = await dispatch(fetchInvoice(id));
    if (fetchInvoice.fulfilled.match(result)) {
      const invoice = result.payload;
      const vehicleName = `${invoice.vehicle?.brand || ''} ${invoice.vehicle?.model || ''}`.trim();
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(invoice.invoiceNo)}</title><style>body{font-family:Arial,sans-serif;max-width:760px;margin:40px auto;color:#172033}h1{color:#d97706}.row{display:flex;justify-content:space-between;border-bottom:1px solid #ddd;padding:10px 0}.total{font-size:20px;font-weight:bold}</style></head><body><h1>AutoVexa</h1><h2>Booking Invoice</h2><div class="row"><strong>Invoice</strong><span>${escapeHtml(invoice.invoiceNo)}</span></div><div class="row"><strong>Booking date</strong><span>${escapeHtml(invoice.date)}</span></div><div class="row"><strong>Customer</strong><span>${escapeHtml(invoice.customer?.name)}</span></div><div class="row"><strong>Vehicle</strong><span>${escapeHtml(vehicleName)}</span></div><div class="row"><strong>Vendor</strong><span>${escapeHtml(invoice.vendor?.businessName || invoice.vendor?.name)}</span></div><div class="row"><span>Vehicle amount</span><span>₹${Number(invoice.vehicleAmount || 0).toLocaleString('en-IN')}</span></div><div class="row"><span>Booking fee</span><span>₹${Number(invoice.bookingFee || 0).toLocaleString('en-IN')}</span></div><div class="row"><span>Tax</span><span>₹${Number(invoice.tax || 0).toLocaleString('en-IN')}</span></div><div class="row total"><span>Total</span><span>₹${Number(invoice.total || 0).toLocaleString('en-IN')}</span></div><p>Status: ${escapeHtml(invoice.status)}</p></body></html>`;
      const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoice.invoiceNo || `invoice-${id}`}.html`;
      link.click();
      URL.revokeObjectURL(url);
    }
    setDownloadingId(null);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setBusyId(id);
    await dispatch(cancelBooking(id));
    setBusyId(null);
  };

  const handlePayment = async (id) => {
    setBusyId(id);
    const result = await dispatch(payBooking({ id }));
    if (payBooking.fulfilled.match(result) && result.payload.paymentOrder) {
      await openRazorpayCheckout({
        paymentOrder: result.payload.paymentOrder,
        booking: result.payload,
        onSuccess: async (response) => {
          await dispatch(payBooking({
            id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          }));
          setBusyId(null);
        },
        onFailure: () => setBusyId(null),
      });
    } else {
      setBusyId(null);
    }
  };

  const handleFeedback = async (id) => {
    const entry = feedback[id] || {};
    if (!entry.rating || !entry.comment?.trim()) return;
    setBusyId(id);
    const result = await dispatch(submitFeedback({ id, rating: Number(entry.rating), comment: entry.comment }));
    if (submitFeedback.fulfilled.match(result)) {
      setFeedback((current) => ({ ...current, [id]: { ...entry, submitted: true } }));
    }
    setBusyId(null);
  };

  const statusClass = { Pending: 'bg-yellow-100 text-yellow-800', Confirmed: 'bg-blue-100 text-blue-800', Cancelled: 'bg-red-100 text-red-800', Completed: 'bg-purple-100 text-purple-800' };

  if (loading) return <Loading />;

  return (
    <div className="page-container max-w-5xl py-10 md:py-14 animate-fade-up">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
      {bookings.length === 0 ? (
        <div className="text-center py-16"><p className="text-slate-500">No bookings yet.</p><Link to="/vehicles" className="btn-primary mt-4 inline-block">Browse Vehicles</Link></div>
      ) : (
        <div className="space-y-5">
          {bookings.map((b) => (
            <div key={b.id} className="card-static p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div>
                <p className="font-bold">{b.vehicle?.brand} {b.vehicle?.model}</p>
                <p className="text-sm text-slate-500">Booking ID: {b.id} · {b.bookingDate}</p>
                <p className="text-sm">Vendor: {b.vendor?.businessName || b.vendor?.name}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`status-badge ${statusClass[b.status] || ''}`}>{b.status}</span>
                <p className="font-bold">₹{b.amount?.toLocaleString('en-IN')}</p>
                <Link to={`/user/bookings/${b.id}`} className="btn-outline text-sm py-1.5 px-3">View</Link>
                <button
                  type="button"
                  onClick={() => downloadInvoice(b.id)}
                  disabled={downloadingId === b.id}
                  className="btn-outline text-sm py-1.5 px-3 inline-flex items-center gap-2"
                  title="Download invoice"
                >
                  <FaDownload /> {downloadingId === b.id ? 'Preparing...' : 'Invoice'}
                </button>
                {['Pending', 'Confirmed'].includes(b.status) && (
                  <button
                    type="button"
                    onClick={() => handleCancel(b.id)}
                    disabled={busyId === b.id}
                    className="text-sm font-semibold text-red-600 hover:text-red-700"
                  >
                    Cancel booking
                  </button>
                )}
              </div>
              {b.paymentStatus !== 'Paid' && b.status !== 'Cancelled' && (
                <div className="w-full border-t border-slate-100 pt-4 flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-semibold text-amber-700">Payment pending</span>
                  <button type="button" onClick={() => handlePayment(b.id)} disabled={busyId === b.id} className="btn-primary min-h-10! py-2!">
                    {busyId === b.id ? 'Opening Razorpay...' : 'Pay securely'}
                  </button>
                </div>
              )}
              {b.status === 'Completed' && !b.feedback && !feedback[b.id]?.submitted && (
                <div className="w-full border-t border-slate-100 pt-4 space-y-3">
                  <p className="font-semibold text-slate-800">How was your experience?</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      className="input-field w-auto! py-2!"
                      value={feedback[b.id]?.rating || ''}
                      onChange={(e) => setFeedback((current) => ({ ...current, [b.id]: { ...current[b.id], rating: e.target.value } }))}
                    >
                      <option value="">Rating</option>
                      {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}
                    </select>
                    <input
                      className="input-field flex-1 min-w-55 py-2!"
                      placeholder="Share your experience"
                      value={feedback[b.id]?.comment || ''}
                      onChange={(e) => setFeedback((current) => ({ ...current, [b.id]: { ...current[b.id], comment: e.target.value } }))}
                    />
                    <button type="button" onClick={() => handleFeedback(b.id)} disabled={busyId === b.id} className="btn-primary min-h-10! py-2!">
                      Send feedback
                    </button>
                  </div>
                </div>
              )}
              {b.feedback && <p className="w-full border-t border-slate-100 pt-3 text-sm text-slate-600">Your feedback: {b.feedback.rating}/5 - {b.feedback.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
