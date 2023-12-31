# Локальное развертывание проекта "Microservices"

## Описание проекта

Проект представляет собой два микросервиса: `M1` и `M2`. `M1` принимает POST-запросы с числом в теле запроса, отправляет это число в очередь `request_queue` RabbitMQ и ожидает обработки от `M2`. `M2` принимает сообщения из `request_queue`, умножает числа на 2, и отправляет результат в очередь `response_queue`.

## Локальное развертывание

### Требования

- Node.js (рекомендуется версия 18 и выше)
- RabbitMQ (локальная установка или доступ к удаленному)

### Шаги

1. **Клонирование репозитория**

    ```bash
    git clone <URL-репозитория>
    cd <папка-проекта>
    ```

2. **Установка зависимостей**

    Для каждого из микросервисов (`M1` и `M2`):

    ```bash
    cd M1
    npm install

    # В новом терминале
    cd M2
    npm install
    ```

3. **Настройка RabbitMQ**

    Убедитесь, что RabbitMQ установлен и запущен. По умолчанию, микросервисы ожидают, что RabbitMQ будет доступен по адресу `amqp://localhost`.

    При необходимости измените переменную `amqp_url` в файлах `M1/index.js` и `M2/index.js` на соответствующий URL вашего RabbitMQ-сервера.

4. **Запуск микросервисов**

    В двух разных терминалах выполните следующие команды:

    ```bash
    # В первом терминале
    cd M1
    npm start
    ```

    ```bash
    # Во втором терминале
    cd M2
    npm start
    ```

5. **Тестирование**

    Микросервисы будут запущены на портах 5000 (M1) и 5001 (M2). Вы можете отправить POST-запрос к `http://localhost:5000` с числом в теле запроса для тестирования функциональности.

    ```bash
    # Пример POST-запроса с использованием cURL
    curl -X POST -d "5" http://localhost:5000
    ```

6. **Логирование**

    Логи выводятся в консоль и в файлы log.txt в каждой папке. Логирование в файлы мешало Vercel, куда был опубликован это задание. Потому оно заблокировано комментариями. Но локально работает без проблем.


7. **Завершение работы**

    Для остановки микросервисов просто закройте соответствующие терминалы.

8. **Публикация**

    Оба микросервиса М1 и М2 были опубликованы на Vercel, адреса ниже:
    M1: https://test-ashen-one-95.vercel.app/
    M2: https://test-u7do.vercel.app/
    Однако в связи с задержкой рекомендую локально установить проект для стабильной работы.

