# 🌐 Domein Setup Guide voor RealTalk

## Stap 1: Netlify Dashboard
1. Ga naar je Netlify dashboard
2. Selecteer je RealTalk project
3. Ga naar **Site settings** → **Domain management**

## Stap 2: Custom Domain Toevoegen
1. Klik op **Add custom domain**
2. Voer je gewenste domeinnaam in (bijv. `realtalk-demo.com`)
3. Klik **Verify**

## Stap 3: DNS Configuratie
Als je een domein koopt, configureer de DNS:

### Voor een hoofddomein (realtalk.com):
```
Type: A
Name: @
Value: 75.2.60.5
```

### Voor een subdomain (www.realtalk.com):
```
Type: CNAME
Name: www
Value: jouw-site-naam.netlify.app
```

## Stap 4: SSL Certificaat
- Netlify activeert automatisch HTTPS
- Dit kan 24-48 uur duren

## Gratis Domein Opties

### 1. Freenom (Gratis)
- Ga naar freenom.com
- Zoek een beschikbare .tk, .ml, of .ga domein
- Registreer gratis voor 12 maanden

### 2. GitHub Student Pack
Als je student bent:
- Gratis .me domein via Namecheap
- Aanmelden op education.github.com

### 3. Netlify Subdomain Gebruiken
Je huidige setup werkt perfect:
- `jouw-app-naam.netlify.app`
- Volledig functioneel
- Gratis SSL
- Geen extra configuratie nodig

## Aanbevolen Workflow
1. **Start met Netlify subdomain** (wat je nu hebt)
2. **Test alles grondig**
3. **Koop later een professioneel domein** als het project groeit

## Domein Suggesties voor RealTalk
- `realtalk-app.com`
- `authentic-conversations.com`
- `realtalk-platform.com`
- `voice-authenticity.com`

## Kosten Indicatie
- **.com domein**: €10-15 per jaar
- **.nl domein**: €8-12 per jaar
- **Gratis alternatieven**: .tk, .ml, .ga (beperkte functionaliteit)