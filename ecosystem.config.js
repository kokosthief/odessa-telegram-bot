module.exports = {
  apps: [{
    name: 'odessa-bot',
    script: 'npm',
    args: 'run cli run',
    cwd: '/Users/henners/Documents/Coding/Team-Odessa-Telegram-Bot',
    env: {
      NODE_ENV: 'production'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
