# TPV unified bootstrap — этап 11.6

`tpv.application.register_tpv_application()` выполняет регистрацию
backend-компонентов TPV в строгом порядке:

1. основные ORM-модели;
2. маршруты TPV Editor;
3. архив игр;
4. Theme Engine;
5. Snapshot providers;
6. Archive Runtime;
7. Socket.IO-обработчики.

Функция возвращает совместимые имена, после чего `game.py` выполняет:

```python
globals().update(TPV_APPLICATION_EXPORTS)
```

Поэтому существующий общий код продолжает видеть прежние классы,
helper-функции и Runtime-объекты.
