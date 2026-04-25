# Operations Guide

## Cel

Ten dokument sluzy do dalszego modyfikowania, napraw, serwisowania oraz monitorowania postepu prac.

## Serwis i naprawy

1. Zmieniaj konfiguracje tylko przez `.env` i ustawienia hostingu.
2. Przed wdrozeniem uruchamiaj co najmniej:
   - `npm install`
   - `node --check server.js`
   - `node --check public/app.js`
3. Po zmianach w integracjach sprawdzaj logowanie, `/api/me`, `/api/chat` i ekran Integracje.

## Ochrona interesu projektu

- Nie trzymaj danych klientow w repozytorium.
- Backupy i pliki runtime przechowuj poza GitHubem.
- Kazda zmiana dotyczaca kont, szyfrowania, logow lub uploadu wymaga dodatkowej weryfikacji.

## Szyfrowanie i dane

- Sekrety integracji sa szyfrowane po stronie backendu przez `APP_SECRET`.
- Zmiana `APP_SECRET` wymaga kontrolowanego planu migracji sekretow.
- Dane sesji, czatow i audytu przechowuj w `data/` albo w docelowej bazie danych.

## Monitorowanie postepu

- Prowadz prace w malych commitach z opisem celu.
- Po kazdej wiekszej zmianie aktualizuj README albo dokumentacje operacyjna.
- Utrzymuj liste otwartych ryzyk: sekrety, storage, integracje, wydajnosc, backupy.

## Zwalnianie miejsca lokalnie

- Usuwaj `data/backups/`, gdy kopie sa bezpiecznie przeniesione poza maszyne lokalna.
- Usuwaj modele `~/.ollama`, jesli nie sa juz potrzebne lokalnie.
- Czysc cache `npm` i artefakty tymczasowe po wdrozeniu.