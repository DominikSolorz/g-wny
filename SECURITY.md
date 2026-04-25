# Security Policy

## Zakres

Ten projekt ma byc utrzymywany jako repozytorium prywatne.

## Zasady sekretow

- Nie zapisuj sekretow, hasel, tokenow i kluczy w plikach sledzonych przez Git.
- Wszystkie dane wrazliwe przechowuj tylko w `.env`, managerze sekretow albo ustawieniach hostingu.
- Po kazdym wycieku wykonaj rotacje kluczy i hasel.

## Minimalne wymagania ochrony

- Wymus aktualne haslo administratora przez `ADMIN_PASSWORD`.
- Ustaw silne `APP_SECRET` w kazdym srodowisku.
- Trzymaj `data/` poza repozytorium i poza publicznym hostingiem statycznym.
- Wylacz lub rotuj nieuzywane integracje.

## Reakcja na incydent

1. Zidentyfikuj plik lub commit z wyciekiem.
2. Rotuj wszystkie dotkniete sekrety.
3. Usun dane wrazliwe z aktualnych plikow i historii repozytorium.
4. Sprawdz logi audytowe oraz konta administracyjne.
5. Udokumentuj incydent i dalsze kroki naprawcze.

## Publikacja

- Domyslnie utrzymuj repo jako prywatne.
- Publiczna publikacja wymaga wczesniejszego przegladu sekretow, danych osobowych i konfiguracji demo.