# Vipunen-pisterajat

Todistusvalinnan rajapisteet haetaan Vipunen-palvelusta:

https://vipunen.fi/fi-fi/kkyhteiset/Sivut/Haku-ja-valinta.aspx

→ *Ammattikorkeakoulutuksen ja yliopistokoulutuksen yhteishaun pisterajat*

Suodata vähintään:
- Sektori: yliopistokoulutus
- Valintatapajono: todistusvalinta
- Koulutuksen alkamisvuosi: 2026
- Koulutuksen alkamiskausi: syksy (kevään yhteishaku)

Vie raportti CSV:nä tähän kansioon nimellä `vipunen-pisterajat.csv` ja aja:

```bash
npm run import:vipunen
```

Tämä päivittää `lib/todistusvalinta/thresholds.json`.
