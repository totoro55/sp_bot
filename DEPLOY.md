# Запуск бота на ПК в корпсети

Бот ходит в Telegram длинным опросом и в CRM South Project по HTTP. Снаружи в эту машину стучаться не нужно: GitHub Actions только ставит задачу, а выполняет её runner, который сам установлен на ПК.

Один и тот же `BOT_TOKEN` может обслуживать только один процесс. Пока контейнер запущен, локальный `npm run dev` с этим токеном лучше не поднимать.

## Что должно быть на ПК

- Linux, либо Windows с WSL2 (Ubuntu). Runner и Docker ставятся внутри этого Linux: у Docker Desktop на Windows `network_mode: host` из `docker-compose.yml` работает иначе, а боту нужна корп. DNS (`*.partner.ru`).
- Docker Engine и плагин Compose v2 (`docker compose version`).
- Исходящий доступ к `github.com`, Docker Hub и `registry.npmjs.org`. Если они открываются только через прокси, его нужно прописать и демону Docker, и сборке (ниже).
- Доступ к CRM (`CRM_URL`) и к прокси Telegram без дополнительного NAT.

Пользователь, от которого работает runner, должен быть в группе `docker`.

## 1. Файл окружения

Файл лежит вне каталога сборки, чтобы `checkout` его не затирал.

```bash
sudo mkdir -p /opt/sp_bot
sudo cp .env.example /opt/sp_bot/.env
sudo chmod 600 /opt/sp_bot/.env
```

Заполните `BOT_TOKEN`, `CRM_URL`, `CRM_API_KEY`, `CRM_PASSWORD`, `CRM_USER`. `TELEGRAM_PROXY_URL` оставьте корп. прокси. Если у машины есть прямой выход в Telegram, поставьте `TELEGRAM_PROXY_URL=none`.

Если `npm ci` внутри образа не видит интернет, раскомментируйте в этом же файле `BUILD_HTTP_PROXY` и `BUILD_HTTPS_PROXY`. Для демона Docker (скачивание `node:22-bookworm-slim`) на Linux:

```ini
# /etc/systemd/system/docker.service.d/http-proxy.conf
[Service]
Environment="HTTP_PROXY=http://mow2-it-proxy-haproxy.partner.ru:3128"
Environment="HTTPS_PROXY=http://mow2-it-proxy-haproxy.partner.ru:3128"
Environment="NO_PROXY=localhost,127.0.0.1,.partner.ru"
```

После этого: `sudo systemctl daemon-reload && sudo systemctl restart docker`.

Проверка руками из корня репозитория:

```bash
export ENV_FILE=/opt/sp_bot/.env
docker compose --env-file "$ENV_FILE" up -d --build
docker logs -f sp-bot
```

В логе должно появиться `Бот запущен: @...`. Остановка: `docker compose --env-file /opt/sp_bot/.env down`.

## 2. Self-hosted runner

В репозитории: Settings → Actions → Runners → New self-hosted runner. Ставьте runner в Linux (или в WSL2), не в PowerShell на Windows.

На шаге настройки меток добавьте `sp-bot` к стандартным `self-hosted` и `linux`. Workflow ждёт обе метки: `self-hosted` и `sp-bot`.

Запускайте runner как сервис (`svc.sh install` и `svc.sh start` из инструкции GitHub), от пользователя, который входит в группу `docker`.

## 3. Включить выкладку

Пока переменная не задана, workflow Deploy не занимает runner и не висит в очереди.

Settings → Secrets and variables → Actions → Variables → New repository variable:

- имя: `DEPLOY_ENABLED`
- значение: `true`

После этого:

- push в `main` сам собирает образ на этом ПК и перезапускает контейнер `sp-bot`;
- вручную то же самое делает Actions → Deploy → Run workflow. Так можно выложить и другую ветку, не дожидаясь слияния в `main`.

Логи контейнера на ПК: `docker logs -f sp-bot`. Логи самого шага — во вкладке Actions.

Сборка без деплоя (типчек и `tsc`) идёт отдельно в workflow CI на серверах GitHub при каждом push и pull request.
