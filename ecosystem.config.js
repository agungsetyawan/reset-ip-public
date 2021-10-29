module.exports = {
  apps: [
    {
      name: 'reset-ip-public',
      script: './index.js',
      cron_restart: '* * * * *',
      autorestart: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
}
