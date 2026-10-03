import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ success: false, message: 'Coupon code required' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', cleanCode)
      .eq('is_active', true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ success: false, message: 'Invalid or inactive promotional code.' }, { status: 404 });
    }

    // Check expiration date
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ success: false, message: 'This voucher code has expired.' }, { status: 400 });
    }

    // Check maximum global uses
    if (coupon.max_uses !== null && coupon.times_used >= coupon.max_uses) {
      return NextResponse.json({ success: false, message: 'This promotional code has reached its usage limit.' }, { status: 400 });
    }

    // Check minimum spend requirement
    if (coupon.min_spend && Number(subtotal) < Number(coupon.min_spend)) {
      return NextResponse.json({
        success: false,
        message: `Minimum order subtotal of $${Number(coupon.min_spend).toFixed(2)} required to apply this voucher.`,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: Number(coupon.discount_value),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Server error' }, { status: 500 });
  }
}