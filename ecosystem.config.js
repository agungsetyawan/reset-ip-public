module.exports = {
  apps: [
    {
      name: 'reset-ip-public',
      script: './index.js',
      cron_restart: '* * * * *',
      autorestart: false
    }
  ]
}
