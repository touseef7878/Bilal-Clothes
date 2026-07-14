/*
# Create increment_promo_usage function

## Overview
Creates a database function to increment the usage_count of a promo code when an order is placed.
This is called from the checkout flow via supabase.rpc().

## Security
- The function is SECURITY DEFINER so it can update promo_codes regardless of RLS.
- Only increments usage_count by 1.
*/

CREATE OR REPLACE FUNCTION increment_promo_usage(promo_code text)
RETURNS void AS $$
BEGIN
  UPDATE promo_codes
  SET usage_count = usage_count + 1
  WHERE code = UPPER(promo_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
