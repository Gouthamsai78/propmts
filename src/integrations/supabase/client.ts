// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vxxxnjrdzfzvylejaozb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4eHhuanJkemZ6dnlsZWphb3piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNTMyMzksImV4cCI6MjA2MzkyOTIzOX0.bkLFc_9fKn5Ubdi0aIyfTY90P_aIXoapV0Fk9KYW6M0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);