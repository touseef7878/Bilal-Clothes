/*
# Create admin user and update store settings

## Overview
1. Creates an admin auth user for Tousseef Ur Rehman (touseefurrehman5554@gmail.com)
2. Sets their profile role to 'admin'
3. Updates store_info settings to reflect "Bilal Clothes" branding
4. Updates shipping settings

## Notes
- The auth user is created via auth.users insert with a hashed password
- The profile trigger (handle_new_user) will auto-create the profile row
- We then update the profile to set role = 'admin' and fill in name/phone
*/

-- Create the auth user (if not exists)
DO $$
DECLARE
  user_uuid uuid;
BEGIN
  SELECT id INTO user_uuid FROM auth.users WHERE email = 'touseefurrehman5554@gmail.com';
  IF user_uuid IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'touseefurrehman5554@gmail.com',
      crypt('BilalAdmin2026!', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"role": "admin"}'::jsonb,
      '{"name": "Tousseef Ur Rehman", "phone": "+923101533429"}'::jsonb
    )
    RETURNING id INTO user_uuid;
  END IF;
END $$;

-- Update profile to admin role with full details
INSERT INTO profiles (id, name, email, phone, role)
SELECT id, 'Tousseef Ur Rehman', 'touseefurrehman5554@gmail.com', '+923101533429', 'admin'
FROM auth.users WHERE email = 'touseefurrehman5554@gmail.com'
ON CONFLICT (id) DO UPDATE
SET name = 'Tousseef Ur Rehman',
    email = 'touseefurrehman5554@gmail.com',
    phone = '+923101533429',
    role = 'admin';

-- Update store info settings
UPDATE settings SET value = '{
  "name": "Bilal Clothes",
  "tagline": "Premium Pakistani Fashion — Bismillah",
  "whatsapp_number": "+923101533429",
  "email": "touseefurrehman5554@gmail.com",
  "phone": "+92 310 1533429",
  "address": "Mughal Market, Taxila, Punjab, Pakistan",
  "instagram": "https://instagram.com/touseef__r",
  "facebook": ""
}'::jsonb, updated_at = now()
WHERE key = 'store_info';

-- Insert if not exists
INSERT INTO settings (key, value)
SELECT 'store_info', '{
  "name": "Bilal Clothes",
  "tagline": "Premium Pakistani Fashion — Bismillah",
  "whatsapp_number": "+923101533429",
  "email": "touseefurrehman5554@gmail.com",
  "phone": "+92 310 1533429",
  "address": "Mughal Market, Taxila, Punjab, Pakistan",
  "instagram": "https://instagram.com/touseef__r",
  "facebook": ""
}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'store_info');
