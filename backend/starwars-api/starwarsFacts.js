"use strict";

/**
 * Cyber x Star Wars intel. Each entry gets a stable 1-based `id` from its position in this
 * list, so append new facts at the end instead of inserting in the middle.
 *
 * Categories double as "item rarity" on the website, so keep them to this set:
 * patching, phishing, authentication, passwords, ransomware, network, backups, encryption,
 * social-engineering, zero-trust, monitoring, iam, cloud, incident-response, supply-chain,
 * devsecops.
 */
const FACTS = [
  {
    category: "patching",
    fact: "Just like the Death Star's exhaust port flaw, most breaches exploit known vulnerabilities. Patching is your Jedi duty.",
  },
  {
    category: "phishing",
    fact: "Phishing attacks lure victims like the Dark Side. Beware of emails offering free lightsabers.",
  },
  {
    category: "authentication",
    fact: "Two-factor authentication is like a lightsaber duel: you need both skill AND the Force to keep hackers out.",
  },
  {
    category: "ransomware",
    fact: "A ransomware attack is like Han Solo encased in carbonite. It freezes your data until a bounty is paid.",
  },
  {
    category: "network",
    fact: "Firewalls are your Millennium Falcon's shields. They defend against incoming threats, but only if someone keeps them up.",
  },
  {
    category: "passwords",
    fact: "A weak password is like a stormtrooper's aim: easily exploited by the enemy.",
  },
  {
    category: "backups",
    fact: "Data backups are the R2-D2 of cybersecurity. They save you when all seems lost.",
  },
  {
    category: "network",
    fact: "Using public Wi-Fi without a VPN is like walking into Mos Eisley unarmed. A dangerous gamble.",
  },
  {
    category: "social-engineering",
    fact: "Social engineering tricks you like a Jedi mind trick. Always question what doesn't feel right.",
  },
  {
    category: "encryption",
    fact: "Encrypted data is your rebel fleet in hyperspace: safe from the Empire's prying eyes.",
  },
  {
    category: "zero-trust",
    fact: "'These aren't the droids you're looking for' only works on guards who never verify. Zero trust means every droid gets checked, every time.",
  },
  {
    category: "monitoring",
    fact: "The Rebellion won at Scarif because they read the archives. Centralize your logs, and make sure someone actually reads them.",
  },
  {
    category: "iam",
    fact: "Vader force-choking admirals is a least-privilege failure. Give every account only the power it needs, even the Dark Lord's.",
  },
  {
    category: "supply-chain",
    fact: "The clone army shipped with Order 66 baked in. Vet your dependencies: a trusted supplier can still deliver a backdoor.",
  },
  {
    category: "incident-response",
    fact: "When Hoth was discovered, the Rebels evacuated in order because they had a plan. Write your incident response playbook before the AT-ATs arrive.",
  },
  {
    category: "cloud",
    fact: "Cloud City looked safe until Lando's deal with the Empire. Review third-party access and know your shared-responsibility model.",
  },
  {
    category: "patching",
    fact: "The second Death Star was 'fully operational' and still unpatched where it mattered. Build it secure, then keep it secure.",
  },
  {
    category: "passwords",
    fact: "Using 'password123' is like leaving the shield generator's back door open for Ewoks. Use a password manager.",
  },
  {
    category: "authentication",
    fact: "Han's stolen clearance code on Endor got through because it was 'an older code, but it checks out.' Expired credentials should never check out. Rotate and revoke.",
  },
  {
    category: "network",
    fact: "Segment your network like the Death Star's detention blocks. If a Wookiee gets loose in one, he should not reach the reactor.",
  },
  {
    category: "encryption",
    fact: "The Death Star plans were only stealable because they sat in the clear. Encrypt data in transit and at rest.",
  },
  {
    category: "social-engineering",
    fact: "Palpatine ran the longest social-engineering campaign in the galaxy: patient, trusted and catastrophic. Verify authority, even when it is the Chancellor.",
  },
  {
    category: "monitoring",
    fact: "Alderaan never got an alert. Build your detections before the superlaser starts charging.",
  },
  {
    category: "backups",
    fact: "Luke lost a hand and a lightsaber on Bespin and rebuilt both. Test your restores: a backup you have never restored is just hope.",
  },
  {
    category: "devsecops",
    fact: "The Rebels iterated: Y-wing, then X-wing, then A-wing. Ship small, test often, and fix the exhaust port in the next sprint.",
  },
  {
    category: "iam",
    fact: "Stormtroopers share armor, not identities. Shared accounts destroy accountability. One login per being.",
  },
  {
    category: "zero-trust",
    fact: "The Jedi Temple fell because clone troopers were trusted on sight. Authenticate the request, not the uniform.",
  },
  {
    category: "ransomware",
    fact: "Jabba's palace runs like a ransomware gang: pay up and you may still end up in the Sarlacc. Offline backups are your rescue party.",
  },
  {
    category: "phishing",
    fact: "A Sith holocron that 'only wants to help' is a malicious attachment. Do not open gifts from the Dark Side.",
  },
  {
    category: "incident-response",
    fact: "'I felt a great disturbance in the Force' is detection without response. Pair every alert with an owner and a playbook.",
  },
  {
    category: "cloud",
    fact: "A public S3 bucket is a Death Star with the blueprints taped to the hull. Block public access by default.",
  },
  {
    category: "supply-chain",
    fact: "The Trade Federation's entire droid army switched off when one control ship died. Know your single points of failure and your third-party dependencies.",
  },
  {
    category: "authentication",
    fact: "'May the Force be with you' is not a passphrase, but four random words are. Length beats complexity.",
  },
  {
    category: "network",
    fact: "The Hoth shield only stopped orbital bombardment, so the Empire walked in on foot. A firewall is not a strategy; defense in depth is.",
  },
  {
    category: "devsecops",
    fact: "Terraform is your Death Star blueprint, minus the exhaust port, if you scan it before you build it.",
  },
  {
    category: "monitoring",
    fact: "R2-D2 logged everything and it saved the galaxy more than once. Retain your logs.",
  },
];

module.exports = FACTS.map((entry, index) => ({ id: index + 1, ...entry }));
