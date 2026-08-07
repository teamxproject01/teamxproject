import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function PaymentResult({ success }: { success: boolean }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'done'>(success ? 'processing' : 'done');

  useEffect(() => {
    if (!success) return;
    const sessionId = searchParams.get('session_id');
    if (!sessionId) { setStatus('done'); return; }

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      const { data } = await supabase
        .from('payment_installments')
        .select('status')
        .eq('stripe_checkout_session_id', sessionId)
        .maybeSingle();
      if (data?.status === 'paid') {
        setStatus('done');
        clearInterval(interval);
      } else if (attempts > 10) {
        setStatus('done');
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [success, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center"
      >
        {success ? (
          status === 'processing' ? (
            <>
              <Loader2 className="w-12 h-12 text-blue-700 mx-auto mb-4 animate-spin" />
              <h1 className="text-xl font-bold text-slate-900 mb-2">Processing Payment…</h1>
              <p className="text-sm text-slate-500">Please wait while we confirm your payment.</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
              <p className="text-sm text-slate-500 mb-6">Your payment has been received. You will receive a confirmation email shortly.</p>
            </>
          )
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Payment Cancelled</h1>
            <p className="text-sm text-slate-500 mb-6">Your payment was not completed. You can try again at any time.</p>
          </>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/student/applications')}
            className="px-6 py-2.5 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 transition-colors"
          >
            Go to Applications
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors"
          >
            Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
