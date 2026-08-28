import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchBookings, fetchInvoice } from '../../redux/bookingSlice';
import Loading from '../../components/Loading';
import { FaDownload } from 'react-icons/fa';

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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
