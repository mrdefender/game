bind = "0.0.0.0:5000" # IP и порт, на котором будет работать Gunicorn
workers = 3 # Рекомендуется (2 × кол-во ядер) + 1
timeout = 120 # Таймаут в секундах
accesslog = "/var/log/gunicorn/access.log" # Путь к лог-файлу доступа
errorlog = "/var/log/gunicorn/error.log" # Путь к лог-файлу ошибок
capture_output = True # Перенаправлять вывод stdout/stderr в логи
