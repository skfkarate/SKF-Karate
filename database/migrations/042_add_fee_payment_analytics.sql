-- Add portal_fee_payment_submitted event type to site_analytics_events

ALTER TABLE site_analytics_events DROP CONSTRAINT IF EXISTS site_analytics_events_event_type_check;
ALTER TABLE site_analytics_events ADD CONSTRAINT site_analytics_events_event_type_check
  CHECK (event_type IN (
    'page_view',
    'lead_submit_success',
    'lead_submit_failed',
    'portal_login_success',
    'portal_login_failed',
    'portal_fee_payment_submitted'
  ));
