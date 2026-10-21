# Запуск на Windows через Docker

Бот работает в Linux-контейнере Docker Desktop. На ПК в корпсети стоит self-hosted runner: после push в `main` GitHub Actions сам обновляет код и перезапускает контейнер. Входящий доступ к этому ПК из интернета не нужен.

Один `BOT_TOKEN` обслуживает только один процесс. Пока контейнер запущен, второй экземпляр с тем же токеном не запускайте.

Docker Desktop должен быть в режиме Linux containers.

## 1. Docker Desktop

Установите Docker Desktop с бэкендом WSL2 и дождитесь статуса Running.

```powershell
docker compose version
```

В Docker Desktop прокси не включайте. Корп. прокси нужен только боту для Telegram, он задаётся в `TELEGRAM_PROXY_URL`. Образ и CRM ходят напрямую.

Включите Start Docker Desktop when you sign in.

Учётная запись Windows, под которой будет работать runner, должна входить в группу `docker-users`. После добавления в группу выйдите из Windows и зайдите снова.

## 2. Файл окружения

Каталог `C:\sp_bot` не стирается при обновлении репозитория.

```powershell
New-Item -ItemType Directory -Force C:\sp_bot
Copy-Item .env.example C:\sp_bot\.env
notepad C:\sp_bot\.env
```

Заполните `BOT_TOKEN`, `CRM_URL`, `CRM_API_KEY`, `CRM_PASSWORD`, `CRM_USER`. `TELEGRAM_PROXY_URL` оставьте корп. прокси. Строк `BUILD_HTTP_PROXY` в этом файле быть не должно.

## 3. Runner

В GitHub откройте репозиторий `sp_bot`: Settings → Actions → Runners → New self-hosted runner → Windows → PowerShell.

В блоке меток допишите `sp-bot`. Итоговый набор: `self-hosted`, `Windows`, `X64`, `sp-bot`. Workflow ждёт метки `self-hosted`, `Windows` и `sp-bot`.

Команды из этой страницы выполните в PowerShell на ПК. В конце установите runner службой от той же учётной записи, которой пользуетесь вы и которой доступен Docker:

```powershell
.\svc.ps1 install
.\svc.ps1 start
```

В Settings → Actions → Runners статус должен быть Idle.

## 4. Включить автоматическое обновление

Settings → Secrets and variables → Actions → Variables → New repository variable:

- имя: `DEPLOY_ENABLED`
- значение: `true`

Пока переменной нет, push в `main` только проверяет сборку на серверах GitHub и не трогает ПК.

После `DEPLOY_ENABLED=true` каждый push в `main` на этом ПК делает `git checkout`, собирает образ и перезапускает контейнер `sp-bot`. Тот же шаг вручную: Actions → Deploy → Run workflow.

Лог шага смотрите во вкладке Actions. Лог бота на ПК:

```powershell
docker logs -f sp-bot
```

В логе должна быть строка `Бот запущен: @...`.

Остановка:

```powershell
docker compose --env-file C:/sp_bot/.env down
```

## Если имена *.partner.ru не открываются из контейнера

В `ipconfig /all` найдите DNS Servers. Добавьте адрес в сервис `bot` в `docker-compose.yml`:

```yaml
dns:
  - 10.0.0.1
```

Подставьте свой адрес и запушьте изменение в `main` либо выполните на ПК:

```powershell
$env:ENV_FILE = 'C:/sp_bot/.env'
docker compose --env-file C:/sp_bot/.env up -d --force-recreate
```
