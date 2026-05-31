export const getPasswordResetHelp = (rawMessage?: string) => {
  const message = (rawMessage || '').toLowerCase();

  if (message.includes('email address not authorized')) {
    return 'Supabase default mailer only sends to your team members. Configure custom SMTP in Authentication > Email > SMTP Settings.';
  }

  if (message.includes('redirect') && message.includes('not allowed')) {
    return 'Add your reset URL to Authentication > URL Configuration > Redirect URLs (example: https://your-domain.com/reset-password).';
  }

  if (message.includes('smtp')) {
    return 'Your SMTP settings appear invalid. Recheck host, port, username, password, and sender email in Authentication > Email.';
  }

  if (message.includes('rate limit')) {
    return 'Supabase rate limit reached. Wait a minute and retry, or switch to custom SMTP.';
  }

  return '';
};
