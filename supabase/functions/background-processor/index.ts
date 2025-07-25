import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { jobId, action } = await req.json()

    switch (action) {
      case 'process_job':
        // Process a specific job
        const { data: job } = await supabaseClient
          .from('BackgroundJob')
          .select('*')
          .eq('id', jobId)
          .single()

        if (!job) {
          throw new Error('Job not found')
        }

        // Update job status to processing
        await supabaseClient
          .from('BackgroundJob')
          .update({ 
            status: 'PROCESSING', 
            startedAt: new Date().toISOString(),
            progress: 0 
          })
          .eq('id', jobId)

        // Process the job (your existing logic)
        const result = await processAnalysisJob(job)

        // Update job with results
        await supabaseClient
          .from('BackgroundJob')
          .update({
            status: result.success ? 'COMPLETED' : 'FAILED',
            result: result.data,
            error: result.error,
            progress: 100,
            completedAt: new Date().toISOString()
          })
          .eq('id', jobId)

        return new Response(
          JSON.stringify({ success: true, result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'schedule_jobs':
        // Get pending jobs and schedule them
        const { data: pendingJobs } = await supabaseClient
          .from('BackgroundJob')
          .select('id')
          .eq('status', 'PENDING')
          .limit(5)

        for (const job of pendingJobs || []) {
          // Trigger individual job processing
          await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/background-processor`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ jobId: job.id, action: 'process_job' })
          })
        }

        return new Response(
          JSON.stringify({ success: true, scheduled: pendingJobs?.length || 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function processAnalysisJob(job: any) {
  // Your existing job processing logic here
  // This would be similar to your backgroundAnalyzeChat method
  try {
    // Process the analysis
    return { success: true, data: {} }
  } catch (error) {
    return { success: false, error: error.message }
  }
}