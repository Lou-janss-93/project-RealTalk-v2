# 🎯 Entri Gratis Domein Setup voor RealTalk

## Stap 1: Claim Je Gratis Domein
1. **Ga naar de Entri claim pagina** (link uit je email)
2. **Log in met je Bolt Pro credentials** (zelfde account als Bolt)
3. **Kies je gewenste domeinnaam** voor RealTalk

### Domein Suggesties voor RealTalk:
- `realtalk-conversations.com`
- `authentic-talks.com` 
- `realtalk-platform.com`
- `voice-authenticity.com`
- `reality-drift.com`
- `realtalk-app.com`

## Stap 2: Domein Configureren in Netlify
Na het claimen van je Entri domein:

1. **Ga naar je Netlify dashboard**
2. **Selecteer je RealTalk project**
3. **Site settings** → **Domain management**
4. **Add custom domain**
5. **Voer je nieuwe Entri domein in**

## Stap 3: DNS Configuratie
Entri geeft je DNS instellingen. Configureer deze in je Entri dashboard:

### Voor hoofddomein (bijv. realtalk-app.com):
```
Type: A Record
Name: @
Value: 75.2.60.5 (Netlify IP)
TTL: 3600
```

### Voor www subdomain:
```
Type: CNAME
Name: www
Value: jouw-netlify-site.netlify.app
TTL: 3600
```

## Stap 4: Netlify DNS Verificatie
1. **Wacht op DNS propagatie** (kan 24-48 uur duren)
2. **Netlify verifieert automatisch** je domein
3. **SSL certificaat wordt automatisch geactiveerd**

## Stap 5: App Configuratie Updates
Je moet mogelijk je app configureren voor het nieuwe domein:

### Environment Variables Update
```env
NEXT_PUBLIC_SITE_URL=https://jouw-nieuwe-domein.com
NEXT_PUBLIC_SUPABASE_URL=jouw-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw-supabase-key
```

### Supabase Auth Configuration
1. **Ga naar je Supabase dashboard**
2. **Authentication** → **URL Configuration**
3. **Voeg je nieuwe domein toe** aan Site URL en Redirect URLs:
   - `https://jouw-nieuwe-domein.com`
   - `https://jouw-nieuwe-domein.com/auth/callback`

## Stap 6: Testing Checklist
Na setup, test deze functionaliteiten:

- [ ] **Homepage laadt correct**
- [ ] **Authentication werkt** (login/signup)
- [ ] **Onboarding flow** functioneert
- [ ] **Voice capture** werkt
- [ ] **Matching systeem** functioneert
- [ ] **Conversations** starten correct
- [ ] **Feed** toont posts
- [ ] **Profile pagina** werkt

## Troubleshooting

### DNS Propagatie Controleren
```bash
# Check DNS propagatie
nslookup jouw-domein.com
dig jouw-domein.com
```

### Veelvoorkomende Problemen
1. **DNS nog niet gepropageerd**: Wacht 24-48 uur
2. **SSL certificaat fout**: Netlify activeert dit automatisch
3. **Auth redirect errors**: Controleer Supabase URL configuratie
4. **Mixed content warnings**: Zorg dat alle resources HTTPS gebruiken

## Pro Tips
- **Backup je huidige Netlify URL** voor het geval er problemen zijn
- **Test eerst met een subdomain** (bijv. test.jouw-domein.com)
- **Monitor je site** na de switch voor eventuele problemen
- **Update je social media links** naar het nieuwe domein

## SEO Optimalisatie voor Nieuw Domein
1. **Google Search Console** setup
2. **Sitemap indienen**
3. **301 redirects** van oude URL (indien nodig)
4. **Social media updates**

## Volgende Stappen
1. ✅ **Claim je Entri domein**
2. ✅ **Configureer DNS**
3. ✅ **Update Netlify**
4. ✅ **Update Supabase auth**
5. ✅ **Test alle functionaliteiten**
6. ✅ **Deel je nieuwe domein!**

---

**🎉 Succes met je gratis domein voor RealTalk!**

*Je platform gaat er nog professioneler uitzien met een eigen domein.*