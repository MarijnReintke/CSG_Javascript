# Game state in stappen

In deze map staat een basisspel met een *game state* (speltoestand). Het begint met `stap-0.js`, het startpunt, en bouwt in vier stappen verder. Elk bestand is het eindresultaat van die stap en daarmee het startpunt voor de volgende.

## De toestanden van het spel

Het spel is altijd in precies één toestand. Die staat in de variabele `spel.toestand` (binnen de klasse: `this.toestand`):

| Toestand         | Scherm                 |
|------------------|------------------------|
| `'begin'`        | `tekenBeginScherm()`   |
| `'spelen'`       | `tekenSpeelScherm()`   |
| `'levelGehaald'` | `tekenLevelScherm()`   |
| `'einde'`        | `tekenEindScherm()`    |

Of je bij `'einde'` gewonnen of verloren hebt, staat in de boolean `spel.gewonnen`.

Met het toetsenbord ga je van de ene toestand naar de andere:

```
                       +--------spatie---------+
                       |                       |
                       v                       |
'begin' --spatie--> 'spelen' ----V----> 'levelGehaald'
   ^                   |
   |                   | W: gewonnen = true
   |                   | L: gewonnen = false
   |                   v
   +-------N-------  'einde'
```

---

## Stap 0 – Het startpunt (`stap-0.js`)
### Resultaat
Een scherm met *"Klaar voor het spel? Druk spatie om te starten"*. In de console (F12, "onderwaterscherm") verschijnt bij elke toetsaanslag `key` en `keyCode`.



## Stap 1 – Van beginscherm naar speelscherm (`stap-1.js`)
### Resultaat
Na spatie verschijnt een scherm met *"Dit is level 1."*
### Kern
De toestand van het spel staat in één variabele. Een toets laat het spel naar een andere toestand gaan. Het tekenen wordt gewijzigd, gebaseerd op de huidige toestand.



## Stap 2 – Levels (`stap-2.js`)
### Resultaat
Met V ga je van het speelscherm naar het tussenscherm, en met spatie daarna naar level 2, 3, etc.
### Kern
Het levelnummer wordt verhoogd, en dat zie je terug in de tekst op het speelscherm.

De toestand verandert binnen `verwerkInvoer()`, en de losse `if`s worden van boven naar beneden gecontroleerd. Daarom gebruikt het speelscherm V in plaats van spatie: anders zou dezelfde toetsaanslag ook de volgende toestand meteen activeren.



## Stap 3 – Het scorebord (`stap-3.js`)
### Resultaat
Een grijze balk bovenin met de score en de hartjes
### Kern
`tekenScorebord()` wordt één keer geschreven en in twee tekenmethodes aangeroepen: `tekenSpeelScherm()` en `tekenLevelScherm()`.



## Stap 4 – Winnen, verliezen en opnieuw beginnen (`stap-4.js`)
### Resultaat
- W geeft een groen winscherm
- L geeft een rood verliesscherm
- Daarna brengt N je weer terug naar het beginscherm voor een nieuw spel
### Kern
Het spel kan beëindigd en daarna volledig gereset worden.

Gewonnen en verloren zijn geen aparte toestanden, maar één toestand `'einde'`. De boolean `gewonnen` bepaalt welk eindscherm getekend wordt.
