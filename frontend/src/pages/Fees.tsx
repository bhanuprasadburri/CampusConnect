import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { FeeRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Download, CheckCircle, Clock, Wallet, CircleDollarSign, CalendarDays, ShieldCheck, ArrowRight, ReceiptText, Landmark, Smartphone, BadgeIndianRupee, ArrowLeft, Building2, LockKeyhole, Banknote } from 'lucide-react';

const money = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
const downloadReceipt = (fee: FeeRecord) => {
  const date = fee.paidAt ? new Date(fee.paidAt).toLocaleDateString('en-IN') : new Date(fee.dueDate).toLocaleDateString('en-IN');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Fee receipt ${fee.receiptNo || fee.id}</title><style>body{font:16px Arial,sans-serif;color:#17365f;max-width:760px;margin:40px auto;padding:32px;border:1px solid #dbe5f2;border-radius:12px}h1{font-size:25px}table{width:100%;border-collapse:collapse;margin-top:25px}td{padding:14px;border-bottom:1px solid #e7edf5}.label{color:#6c809b}.amount{font-size:22px;font-weight:bold}.note{margin-top:30px;color:#6c809b}</style></head><body><h1>CampusConnect Fee Payment Receipt</h1><p>Receipt generated from the fee record in your student account.</p><table><tr><td class="label">Receipt number</td><td>${fee.receiptNo || fee.id}</td></tr><tr><td class="label">Fee category</td><td>${fee.category}</td></tr><tr><td class="label">Payment date</td><td>${date}</td></tr><tr><td class="label">Status</td><td>PAID</td></tr><tr><td class="label">Amount</td><td class="amount">${money(Number(fee.amount))}</td></tr></table></body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `CampusConnect-Receipt-${fee.receiptNo || fee.id}.html`; anchor.click(); URL.revokeObjectURL(url);
};

export const Fees: React.FC = () => {
  const navigate = useNavigate();
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getFees().then(setFees).catch((err) => console.error('Failed to load fee records', err)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading fee structure & receipts...</div>;

  const totalFee = fees.reduce((sum, f) => sum + Number(f.amount), 0);
  const paidFee = fees.filter((f) => f.status === 'PAID').reduce((sum, f) => sum + Number(f.amount), 0);
  const outstanding = totalFee - paidFee;
  const dueFees = fees.filter((f) => f.status !== 'PAID');
  const paidFees = fees.filter((f) => f.status === 'PAID');
  const latestDue = dueFees.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  return <div className="portal-page fees-page">
    <header className="portal-hero fee-hero"><div className="portal-hero-icon"><Wallet /></div><div><span className="portal-breadcrumb">Dashboard　›　Finance</span><h1>Fee Payments</h1><p>View your fee details, make payments and track your payment history.</p></div><div className="hero-art fee-art"><ReceiptText /><span>₹</span><ShieldCheck /></div></header>
    <div className="fee-layout">
      <main className="fee-main">
        <div className="portal-stats fee-stats">
          <article className="portal-stat blue"><span className="stat-icon"><CircleDollarSign /></span><div><small>Total Fees</small><strong>{money(totalFee)}</strong><span>For current academic year</span></div></article>
          <article className="portal-stat green"><span className="stat-icon"><CheckCircle /></span><div><small>Amount Paid</small><strong>{money(paidFee)}</strong><span>{totalFee ? `${((paidFee / totalFee) * 100).toFixed(1)}% settled` : 'No payments recorded'}</span></div></article>
          <article className="portal-stat rose"><span className="stat-icon"><BadgeIndianRupee /></span><div><small>Amount Due</small><strong>{money(outstanding)}</strong><span>{dueFees.length} outstanding fee items</span></div></article>
          <article className="portal-stat violet"><span className="stat-icon"><CalendarDays /></span><div><small>Next Due Date</small><strong>{latestDue ? new Date(latestDue.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'All clear'}</strong><span>{latestDue?.category || 'No pending installment'}</span></div></article>
        </div>
        <div className="fee-middle">
          <section className="portal-card fee-breakdown"><div className="portal-section-head"><div><span className="section-icon"><ReceiptText /></span><div><h2>Current Fee Details</h2><p>Itemized view of your semester charges</p></div></div><button className="link-button" onClick={() => navigate('/fees/breakdown')}>View Breakdown <ArrowRight size={15}/></button></div>
            <div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>S. No.</th><th>Fee Head</th><th>Amount (₹)</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead><tbody>{fees.map((f, i) => <tr key={f.id}><td>{String(i + 1).padStart(2, '0')}</td><td><strong>{f.category}</strong></td><td>{money(Number(f.amount))}</td><td>{new Date(f.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td><td><span className={`portal-pill ${f.status === 'PAID' ? 'success' : 'danger'}`}>{f.status === 'PAID' ? '● Paid' : '● Due'}</span></td><td>{f.status === 'PAID' ? <button className="table-action" onClick={() => downloadReceipt(f)}><Download size={14}/> Receipt</button> : <button className="table-action primary" onClick={() => navigate(`/fees/pay?fee=${f.id}`)}><CreditCard size={14}/> Pay</button>}</td></tr>)}</tbody></table></div>
            <div className="fee-total-line"><span>Total fee amount</span><strong>{money(totalFee)}</strong></div>
          </section>
          <div className="fee-pay-column"><section className="fee-outstanding"><div className="outstanding-top"><span className="outstanding-icon"><CreditCard /></span><span>Outstanding Balance</span></div><strong>{money(outstanding)}</strong><p>{latestDue ? `Due on ${new Date(latestDue.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}` : 'No balance due'}</p><button onClick={() => navigate('/fees/pay')} disabled={!outstanding}>Pay Now <ArrowRight size={17}/></button></section><section className="portal-card pay-options"><h3>Payment Options</h3><div className="pay-option-list">{[{name:'UPI',method:'upi',icon:Smartphone},{name:'Card',method:'card',icon:CreditCard},{name:'Net Banking',method:'netbanking',icon:Landmark}].map(({name,method,icon:Icon}) => <button key={method} onClick={() => navigate(`/fees/pay?method=${method}`)}><Icon/>{name}</button>)}</div><p>Select a payment method to open the checkout page.</p></section></div>
        </div>
        <section className="portal-card payment-history"><div className="portal-section-head"><div><span className="section-icon"><Clock /></span><div><h2>Payment History</h2><p>Your recorded payments and receipts</p></div></div><button className="link-button" onClick={() => navigate('/fees/history')}>View All <ArrowRight size={15}/></button></div><div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>S. No.</th><th>Receipt / Transaction</th><th>Date</th><th>Amount (₹)</th><th>Payment Method</th><th>Status</th><th>Receipt</th></tr></thead><tbody>{paidFees.length ? paidFees.map((f, i) => <tr key={f.id}><td>{String(i + 1).padStart(2, '0')}</td><td>{f.receiptNo || `FEE-${f.id}`}</td><td>{new Date(f.paidAt || f.dueDate).toLocaleDateString('en-IN')}</td><td>{money(Number(f.amount))}</td><td>Recorded payment</td><td><span className="portal-pill success">● Success</span></td><td><button className="table-action" onClick={() => downloadReceipt(f)}><Download size={14}/> Download</button></td></tr>) : <tr><td colSpan={7} className="empty-row">No completed payments are available yet.</td></tr>}</tbody></table></div></section>
        <div className="fee-help-strip"><span className="section-icon"><ShieldCheck/></span><div><strong>Need help with a payment?</strong><p>Contact the accounts office for billing questions, payment status or receipt support.</p></div><button className="outline-button" onClick={() => navigate('/messages')}>Contact Support</button></div>
      </main>
      <aside className="fee-aside"><section className="portal-card payment-summary"><div className="portal-section-head"><div><span className="section-icon"><CircleDollarSign/></span><h2>Payment Summary</h2></div></div><div className="fee-donut-wrap"><div className="fee-donut" style={{'--paid-percent': `${totalFee ? (paidFee / totalFee) * 100 : 0}%`} as React.CSSProperties}><div><strong>{money(totalFee)}</strong><span>Total Fees</span></div></div><div className="donut-legend"><span><i className="paid-dot"/>Paid <b>{money(paidFee)}</b></span><span><i className="due-dot"/>Due <b>{money(outstanding)}</b></span></div></div></section>
        <section className="portal-card"><div className="portal-section-head"><div><span className="section-icon"><BellIcon/></span><h2>Important Notices</h2></div><button className="link-button" onClick={() => navigate('/notices')}>View All</button></div><div className="notice-mini"><span className="notice-dot red"/><div><strong>Fee payment deadlines</strong><p>Review due dates before making a payment.</p></div></div><div className="notice-mini"><span className="notice-dot blue"/><div><strong>Keep your receipt</strong><p>Save receipts for future reference.</p></div></div><div className="notice-mini"><span className="notice-dot blue"/><div><strong>Late payment policy</strong><p>Contact Accounts for questions about charges.</p></div></div></section>
        <section className="portal-card fee-schedule"><div className="portal-section-head"><div><span className="section-icon"><CalendarDays/></span><h2>Fee Payment Schedule</h2></div><button className="link-button" onClick={() => navigate('/fees/schedule')}>View All</button></div>{dueFees.slice(0, 4).map((f) => <div className="schedule-mini" key={f.id}><span className="notice-dot red"/><div><strong>{new Date(f.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong><small>{f.category}</small></div><b>{money(Number(f.amount))}</b><span className="portal-pill danger">Due</span></div>)}{!dueFees.length && <p className="muted-copy">No pending installments.</p>}</section>
        <section className="portal-card digital-receipts"><span className="section-icon"><ReceiptText/></span><div><h3>Digital Receipts</h3><p>Access receipts for completed payments.</p></div><button className="outline-button" onClick={() => navigate('/fees/receipts')}><Download size={14}/> View Receipts</button></section>
      </aside>
    </div>
  </div>;
};

function BellIcon() { return <Clock />; }

export const FeeStandalonePage: React.FC = () => {
  const { feePage = 'history' } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useAuth();
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState(searchParams.get('method') || 'upi');
  const [feeId, setFeeId] = useState(searchParams.get('fee') || '');
  useEffect(() => { apiClient.getFees().then(setFees).catch(console.error).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="page-loading">Loading fee records...</div>;
  const paid = fees.filter((fee) => fee.status === 'PAID');
  const outstanding = fees.filter((fee) => fee.status !== 'PAID');
  const selectedFee = outstanding.find((fee) => fee.id === feeId) || outstanding[0];
  const isPay = feePage === 'pay';
  const title = isPay ? 'Secure Fee Checkout' : feePage === 'receipts' ? 'Digital Receipts' : feePage === 'schedule' ? 'Fee Payment Schedule' : feePage === 'breakdown' ? 'Complete Fee Breakdown' : 'Payment History';
  const description = isPay ? 'Choose an available payment method for your outstanding fee.' : feePage === 'receipts' ? 'Download a receipt for any completed fee payment.' : feePage === 'schedule' ? 'Review every outstanding fee item and due date.' : feePage === 'breakdown' ? 'Review all fee categories and their current payment status.' : 'Review your completed fee transactions.';
  const methods = [{ id: 'upi', title: 'UPI', detail: 'UPI app / UPI ID', icon: Smartphone }, { id: 'card', title: 'Debit or Credit Card', detail: 'Visa · Mastercard · RuPay', icon: CreditCard }, { id: 'netbanking', title: 'Net Banking', detail: 'Participating banks', icon: Landmark }, { id: 'wallet', title: 'Wallet', detail: 'Supported digital wallets', icon: Wallet }];
  return <div className="portal-page entity-page"><button className="back-link" onClick={() => navigate('/fees')}><ArrowLeft/> Back to Fee Payments</button><header className="portal-hero"><div className="portal-hero-icon">{isPay ? <LockKeyhole/> : <ReceiptText/>}</div><div><span className="portal-breadcrumb">Fee Payments　›　{title}</span><h1>{title}</h1><p>{description}</p></div></header>
    {isPay ? <div className="fee-checkout-layout"><section className="portal-card"><div className="entity-form-heading"><h2>Select fee installment</h2><p>Only fees currently marked due can be selected.</p></div><label className="fee-select-label">FEE ITEM<select value={selectedFee?.id || ''} onChange={(event) => setFeeId(event.target.value)}>{outstanding.map((fee) => <option key={fee.id} value={fee.id}>{fee.category} · {money(Number(fee.amount))} · Due {new Date(fee.dueDate).toLocaleDateString('en-IN')}</option>)}</select></label><h2 className="payment-method-title">Choose a payment method</h2><div className="checkout-methods">{methods.map(({id,title:methodTitle,detail,icon:Icon}) => <button className={method === id ? 'selected' : ''} key={id} onClick={() => setMethod(id)}><span><Icon/></span><strong>{methodTitle}</strong><small>{detail}</small><i>{method === id ? '✓' : ''}</i></button>)}</div><div className="gateway-unavailable"><LockKeyhole/><div><strong>Payment gateway is not connected</strong><p>The college payment provider has not been configured. No payment will be taken from this page. Contact the accounts office to complete payment.</p></div></div><button className="solid-button checkout-submit" onClick={() => showToast('Checkout is unavailable until the college configures its payment gateway. No payment was made.')} disabled={!selectedFee}><LockKeyhole/>Continue to Payment Provider</button></section><aside className="portal-card checkout-summary"><h2>Payment Summary</h2><div><span>{selectedFee?.category || 'No due fee selected'}</span><strong>{selectedFee ? money(Number(selectedFee.amount)) : money(0)}</strong></div><div><span>Method</span><strong>{methods.find((item) => item.id === method)?.title}</strong></div><div className="checkout-total"><span>Total due</span><strong>{selectedFee ? money(Number(selectedFee.amount)) : money(0)}</strong></div><p><ShieldCheck/> Payment details are not collected by CampusConnect.</p></aside></div> : <section className="portal-card fee-full-list"><div className="portal-section-head"><div><span className="section-icon"><ReceiptText/></span><div><h2>{title}</h2><p>{fees.length} fee records</p></div></div></div><div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Fee Category</th><th>Receipt Number</th><th>Due / Paid Date</th><th>Amount</th><th>Status</th>{feePage === 'receipts' && <th>Download</th>}</tr></thead><tbody>{(feePage === 'receipts' || feePage === 'history' ? paid : feePage === 'schedule' ? outstanding : fees).map((fee) => <tr key={fee.id}><td><strong>{fee.category}</strong></td><td>{fee.receiptNo || '—'}</td><td>{new Date(fee.paidAt || fee.dueDate).toLocaleDateString('en-IN')}</td><td>{money(Number(fee.amount))}</td><td><span className={`portal-pill ${fee.status === 'PAID' ? 'success' : 'danger'}`}>{fee.status}</span></td>{feePage === 'receipts' && <td>{fee.status === 'PAID' ? <button className="table-action" onClick={() => downloadReceipt(fee)}><Download/> Download Receipt</button> : <span className="muted-copy">Receipt after payment</span>}</td>}</tr>)}{!fees.length && <tr><td colSpan={feePage === 'receipts' ? 6 : 5} className="empty-row">No fee records are available.</td></tr>}</tbody></table></div></section>}
  </div>;
};
