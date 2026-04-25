# Nexus Informator

Rozbudowana aplikacja webowa z:

- ciemnym motywem premium `dark + red + green + blue`
- brandingiem `Nexus Informator` z logo i szybkim powrotem do strony glownej
- landing page z bannerem, kafelkami, blogiem i dopracowanym UX
- rejestracja i logowaniem z wymaganymi zgodami: regulamin, polityka prywatnosci, RODO
- generatorem loginu i hasla oraz podgladem hasla
- trwala historia rozmow po stronie backendu
- `Workbench` do analizy linkow, dokumentow, obrazow i audio
- transkrypcjami audio oraz obsluga linkow YouTube z publicznymi napisami
- obsluga do `100` plikow naraz z kontrolowanym limitem pamieci po stronie backendu
- trybami `chat`, `code`, `analysis`, `review`
- trybami eksperckimi `general`, `programming`, `legal`, `medical`, `court`, `business`, `creative`
- generowaniem obrazow przez `gpt-image-1.5`
- tworzeniem jobow wideo przez `sora-2`
- glosowym dyktowaniem i czytaniem odpowiedzi
- centrum integracji z szyfrowanym zapisem sekretow
- panelem administratora z danymi kont, logami i stanem platformy
- kopia zapasowa danych, incydentami bezpieczenstwa plikow oraz produkcyjna warstwa storage pod PostgreSQL

## Co dochodzi w tej wersji

- Backend potrafi pracowac na `JSON` albo na `PostgreSQL` przez dokumentowa tabele `app_collections`.
- Uzytkownik moze wrzucac pliki `PDF`, `DOC`, `DOCX`, `TXT`, `CSV`, `JPG`, `PNG`, `WEBP`, audio i inne wspierane zalaczniki.
- Audio jest transkrybowane przez model `gpt-4o-transcribe`.
- Linki stron sa pobierane i streszczane, a YouTube korzysta z publicznych napisow, jesli sa dostepne.
- Sekrety integracji sa szyfrowane po stronie backendu.
- Zalaczniki przechodza heurystyczna kontrole zagrozen. Podejrzane pliki sa blokowane i zapisywane jako incydenty administracyjne.

## Bezpieczenstwo i granice

- Hasla nie sa zapisywane jawnie. System przechowuje tylko bezpieczne skroty hasel.
- Sekrety integracyjne nie sa zwracane wprost do frontendu.
- Aplikacja nie usuwa zabezpieczen modelu i nie udaje licencjonowanego lekarza, adwokata ani sadu.
- Nie istnieje uczciwy tryb "bez limitu pamieci" albo "nigdy sie nie myli". Ta wersja stawia na maksymalna rzetelnosc, jawne sygnalizowanie niepewnosci i priorytetyzacje zadan.
- Tryby `legal`, `medical` i `court` pomagaja przygotowac logiczne materialy, ale wymagaja ludzkiej weryfikacji przy sprawach wysokiego ryzyka.
- Tresci prawne w projekcie sa szkieletem wdrozeniowym i powinny zostac sprawdzone przez prawnika przed publikacja.

## Dane administratora w projekcie

- Dominik Solorz
- ul. Piastowska 2/1, 40-005 Katowice
- tel. 796-731-886
- email: Goldservicepoland@gmail.com

## Storage

Domyslnie aplikacja dziala na `JSON`:

- `data/users.json`
- `data/sessions.json`
- `data/chats.json`
- `data/audit-log.json`
- `data/video-jobs.json`
- `data/incidents.json`
- `data/backups`

Do produkcji mozesz przelaczyc storage na `PostgreSQL`:

```powershell
$env:STORAGE_DRIVER="postgres"
$env:DATABASE_URL="postgres://user:password@host:5432/nexus_informator"
$env:APP_SECRET="bardzo-dlugi-sekret-do-szyfrowania"
```

Backend sam tworzy tabele `app_collections`.

Domyslne limity do zmiany przez zmienne srodowiskowe:

```powershell
$env:MAX_WORKBENCH_FILES="100"
$env:MAX_INLINE_FILE_BYTES="33554432"
$env:MAX_TOTAL_FILE_BYTES="268435456"
```

## Uruchomienie lokalne

1. Zainstaluj Node.js 20 lub nowszy.
2. Skopiuj `.env.example` do `.env` albo ustaw zmienne srodowiskowe recznie.
3. W tej wersji domyslnie dziala darmowy tryb lokalny dla czatu:

```powershell
$env:CHAT_PROVIDER="local"
```

Nie potrzebujesz platnego klucza, zeby uruchomic podstawowy czat i lokalne fallbacki.

Jesli chcesz wlaczyc zewnetrzne modele, ustaw odpowiedni klucz, na przyklad OpenAI:

```powershell
$env:OPENAI_API_KEY="sk-..."
```

Klucze zewnetrzne nie sa obowiazkowe dla darmowego czatu lokalnego. Nadal sa potrzebne do obrazu, audio, wideo i bardziej zaawansowanych funkcji opartych o zewnetrzne API.

Opcjonalne sekrety dodajesz dopiero wtedy, gdy chcesz wlaczyc integracje:

- Gmail / Google Drive: token lub haslo aplikacji
- Facebook / Instagram / TikTok / YouTube: tokeny platform lub OAuth
- webhook: wlasny URL i sekret po stronie Twojego systemu

4. Opcjonalnie ustaw modele:

```powershell
$env:OPENAI_MODEL="gpt-5.2"
$env:OPENAI_IMAGE_MODEL="gpt-image-1.5"
$env:OPENAI_VIDEO_MODEL="sora-2"
$env:OPENAI_AUDIO_MODEL="gpt-4o-transcribe"
```

5. Uruchom aplikacje:

```powershell
npm install
npm start
```

6. Otworz:

```text
http://localhost:3000
```

## Konto administratora demo

Jesli nie ustawisz innych danych w zmiennych srodowiskowych, projekt utworzy konto admin:

- email: `admin@example.com`
- login: `admin`
- haslo: `change-me-now`

Po pierwszym uruchomieniu ustaw wlasne dane administratora przez `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, `ADMIN_FIRST_NAME`, `ADMIN_LAST_NAME` i `ADMIN_USERNAME`.

## Hosting

W repo sa dodane pliki pomocnicze:

- `vercel.json` - szybka konfiguracja pod Node na Vercel
- `deploy/vps/Dockerfile` - obraz pod VPS
- `deploy/vps/ecosystem.config.cjs` - uruchamianie przez PM2
- `deploy/vps/nginx.conf` - reverse proxy pod Nginx

Na Vercel do trwalej pracy ustaw `DATABASE_URL` do zewnetrznego PostgreSQL. Na VPS mozesz uruchomic backend jako staly proces i trzymac backupy lokalnie.

## Oficjalne materialy OpenAI

- [Models](https://developers.openai.com/api/docs/models)
- [Responses API](https://platform.openai.com/docs/api-reference/responses)
- [Images API](https://platform.openai.com/docs/api-reference/images)
- [Audio API](https://platform.openai.com/docs/api-reference/audio)
- [Videos API](https://platform.openai.com/docs/api-reference/videos)

## Podstawa prawna RODO

- [RODO / GDPR - EUR-Lex](https://eur-lex.europa.eu/legal-content/PL/TXT/HTML/?uri=CELEX:32016R0679)
