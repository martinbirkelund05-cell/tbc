import {
  Html, Head, Body, Container, Section, Text, Button, Hr, Row, Column,
} from "@react-email/components";
import * as React from "react";

type Locale = "en" | "de" | "fr" | "da" | "nl";

interface Props {
  code: string;
  expiryTime: string;
  locale?: Locale;
}

const COPY: Record<Locale, {
  subject: string;
  welcome: string;
  subtitle: string;
  codeLabel: string;
  expiry: (t: string) => string;
  cta: string;
  footer: string;
}> = {
  en: {
    subject: "Your 10% discount code — valid for 15 min!",
    welcome: "Welcome to the family.",
    subtitle: "Here's your 10% off your first order. Use it at checkout before it expires.",
    codeLabel: "Your discount code",
    expiry: (t) => `⏱ Expires at ${t} — hurry!`,
    cta: "Shop Now",
    footer: "© 2026 TheBrandCrate. You receive this email because you signed up for our newsletter.",
  },
  de: {
    subject: "Dein 10% Rabattcode — 15 Min. gültig!",
    welcome: "Willkommen in der Familie.",
    subtitle: "Hier ist dein 10% Rabatt auf deine erste Bestellung. Nutze ihn an der Kasse, bevor er abläuft.",
    codeLabel: "Dein Rabattcode",
    expiry: (t) => `⏱ Läuft ab um ${t} — beeil dich!`,
    cta: "Jetzt shoppen",
    footer: "© 2026 TheBrandCrate. Du erhältst diese E-Mail, weil du dich für unseren Newsletter angemeldet hast.",
  },
  fr: {
    subject: "Votre code de réduction 10% — valable 15 min!",
    welcome: "Bienvenue dans la famille.",
    subtitle: "Voici votre réduction de 10% sur votre première commande. Utilisez-la avant qu'elle n'expire.",
    codeLabel: "Votre code de réduction",
    expiry: (t) => `⏱ Expire à ${t} — dépêchez-vous !`,
    cta: "Acheter maintenant",
    footer: "© 2026 TheBrandCrate. Vous recevez cet e-mail car vous vous êtes inscrit à notre newsletter.",
  },
  da: {
    subject: "Din 10% rabatkode — gyldig i 15 min!",
    welcome: "Velkommen til familien.",
    subtitle: "Her er din 10% rabat på din første ordre. Brug den ved kassen, inden den udløber.",
    codeLabel: "Din rabatkode",
    expiry: (t) => `⏱ Udløber kl. ${t} — skynd dig!`,
    cta: "Shop nu",
    footer: "© 2026 TheBrandCrate. Du modtager denne e-mail, fordi du tilmeldte dig vores nyhedsbrev.",
  },
  nl: {
    subject: "Jouw 10% kortingscode — 15 min geldig!",
    welcome: "Welkom in de familie.",
    subtitle: "Hier is je 10% korting op je eerste bestelling. Gebruik hem bij het afrekenen voordat hij verloopt.",
    codeLabel: "Jouw kortingscode",
    expiry: (t) => `⏱ Verloopt om ${t} — schiet op!`,
    cta: "Nu winkelen",
    footer: "© 2026 TheBrandCrate. Je ontvangt deze e-mail omdat je je hebt aangemeld voor onze nieuwsbrief.",
  },
};

export function WelcomeEmail({ code, expiryTime, locale = "en" }: Props) {
  const c = COPY[locale] ?? COPY.en;

  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logo}>THEBRANDCRATE</Text>
          </Section>
          <Hr style={divider} />
          <Section style={content}>
            <Text style={heading}>{c.welcome}</Text>
            <Text style={paragraph}>{c.subtitle}</Text>
            <Section style={codeBox}>
              <Text style={codeLabel}>{c.codeLabel}</Text>
              <Text style={codeText}>{code}</Text>
            </Section>
            <Text style={expiry}>{c.expiry(expiryTime)}</Text>
            <Row>
              <Column align="center">
                <Button href="https://thebrandcrate.com" style={button}>{c.cta}</Button>
              </Column>
            </Row>
          </Section>
          <Hr style={divider} />
          <Section>
            <Text style={footer}>{c.footer}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Export subject line for use in the API route
export function getEmailSubject(locale: Locale = "en"): string {
  return COPY[locale]?.subject ?? COPY.en.subject;
}

const body: React.CSSProperties = { backgroundColor: "#f5efe6", fontFamily: "Helvetica,'Helvetica Neue',Arial,sans-serif", margin: 0, padding: "40px 0" };
const container: React.CSSProperties = { backgroundColor: "#ffffff", maxWidth: "520px", margin: "0 auto" };
const logoSection: React.CSSProperties = { padding: "40px 40px 28px", textAlign: "center" };
const logo: React.CSSProperties = { fontSize: "22px", fontWeight: 700, letterSpacing: "-0.01em", color: "#1E2B15", margin: 0 };
const divider: React.CSSProperties = { borderColor: "#e8e0d5", margin: 0 };
const content: React.CSSProperties = { padding: "36px 40px" };
const heading: React.CSSProperties = { fontSize: "26px", fontWeight: 700, color: "#1E2B15", margin: "0 0 8px" };
const paragraph: React.CSSProperties = { fontSize: "14px", lineHeight: "1.6", color: "#666666", margin: "0 0 28px" };
const codeBox: React.CSSProperties = { backgroundColor: "#f5efe6", border: "2px dashed #1E2B15", padding: "20px 24px", textAlign: "center", marginBottom: "20px" };
const codeLabel: React.CSSProperties = { fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#888888", margin: "0 0 6px" };
const codeText: React.CSSProperties = { fontSize: "28px", fontWeight: 700, letterSpacing: "0.06em", color: "#1E2B15", margin: 0 };
const expiry: React.CSSProperties = { fontSize: "13px", color: "#888888", textAlign: "center", margin: "0 0 28px" };
const button: React.CSSProperties = { backgroundColor: "#1E2B15", color: "#ffffff", fontSize: "12px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", padding: "16px 48px", textDecoration: "none", display: "inline-block" };
const footer: React.CSSProperties = { fontSize: "11px", color: "#bbbbbb", textAlign: "center", padding: "24px 40px", margin: 0 };
